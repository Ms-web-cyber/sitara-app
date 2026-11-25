import React from "react";

interface PageProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  maxWidth?: string;
  contentClassName?: string;
}

/**
 * Standard page frame used by every non-core screen.
 * Mobile: header + scrollable body above the bottom nav.
 * Desktop: header + scrollable body beside the side rail.
 */
export function Page({
  title,
  subtitle,
  icon,
  actions,
  children,
  scroll = true,
  padded = true,
  maxWidth = "max-w-6xl",
  contentClassName = "",
}: PageProps) {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <header className="shrink-0 border-b border-white/[0.06] bg-[#05050b]/70 backdrop-blur-xl">
        <div
          className={`mx-auto w-full ${maxWidth} px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04] text-cyan-300">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-[15px] sm:text-lg font-display font-semibold tracking-tight text-white truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      </header>

      <div
        className={
          scroll
            ? "flex-1 min-h-0 overflow-y-auto overscroll-contain"
            : "flex-1 min-h-0 flex flex-col"
        }
      >
        {padded ? (
          <div
            className={`mx-auto w-full ${maxWidth} px-4 sm:px-6 lg:px-8 ${
              scroll
                ? "py-5 pb-8"
                : "py-4 flex flex-col flex-1 min-h-0"
            } ${contentClassName}`}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
