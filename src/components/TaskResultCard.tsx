import React from "react";
import { CheckCircle2, Clock, Loader2, Sparkles, Terminal, Shield, ArrowUpRight, Cpu } from "lucide-react";
import { motion } from "motion/react";

interface TaskResultCardProps {
  agentName: string;
  taskTitle: string;
  taskStatus: string; // SUCCESS, PROCESSING, PENDING, FAILED, etc.
  resultMarkdown: string;
  timestamp?: Date;
}

const parseInlineStyles = (text: string) => {
  const parts = [];
  let currentIdx = 0;
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const matchStr = match[0];
    const matchIdx = match.index;
    
    if (matchIdx > currentIdx) {
      parts.push(text.substring(currentIdx, matchIdx));
    }
    
    if (matchStr.startsWith("**") && matchStr.endsWith("**")) {
      parts.push(
        <strong key={matchIdx} className="font-semibold text-white">
          {matchStr.slice(2, -2)}
        </strong>
      );
    } else if (matchStr.startsWith("`") && matchStr.endsWith("`")) {
      parts.push(
        <code key={matchIdx} className="px-1 py-0.5 rounded bg-slate-950 border border-white/10 text-cyan-300 font-mono text-[10px]">
          {matchStr.slice(1, -1)}
        </code>
      );
    }
    
    currentIdx = regex.lastIndex;
  }
  
  if (currentIdx < text.length) {
    parts.push(text.substring(currentIdx));
  }
  
  return parts.length > 0 ? parts : text;
};

const formatResultText = (text: string) => {
  if (!text) return null;
  const lines = text.split("\n");
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  const renderedElements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        renderedElements.push(
          <div key={`code-${i}`} className="my-2 p-2.5 rounded-lg bg-slate-950 border border-white/10 font-mono text-[10px] text-cyan-200 overflow-x-auto whitespace-pre">
            {codeBlockLines.join("\n")}
          </div>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        // Start of code block
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    if (line.startsWith("### ")) {
      renderedElements.push(
        <h4 key={i} className="text-xs font-bold text-slate-200 mt-3 mb-1.5 tracking-wide border-b border-white/5 pb-0.5">
          {line.replace("### ", "")}
        </h4>
      );
    } else if (line.startsWith("## ")) {
      renderedElements.push(
        <h3 key={i} className="text-sm font-bold text-slate-100 mt-4 mb-2 tracking-wide">
          {line.replace("## ", "")}
        </h3>
      );
    } else if (line.startsWith("# ")) {
      renderedElements.push(
        <h2 key={i} className="text-base font-extrabold text-white mt-5 mb-2.5 tracking-wide">
          {line.replace("# ", "")}
        </h2>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const content = line.substring(2);
      renderedElements.push(
        <div key={i} className="flex items-start gap-1.5 ml-1.5 my-1 text-slate-300">
          <span className="text-cyan-400 font-mono text-[11px] select-none mt-0.5">•</span>
          <span className="leading-relaxed flex-1">{parseInlineStyles(content)}</span>
        </div>
      );
    } else if (line.trim() === "") {
      renderedElements.push(<div key={i} className="h-1.5" />);
    } else {
      renderedElements.push(
        <p key={i} className="my-1 text-slate-300 leading-relaxed">
          {parseInlineStyles(line)}
        </p>
      );
    }
  }

  // Handle unclosed code block safely
  if (inCodeBlock && codeBlockLines.length > 0) {
    renderedElements.push(
      <div key={`code-unclosed`} className="my-2 p-2.5 rounded-lg bg-slate-950 border border-white/10 font-mono text-[10px] text-cyan-200 overflow-x-auto whitespace-pre">
        {codeBlockLines.join("\n")}
      </div>
    );
  }

  return renderedElements;
};

export const TaskResultCard: React.FC<TaskResultCardProps> = ({
  agentName,
  taskTitle,
  taskStatus,
  resultMarkdown,
  timestamp
}) => {
  const isSuccess = taskStatus.toUpperCase() === "SUCCESS" || taskStatus.toUpperCase() === "COMPLETED";
  const isProcessing = taskStatus.toUpperCase() === "PROCESSING" || taskStatus.toUpperCase() === "RUNNING";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative w-full max-w-[95%] rounded-2xl border p-4 shadow-xl overflow-hidden backdrop-blur-md transition-all duration-300 ${
        isSuccess
          ? "bg-emerald-950/15 border-emerald-500/30 hover:border-emerald-500/50 shadow-emerald-950/10"
          : isProcessing
          ? "bg-cyan-950/15 border-cyan-500/30 hover:border-cyan-500/50 shadow-cyan-950/10"
          : "bg-slate-900/95 border-white/10 hover:border-white/20"
      }`}
    >
      {/* Absolute Ambient Glows */}
      {isSuccess && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none animate-pulse duration-[4000ms]" />
      )}
      {isProcessing && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none animate-pulse duration-[3000ms]" />
      )}

      {/* Modern Scanning Bar for Processing */}
      {isProcessing && (
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: "250%" }}
          transition={{
            repeat: Infinity,
            duration: 2.5,
            ease: "linear",
          }}
          className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none"
        />
      )}

      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          {/* Animated Icon Base */}
          <div className="relative">
            {isSuccess ? (
              <div className="relative flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30"
                >
                  <CheckCircle2 size={16} className="animate-pulse" />
                </motion.div>
                <span className="absolute -inset-0.5 rounded-lg bg-emerald-500/20 blur animate-ping pointer-events-none duration-1000" />
              </div>
            ) : isProcessing ? (
              <div className="relative flex items-center justify-center">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
                  <Loader2 size={16} className="animate-spin text-cyan-400" />
                </div>
                <span className="absolute -inset-0.5 rounded-lg bg-cyan-500/15 blur animate-pulse pointer-events-none" />
              </div>
            ) : (
              <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                <Cpu size={16} />
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-extrabold tracking-wider text-slate-400 uppercase flex items-center gap-1">
              <Terminal size={10} className="text-slate-500" />
              {agentName}
            </span>
            <h3 className="text-xs font-bold text-white tracking-wide mt-0.5 line-clamp-1">
              {taskTitle}
            </h3>
          </div>
        </div>

        {/* Status Pill with Custom Animations */}
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={
              isSuccess
                ? { scale: [1, 1.05, 1] }
                : isProcessing
                ? { opacity: [0.7, 1, 0.7] }
                : {}
            }
            transition={{
              repeat: Infinity,
              duration: isSuccess ? 3 : 1.5,
              ease: "easeInOut",
            }}
            className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-widest border uppercase flex items-center gap-1 shadow-sm ${
              isSuccess
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : isProcessing
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            {isSuccess && <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />}
            {isProcessing && <Loader2 size={8} className="animate-spin" />}
            {taskStatus}
          </motion.div>
        </div>
      </div>

      {/* Card Content (Markdown) */}
      <div className="text-[11px] text-slate-300 space-y-1 overflow-hidden">
        {formatResultText(resultMarkdown)}
      </div>

      {/* Card Footer */}
      <div className="mt-3.5 pt-2 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest">
        <span className="flex items-center gap-1">
          <Sparkles size={8} className={isSuccess ? "text-emerald-400 animate-spin" : isProcessing ? "text-cyan-400 animate-pulse" : "text-slate-500"} />
          Sitara Cognitive Core Link
        </span>
        {timestamp && (
          <span>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </div>
    </motion.div>
  );
};
