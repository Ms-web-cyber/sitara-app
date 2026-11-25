import React from "react";
import { Home, PhoneOff } from "lucide-react";
import { useSitara } from "../../app/SitaraProvider";

export function LivePill() {
  const { state, activePage, navigate, handleToggleConnection, agentDisplayName } = useSitara();

  if (state === "disconnected" || activePage === "home") return null;

  const label =
    state === "speaking" ? "Speaking" : state === "listening" ? "Listening" : "Connecting";
  const color =
    state === "speaking"
      ? "text-purple-300 border-purple-500/30"
      : state === "listening"
        ? "text-cyan-300 border-cyan-500/30"
        : "text-amber-300 border-amber-500/30";

  return (
    <div className="fixed z-50 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 bottom-[calc(4.55rem+env(safe-area-inset-bottom))] md:bottom-6 pointer-events-none">
      <div
        className={`pointer-events-auto flex items-center gap-2.5 pl-3 pr-1.5 py-1.5 rounded-full border bg-[#07070f]/90 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] ${color}`}
      >
        <span className="relative flex w-2 h-2">
          <span className="absolute inline-flex w-full h-full rounded-full bg-current opacity-50 animate-ping" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-current" />
        </span>

        <span className="flex items-end gap-[2px] h-3.5" aria-hidden="true">
          {[0, 1, 2, 3].map((bar) => (
            <span
              key={bar}
              className="live-bar w-[2px] rounded-full bg-current"
              style={{ animationDelay: `${bar * 120}ms`, height: `${6 + (bar % 2) * 4}px` }}
            />
          ))}
        </span>

        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-1.5 text-[10px] font-mono tracking-wide uppercase hover:opacity-80 transition cursor-pointer"
          title="Return to core stage"
        >
          <span className="text-slate-400">{agentDisplayName}</span>
          <span className="text-slate-600">·</span>
          <span className="font-semibold">{label}</span>
        </button>

        <button
          onClick={() => navigate("home")}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          title="Open core"
          aria-label="Open core"
        >
          <Home size={13} />
        </button>

        <button
          onClick={handleToggleConnection}
          className="p-1.5 rounded-full text-rose-300 hover:text-white hover:bg-rose-500/60 transition cursor-pointer"
          title="End live session"
          aria-label="End live session"
        >
          <PhoneOff size={13} />
        </button>
      </div>
    </div>
  );
}
