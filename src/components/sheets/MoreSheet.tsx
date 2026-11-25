import React from "react";
import {
  BookOpen,
  Brain,
  Download,
  FolderOpen,
  Heart,
  MessageSquare,
  Settings,
  Sparkles,
} from "lucide-react";
import { useSitara } from "../../app/SitaraProvider";

export function MoreSheet() {
  const {
    navigate,
    openSheet,
    closeSheet,
    canInstall,
    installApp,
    isStandalone,
    agentDisplayName,
    state,
    handleToggleConnection,
  } = useSitara();

  const tiles = [
    {
      id: "workspace",
      title: "Workspace",
      desc: "Docs, PDFs & files",
      icon: FolderOpen,
      color: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20",
      onClick: () => navigate("workspace"),
    },
    {
      id: "settings",
      title: "Settings",
      desc: "Engines & appearance",
      icon: Settings,
      color: "text-amber-300 bg-amber-500/10 border-amber-500/20",
      onClick: () => navigate("settings"),
    },
    {
      id: "memory",
      title: "Memory core",
      desc: "Persistent recollections",
      icon: Brain,
      color: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20",
      onClick: () => navigate("memory"),
    },
    {
      id: "bond",
      title: "Bond matrix",
      desc: "Mood & affection",
      icon: Heart,
      color: "text-rose-300 bg-rose-500/10 border-rose-500/20",
      onClick: () => openSheet("bond"),
    },
    {
      id: "chat",
      title: "Chat logs",
      desc: "Full transcript",
      icon: MessageSquare,
      color: "text-pink-300 bg-pink-500/10 border-pink-500/20",
      onClick: () => navigate("chat"),
    },
    {
      id: "guide",
      title: "Voice triggers",
      desc: "Things to say aloud",
      icon: Sparkles,
      color: "text-purple-300 bg-purple-500/10 border-purple-500/20",
      onClick: () => openSheet("guide"),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.id}
              onClick={tile.onClick}
              className="p-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] text-left transition cursor-pointer"
            >
              <span className={`inline-flex p-2 rounded-xl border ${tile.color} mb-2`}>
                <Icon size={16} />
              </span>
              <span className="block text-xs font-semibold text-slate-100">{tile.title}</span>
              <span className="block text-[9px] font-mono text-slate-500 mt-0.5">{tile.desc}</span>
            </button>
          );
        })}

        {canInstall && !isStandalone && (
          <button
            onClick={installApp}
            className="p-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] hover:bg-emerald-500/10 text-left transition cursor-pointer"
          >
            <span className="inline-flex p-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 mb-2">
              <Download size={16} />
            </span>
            <span className="block text-xs font-semibold text-emerald-200">Install app</span>
            <span className="block text-[9px] font-mono text-emerald-500/80 mt-0.5">Add to home screen</span>
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
            <BookOpen size={15} />
          </span>
          <div>
            <div className="text-xs font-semibold text-slate-100">Sitara AI OS</div>
            <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
              v3.0 · core shell
            </div>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mt-3">
          Voice core, memory, workspace and the agent swarm now live in one responsive app shell.
          Built for Mangesh.
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
            Session · {state === "disconnected" ? "offline" : state}
          </span>
          {state !== "disconnected" && (
            <button
              onClick={() => {
                handleToggleConnection();
                closeSheet();
              }}
              className="text-[9px] font-mono uppercase tracking-wider text-rose-300 hover:text-rose-200 transition cursor-pointer"
            >
              End {agentDisplayName}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
