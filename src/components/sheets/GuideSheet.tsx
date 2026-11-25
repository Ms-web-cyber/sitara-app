import React from "react";
import { Compass, Mic, Sparkles } from "lucide-react";

const TRIGGERS = [
  {
    quote: "Sitara, change the atmosphere of your core to crimson",
    note: "Shifts the ambient theme of the whole app",
  },
  {
    quote: "Draw a cyberpunk Mumbai skyline at night",
    note: "Generates an image inside the chat",
  },
  {
    quote: "Open youtube.com and find me a lo-fi mix",
    note: "Uses the web / YouTube tools",
  },
  {
    quote: "Save this in memory: my new project is called Sitara",
    note: "Writes a persistent recollection",
  },
  {
    quote: "Create a PDF report about today's plan",
    note: "Compiles a real PDF into your workspace",
  },
];

export function GuideSheet() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-2xl border border-cyan-500/15 bg-cyan-500/[0.04] p-4">
        <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 shrink-0">
          <Mic size={16} />
        </span>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Wake the core from the Home tab, then speak naturally. Sitara can switch themes, generate
          images, remember facts, search the web and build documents.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {TRIGGERS.map((trigger, index) => (
          <div
            key={trigger.quote}
            className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
          >
            <span className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-mono flex items-center justify-center shrink-0">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-slate-200 leading-relaxed">&ldquo;{trigger.quote}&rdquo;</p>
              <p className="text-[9px] font-mono uppercase tracking-wider text-slate-500 mt-1">
                {trigger.note}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-wider text-slate-500">
        <Compass size={12} />
        More tools arrive on the Agents tab
        <Sparkles size={12} className="text-pink-400" />
      </div>
    </div>
  );
}
