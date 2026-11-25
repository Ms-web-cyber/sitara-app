import React from "react";
import { MessageSquare, Mic, Paperclip, Download, Loader2, Sparkles, Send, Trash2, WifiOff } from "lucide-react";
import { useSitara } from "../app/SitaraProvider";
import { Page } from "../components/layout/Page";
import { TaskResultCard } from "../components/TaskResultCard";
import SandboxExecutor from "../components/SandboxExecutor";

function renderMessageText(text: string) {
  if (!text) return null;

  const regex = /```(\w*)\n([\s\S]*?)```/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let idx = 0;

  while ((match = regex.exec(text)) !== null) {
    const lang = match[1]?.toLowerCase() || "";
    const code = match[2];

    if (match.index > lastIndex) {
      const segment = text.substring(lastIndex, match.index);
      elements.push(
        <p key={`text-${idx++}`} className="whitespace-pre-wrap leading-relaxed">
          {segment}
        </p>
      );
    }

    elements.push(<SandboxExecutor key={`sandbox-${idx++}`} code={code} language={lang} />);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    const segment = text.substring(lastIndex);
    elements.push(
      <p key={`text-${idx++}`} className="whitespace-pre-wrap leading-relaxed">
        {segment}
      </p>
    );
  }

  return <div className="space-y-2">{elements}</div>;
}

const SUGGESTIONS = [
  "Tum kaise ho Sitara? Aaj kya plan hai?",
  "Design a dark neon landing page for my app",
  "Remember: my favourite language is TypeScript",
];

