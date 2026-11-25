import React from "react";
import { Download, Heart, Sparkles } from "lucide-react";
import { useSitara } from "../../app/SitaraProvider";
import { NAV_ITEMS } from "../../app/nav";
import { THEME_OPTIONS } from "../../app/theme";

export function SideRail() {
  const {
    activePage,
    navigate,
    openSheet,
    chatUnread,
    canInstall,
    installApp,
    themeColor,
  } = useSitara();

  const themeDot = THEME_OPTIONS.find((theme) => theme.key === themeColor)?.dot ?? "bg-cyan-400";

  return (
    <aside className="hidden md:flex flex-col shrink-0 w-[78px] lg:w-[232px] border-r border-white/[0.06] bg-[#040409]/90 backdrop-blur-2xl transition-[width] duration-300">
      <button
        onClick={() => navigate("home")}
        className="flex items-center gap-3 px-4 lg:px-5 h-16 shrink-0 cursor-pointer text-left"
        aria-label="Sitara home"
      >
        <span className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-pink-500 p-[1.5px] shadow-[0_0_20px_rgba(34,211,238,0.25)] shrink-0">
          <span className="w-full h-full rounded-2xl bg-[#05050b] flex items-center justify-center">
            <Sparkles size={16} className="text-cyan-300 animate-pulse" />
          </span>
        </span>
        <span className="hidden lg:flex flex-col leading-tight">
          <span className="text-xs font-bold tracking-[0.3em] text-white uppercase">Sitara</span>
          <span className="text-[8px] font-mono tracking-[0.18em] text-slate-500 uppercase">
            AI companion OS
          </span>
        </span>
      </button>

      <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-2.5 lg:px-3 py-3 flex flex-col gap-1" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              title={item.description}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-3 rounded-2xl px-2 lg:px-3 py-2.5 transition-all duration-200 cursor-pointer ${
                active
                  ? "bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
              )}
              <span
                className={`relative flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition ${
                  active ? "bg-cyan-500/15 text-cyan-300" : "bg-transparent"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.1 : 1.8} />
                {item.id === "chat" && chatUnread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-pink-500 text-[9px] font-bold text-white flex items-center justify-center">
                    {chatUnread > 9 ? "9+" : chatUnread}
                  </span>
                )}
              </span>
              <span className="hidden lg:flex flex-col min-w-0 text-left">
                <span className={`text-[12px] font-sans font-medium tracking-wide ${active ? "text-white" : ""}`}>
                  {item.label}
                </span>
                <span className="text-[9px] font-mono tracking-wider text-slate-600 truncate">
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="shrink-0 px-2.5 lg:px-3 py-3 border-t border-white/[0.06] flex flex-col gap-1.5">
        <button
          onClick={() => openSheet("bond")}
          className="flex items-center gap-3 rounded-2xl px-2 lg:px-3 py-2 text-slate-500 hover:text-rose-200 hover:bg-rose-500/5 transition cursor-pointer"
          title="Bond matrix"
        >
          <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
            <Heart size={17} />
          </span>
          <span className="hidden lg:block text-[12px] font-sans">Bond matrix</span>
        </button>

        {canInstall && (
          <button
            onClick={installApp}
            className="flex items-center gap-3 rounded-2xl px-2 lg:px-3 py-2 text-emerald-300/80 hover:text-emerald-200 hover:bg-emerald-500/10 transition cursor-pointer"
            title="Install Sitara app"
          >
            <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
              <Download size={17} />
            </span>
            <span className="hidden lg:block text-[12px] font-sans">Install app</span>
          </button>
        )}

        <div className="hidden lg:flex items-center justify-between px-3 pt-1">
          <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-slate-600">v3.0 · core</span>
          <span className={`w-2 h-2 rounded-full ${themeDot} shadow-[0_0_8px_currentColor]`} />
        </div>
      </div>
    </aside>
  );
}
