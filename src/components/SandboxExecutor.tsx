import React, { useState } from "react";
import { Play, RotateCcw, Copy, Check, Terminal, Code2, AlertTriangle, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SandboxExecutorProps {
  code: string;
  language: string;
  key?: React.Key;
}

export default function SandboxExecutor({ code: initialCode, language }: SandboxExecutorProps) {
  const [code, setCode] = useState(initialCode);
  const [isEditing, setIsEditing] = useState(false);
  const [output, setOutput] = useState<Array<{ type: "log" | "error" | "warn" | "info" | "system"; text: string }>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput([]);
    setHasRun(false);
  };

  const runCode = async () => {
    setIsRunning(true);
    setHasRun(true);
    setOutput([{ type: "system", text: "⚙️ Sandboxed environment initialized..." }]);

    const logs: Array<{ type: "log" | "error" | "warn" | "info" | "system"; text: string }> = [
      { type: "system", text: "⚙️ Sandboxed environment initialized..." }
    ];

    const appendLog = (type: "log" | "error" | "warn" | "info" | "system", text: string) => {
      logs.push({ type, text });
      // Update state in a way that respects multiple synchronous or asynchronous appends
      setOutput([...logs]);
    };

    // Construct sandboxed console interceptor
    const customConsole = {
      log: (...args: any[]) => {
        const msg = args
          .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
          .join(" ");
        appendLog("log", msg);
      },
      error: (...args: any[]) => {
        const msg = args
          .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
          .join(" ");
        appendLog("error", msg);
      },
      warn: (...args: any[]) => {
        const msg = args
          .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
          .join(" ");
        appendLog("warn", msg);
      },
      info: (...args: any[]) => {
        const msg = args
          .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
          .join(" ");
        appendLog("info", msg);
      }
    };

    // Custom setTimeout/setInterval wrappers to capture errors inside callbacks
    const customSetTimeout = (fn: Function, delay: number) => {
      return setTimeout(() => {
        try {
          fn();
        } catch (err: any) {
          customConsole.error(err.message || err);
        }
      }, delay);
    };

    const customSetInterval = (fn: Function, interval: number) => {
      return setInterval(() => {
        try {
          fn();
        } catch (err: any) {
          customConsole.error(err.message || err);
        }
      }, interval);
    };

    try {
      // Create a sandboxed dynamic async function
      // By wrapping in (async () => { ... })() we support top-level await!
      const runner = new Function(
        "console",
        "setTimeout",
        "setInterval",
        `
        return (async () => {
          try {
            ${code}
          } catch (err) {
            console.error(err.message || err);
          }
        })();
        `
      );

      // Execute and await in case they did top-level async
      await runner(customConsole, customSetTimeout, customSetInterval);
      appendLog("system", "🏁 Execution complete.");
    } catch (compileErr: any) {
      appendLog("error", `Compilation/Runtime Error: ${compileErr.message || compileErr}`);
    } finally {
      setIsRunning(false);
    }
  };

  const isJavaScript = language === "js" || language === "javascript" || language === "javascript-editable";

  return (
    <div className="my-3 w-full rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-md overflow-hidden shadow-xl font-mono text-[11px] text-left">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-white/5 border-b border-white/5 text-slate-300">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-pink-400 animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-wider font-mono">
            {language || "code"} sandbox
          </span>
          {isJavaScript && (
            <span className="text-[8px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-bold uppercase tracking-widest">
              Live run
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1.5">
          {/* Toggle Edit mode */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-1 rounded transition cursor-pointer hover:bg-white/5 ${
              isEditing ? "text-cyan-400 font-semibold" : "text-slate-400 hover:text-white"
            }`}
            title={isEditing ? "View Read-only Code" : "Modify code snippet"}
          >
            <Code2 size={13} />
          </button>

          {/* Copy Snippet */}
          <button
            onClick={handleCopy}
            className="p-1 rounded transition text-slate-400 hover:text-white cursor-pointer hover:bg-white/5"
            title="Copy Code"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>

          {/* Reset code block */}
          <button
            onClick={handleReset}
            className="p-1 rounded transition text-slate-400 hover:text-rose-400 cursor-pointer hover:bg-white/5"
            title="Reset code block"
          >
            <RotateCcw size={13} />
          </button>

          {isJavaScript && (
            <button
              onClick={runCode}
              disabled={isRunning}
              className="ml-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-[9px] uppercase tracking-wider font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play size={10} className="fill-emerald-400/10" />
              <span>{isRunning ? "Running..." : "Run"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Code Editor Viewport */}
      <div className="relative bg-black/30 p-3 min-h-[60px] max-h-[220px] overflow-y-auto scrollbar-none">
        {isEditing ? (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-transparent border-0 p-0 text-cyan-100 font-mono text-[11px] focus:ring-0 focus:outline-none resize-y min-h-[100px] leading-relaxed"
            placeholder="// Write or edit your sandboxed JavaScript here..."
            spellCheck={false}
          />
        ) : (
          <pre className="text-slate-200 whitespace-pre overflow-x-auto leading-relaxed select-text pr-2">
            <code>{code.trim()}</code>
          </pre>
        )}
      </div>

      {/* Output Console area */}
      {isJavaScript && hasRun && (
        <div className="bg-[#0b0c16] border-t border-white/5 p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[8px] uppercase tracking-widest text-slate-500 font-bold">
            <span className="flex items-center gap-1 text-cyan-400/80">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              Sandbox Console Output
            </span>
            <button
              onClick={() => {
                setOutput([]);
                setHasRun(false);
              }}
              className="hover:text-white transition flex items-center gap-1 cursor-pointer"
              title="Clear Console Output"
            >
              <RotateCcw size={10} />
              <span>Clear Console</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-[140px] overflow-y-auto font-mono text-slate-300 text-[10px] bg-black/60 rounded-xl p-3 border border-white/5 leading-relaxed scrollbar-none">
            {output.length === 0 ? (
              <span className="text-slate-500 italic block">Empty console output.</span>
            ) : (
              output.map((line, lIdx) => {
                let colorClass = "text-slate-300";
                if (line.type === "error") colorClass = "text-rose-400 border-l-2 border-rose-500 pl-1.5 bg-rose-500/5 py-0.5";
                else if (line.type === "warn") colorClass = "text-amber-400 border-l-2 border-amber-500 pl-1.5 bg-amber-500/5 py-0.5";
                else if (line.type === "system") colorClass = "text-slate-500 italic text-[9px] uppercase tracking-wider opacity-75";
                else if (line.type === "info") colorClass = "text-sky-400";

                return (
                  <div key={lIdx} className={`whitespace-pre-wrap font-mono break-all ${colorClass}`}>
                    {line.text}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