export default function ChatPage() {
  const {
    chatHistory,
    typedMessage,
    setTypedMessage,
    handleSendTypedMessage,
    handleAttachImage,
    handleGenerateImageDirectly,
    clearChat,
    state,
    agentDisplayName,
    navigate,
  } = useSitara();

  const endRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const isLive = state !== "disconnected";

  return (
    <Page
      title="Chat"
      subtitle={`${agentDisplayName} · ${chatHistory.length} messages`}
      icon={<MessageSquare size={17} />}
      scroll={false}
      padded={false}
      actions={
        <>
          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-[9px] font-mono uppercase tracking-wider text-slate-400">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLive ? "bg-cyan-400 animate-pulse" : "bg-slate-600"
              }`}
            />
            {isLive ? "Live voice" : "Text mode"}
          </span>
          {chatHistory.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Clear the full chat transcript?")) clearChat();
              }}
              className="p-2 rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 hover:text-rose-300 hover:border-rose-500/30 transition cursor-pointer"
              title="Clear chat logs"
              aria-label="Clear chat logs"
            >
              <Trash2 size={15} />
            </button>
          )}
        </>
      }
    >
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-5 space-y-4">
            {chatHistory.length === 0 ? (
              <div className="min-h-[52vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-indigo-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <Sparkles size={22} className="text-cyan-300 animate-pulse" />
                </div>
                <h2 className="text-sm font-semibold tracking-wide text-slate-200">
                  Start a conversation
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                  Type below, or wake the core for a real-time voice call. Messages, images and task
                  results all land here.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-sm mt-5">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSendTypedMessage(suggestion)}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] text-[11px] text-slate-300 transition cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatHistory.map((msg, idx) => {
                const isTaskResult = msg.isTaskResult || msg.text?.startsWith("⚙️ [");
                let taskData = null;

                if (isTaskResult) {
                  if (msg.isTaskResult) {
                    taskData = {
                      agentName: msg.agentName,
                      taskTitle: msg.taskTitle,
                      taskStatus: msg.taskStatus,
                      resultMarkdown: msg.resultMarkdown,
                    };
                  } else {
                    try {
                      const match = msg.text.match(/⚙️\s*\[(.*?) - (.*?)\]\s*(.*?)\n\n([\s\S]*)/);
                      if (match) {
                        taskData = {
                          agentName: match[1],
                          taskStatus: match[2],
                          taskTitle: match[3],
                          resultMarkdown: match[4],
                        };
                      }
                    } catch (e) {
                      console.error("Failed to parse task data from text:", e);
                    }
                  }
                }

                return (
                  <div
                    key={msg.id || idx}
                    className={`flex flex-col w-full ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div className="text-[9px] text-slate-600 font-mono mb-1 uppercase tracking-wider">
                      {msg.role === "user" ? "You" : agentDisplayName}
                    </div>

                    {taskData ? (
                      <TaskResultCard
                        agentName={taskData.agentName}
                        taskTitle={taskData.taskTitle}
                        taskStatus={taskData.taskStatus}
                        resultMarkdown={taskData.resultMarkdown}
                        timestamp={msg.timestamp}
                      />
                    ) : (
                      <div
                        className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 leading-relaxed text-xs shadow-md border ${
                          msg.role === "user"
                            ? "bg-pink-500/10 border-pink-500/20 text-pink-50"
                            : "bg-slate-900/90 border-white/[0.06] text-slate-100"
                        }`}
                      >
                        {msg.text && renderMessageText(msg.text)}

                        {msg.image && (
                          <div className="mt-2 rounded-xl overflow-hidden border border-white/10 shadow-lg relative group">
                            <img
                              src={msg.image}
                              alt="Visual attachment"
                              className={`max-h-[260px] w-full ${
                                msg.image.includes("image/svg+xml")
                                  ? "object-contain bg-slate-950/80 p-2"
                                  : "object-cover"
                              }`}
                              referrerPolicy="no-referrer"
                            />
                            <a
                              href={msg.image}
                              download={`sitara-asset-${Date.now()}.jpg`}
                              className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-950/80 text-white border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition duration-150"
                              title="Download asset"
                            >
                              <Download size={12} />
                            </a>
                          </div>
                        )}

                        {msg.isGeneratingImage && (
                          <div className="flex items-center gap-2 text-pink-400/80 text-[10px] font-mono mt-1.5">
                            <Loader2 size={12} className="animate-spin" />
                            <span>Generating asset...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>
        </div>

        <div className="shrink-0 border-t border-white/[0.06] bg-[#05050b]/90 backdrop-blur-xl">
          <div className="mx-auto w-full max-w-3xl px-3 sm:px-6 py-3">
            {!isLive && (
              <div className="flex items-center gap-2 mb-2 px-1 text-[9px] font-mono uppercase tracking-wider text-slate-500">
                <WifiOff size={11} />
                Text mode · server-side Gemini
                <button
                  onClick={() => navigate("home")}
                  className="ml-auto text-cyan-400/80 hover:text-cyan-300 transition"
                >
                  Core tab se voice on karo
                </button>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-2xl p-1">
              <input
                type="file"
                id="chat-file-attachment"
                accept="image/*"
                onChange={handleAttachImage}
                className="hidden"
              />

              <button
                onClick={() => document.getElementById("chat-file-attachment")?.click()}
                className="p-2.5 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition cursor-pointer shrink-0"
                title="Attach image"
                aria-label="Attach image"
              >
                <Paperclip size={16} />
              </button>

              <input
                type="text"
                placeholder="Type a message or ask Sitara..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendTypedMessage();
                  }
                }}
                className="flex-1 bg-transparent border-none text-white text-xs px-1 py-2 focus:outline-none placeholder-white/20 font-sans min-w-0"
              />

              <button
                onClick={() => handleGenerateImageDirectly()}
                disabled={!typedMessage.trim()}
                className={`p-2.5 rounded-xl border transition shrink-0 ${
                  typedMessage.trim()
                    ? "bg-pink-500/15 border-pink-500/30 text-pink-300 hover:bg-pink-500/25 cursor-pointer"
                    : "bg-transparent border-transparent text-slate-600 cursor-not-allowed"
                }`}
                title="Generate image"
                aria-label="Generate image"
              >
                <Sparkles size={16} />
              </button>

              <button
                onClick={() => handleSendTypedMessage()}
                disabled={!typedMessage.trim()}
                className={`p-2.5 rounded-xl border transition shrink-0 ${
                  typedMessage.trim()
                    ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 cursor-pointer"
                    : "bg-transparent border-transparent text-slate-600 cursor-not-allowed"
                }`}
                title="Send message"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 px-1 text-[8px] font-mono uppercase tracking-wider text-slate-600">
              <span className="flex items-center gap-1">
                <Mic size={9} />
                {isLive ? "Voice session linked" : "Mic off"}
              </span>
              <span>Imagen core · PDF/DOCX tools</span>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
