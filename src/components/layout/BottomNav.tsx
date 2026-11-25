import React from "react";
import { MoreHorizontal } from "lucide-react";
import { useSitara } from "../../app/SitaraProvider";
import { MOBILE_PRIMARY_PAGES, getNavItem } from "../../app/nav";

export function BottomNav() {
  const { activePage, navigate, openSheet, chatUnread } = useSitara();
  const moreActive = activePage === "workspace" || activePage === "settings";

  return (
    <nav
      className="md:hidden shrink-0 w-full border-t border-white/[0.07] bg-[#05050b]/95 backdrop-blur-2xl pb-[max(0.35rem,env(safe-area-inset-bottom))]"
      aria-label="Primary navigation"
    >
      <div className="grid grid-cols-5 max-w-lg mx-auto">
        {MOBILE_PRIMARY_PAGES.map((pageId) => {
          const item = getNavItem(pageId);
          const Icon = item.icon;
          const active = activePage === pageId;
          return (
            <button
              key={pageId}
              onClick={() => navigate(pageId)}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-col items-center justify-center gap-1 pt-2 pb-1 min-h-[56px] cursor-pointer select-none"
            >
              <span
                className={`relative flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-cyan-500/15 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.12)]"
                    : "text-slate-500"
                }`}
              >
                <Icon size={19} strokeWidth={active ? 2.1 : 1.8} />
                {pageId === "chat" && chatUnread > 0 && (
                  <span className="absolute -top-1 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-pink-500 text-[9px] font-bold text-white flex items-center justify-center">
                    {chatUnread > 9 ? "9+" : chatUnread}
                  </span>
                )}
              </span>
              <span
                className={`text-[9px] font-mono tracking-wider ${
                  active ? "text-cyan-300 font-semibold" : "text-slate-500"
                }`}
              >
                {item.shortLabel}
              </span>
              {active && (
                <span className="absolute top-0 w-8 h-[2px] rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}
            </button>
          );
        })}

        <button
          onClick={() => openSheet("more")}
          aria-label="More sections"
          className="relative flex flex-col items-center justify-center gap-1 pt-2 pb-1 min-h-[56px] cursor-pointer select-none"
        >
          <span
            className={`flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200 ${
              moreActive ? "bg-white/10 text-white" : "text-slate-500"
            }`}
          >
            <MoreHorizontal size={20} />
          </span>
          <span
            className={`text-[9px] font-mono tracking-wider ${
              moreActive ? "text-white font-semibold" : "text-slate-500"
            }`}
          >
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
