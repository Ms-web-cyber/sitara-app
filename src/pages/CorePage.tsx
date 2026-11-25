import React from "react";
import {
  Brain,
  CircleAlert,
  Compass,
  FolderOpen,
  Heart,
  MessageSquare,
  Mic,
  Pause,
  Play,
  Power,
  Settings,
  Sparkles,
  Square,
  Video,
  Volume2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSitara } from "../app/SitaraProvider";
import { SitaraCoreVisualizer } from "../components/SitaraCoreVisualizer";
import { getAmbientStyles } from "../app/theme";

export default function CorePage() {
  const {
    state,
    session,
    themeColor,
    activeEmotion,
    characterState,
    currentMood,
    modelCaption,
    userCaption,
    errorText,
    setErrorText,
    navigate,
    openSheet,
    handleToggleConnection,
    isScreenSharing,
    isScreenSharingPaused,
    stopScreenSharing,
    pauseScreenSharing,
    resumeScreenSharing,
    agentDisplayName,
    isNemotronEnabled,
    screenVisionMode,
  } = useSitara();

  const isLive = state !== "disconnected";
  const captionType = modelCaption ? "model" : userCaption ? "user" : "status";

  const statusText = modelCaption
    ? modelCaption
    : userCaption
      ? userCaption
      : state === "listening"
        ? "Listening... speak freely"
        : state === "connecting"
          ? "Materializing presence links..."
          : "Tap the core to wake Sitara";

  const quickActions = [
    { label: "Memory", icon: Brain, onClick: () => navigate("memory"), color: "text-cyan-300" },
    { label: "Files", icon: FolderOpen, onClick: () => navigate("workspace"), color: "text-indigo-300" },
    { label: "Bond", icon: Heart, onClick: () => openSheet("bond"), color: "text-rose-300" },
    { label: "Settings", icon: Settings, onClick: () => navigate("settings"), color: "text-amber-300" },
  ];

  return (
    <div
      id="sitara-holographic-desktop"
      className={`relative flex-1 min-h-0 overflow-hidden bg-gradient-to-b ${getAmbientStyles(themeColor)}`}
    >
      <div className="absolute top-[-12%] left-[-12%] w-[440px] h-[440px] bg-purple-900/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-12%] w-[520px] h-[520px] bg-cyan-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[8%] w-[280px] h-[280px] bg-indigo-800/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:34px_34px] pointer-events-none opacity-40" />

      {/* Holographic character stage */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <SitaraCoreVisualizer
          session={session}
          state={state}
          themeColor={themeColor}
          activeEmotion={activeEmotion}
          characterState={characterState}
          currentMood={currentMood}
        />
      </div>

      {/* Readability gradient behind captions + dock */}
      <div className="absolute bottom-0 inset-x-0 h-[55%] bg-gradient-to-t from-[#020205] via-[#020205]/75 to-transparent pointer-events-none z-[5]" />

      <div className="relative z-10 h-full flex flex-col min-h-0">
        <header className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 py-3.5">
          <div className="flex flex-col items-start min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-[0.4em] text-white/60 uppercase font-sans">
                Sitara
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLive ? "bg-cyan-400 animate-pulse" : "bg-white/15"
                }`}
              />
              <span className="hidden sm:inline text-[9px] font-mono uppercase tracking-[0.18em] text-slate-500">
                {isLive ? "Live core" : "Standby"}
              </span>
            </div>
            <span className="text-[8px] font-mono tracking-widest text-white/25 uppercase mt-0.5 truncate">
              Developed by <span className="text-pink-400/80 font-semibold">Mangesh</span>
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            {isNemotronEnabled && (
              <span className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[8px] font-mono font-bold text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                NEMOTRON 3
              </span>
            )}
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  title={action.label}
                  aria-label={action.label}
                  className={`p-2 sm:p-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.07] transition cursor-pointer ${action.color}`}
                >
                  <Icon size={15} />
                </button>
              );
            })}
          </div>
        </header>

        <main className="flex-1 min-h-0 flex flex-col justify-end px-4 sm:px-6 pb-1">
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-2.5">
            {isScreenSharing && (
              <div className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-cyan-500/20 bg-cyan-950/30 backdrop-blur-md">
                <button
                  onClick={() => openSheet("share")}
                  className="flex items-center gap-2 min-w-0 text-left cursor-pointer"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isScreenSharingPaused ? "bg-amber-400" : "bg-cyan-400 animate-pulse"
                    }`}
                  />
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-cyan-200 truncate">
                    {isScreenSharingPaused ? "Vision paused" : "Screen vision active"}
                  </span>
                  <span className="hidden sm:inline text-[8px] font-mono text-cyan-500/80">
                    {screenVisionMode ? "auto-analysis on" : "analysis off"}
                  </span>
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={isScreenSharingPaused ? resumeScreenSharing : pauseScreenSharing}
                    className="p-1.5 rounded-lg text-cyan-200 hover:bg-cyan-500/15 transition cursor-pointer"
                    title={isScreenSharingPaused ? "Resume" : "Pause"}
                  >
                    {isScreenSharingPaused ? <Play size={11} /> : <Pause size={11} />}
                  </button>
                  <button
                    onClick={stopScreenSharing}
                    className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-500/15 transition cursor-pointer"
                    title="Stop sharing"
                  >
                    <Square size={9} />
                  </button>
                </div>
              </div>
            )}

            <AnimatePresence>
              {errorText && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="w-full flex items-start gap-2.5 p-3 rounded-xl border border-rose-500/20 bg-rose-950/50 backdrop-blur-xl text-left"
                >
                  <CircleAlert size={15} className="text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-rose-300 font-mono">
                      Core error protocol
                    </p>
                    <p className="text-[11px] text-rose-100/90 mt-1 leading-relaxed break-words">
                      {errorText}
                    </p>
                    {(errorText.toLowerCase().includes("permission") ||
                      errorText.toLowerCase().includes("denied") ||
                      errorText.toLowerCase().includes("notallowed") ||
                      errorText.toLowerCase().includes("microphone")) && (
                      <a
                        href={window.location.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] no-underline transition"
                      >
                        Open in new tab for mic access
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => setErrorText(null)}
                    className="p-1 rounded-lg text-rose-300/70 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
                    aria-label="Dismiss error"
                  >
                    <X size={13} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              id="cinematic-subtitles"
              className="w-full min-h-[5.5rem] max-h-[32vh] overflow-y-auto overscroll-contain flex flex-col items-center justify-end text-center px-1 pointer-events-none"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={captionType}
                  initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center justify-end w-full"
                >
                  {captionType === "model" && (
                    <h2 className="text-lg sm:text-2xl font-light text-white leading-relaxed tracking-wide font-display max-w-xl drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)] whitespace-pre-wrap">
                      {statusText}
                    </h2>
                  )}

                  {captionType === "user" && (
                    <span className="px-3.5 py-2 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 font-mono text-[11px] sm:text-xs tracking-wide max-w-md leading-relaxed">
                      &ldquo;{statusText}&rdquo;
                    </span>
                  )}

                  {captionType === "status" && (
                    <span className="px-4 py-2 rounded-full border border-white/[0.07] bg-slate-900/70 backdrop-blur-md text-[9px] sm:text-[10px] uppercase tracking-[0.22em] font-medium text-slate-300 font-mono flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          state === "listening"
                            ? "bg-cyan-400 animate-pulse"
                            : state === "connecting"
                              ? "bg-amber-400 animate-pulse"
                              : "bg-slate-500"
                        }`}
                      />
                      {statusText}
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              onClick={() => openSheet("guide")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.06] bg-black/25 backdrop-blur-md text-[9px] font-mono uppercase tracking-wider text-slate-400 hover:text-white hover:border-white/20 transition cursor-pointer"
            >
              <Compass size={10} className="text-indigo-400" />
              Voice triggers
            </button>
          </div>
        </main>

        <footer className="shrink-0 px-4 sm:px-6 pb-2 pt-1">
          <div className="w-full max-w-md mx-auto flex flex-col items-center gap-3">
            <div className="flex items-end justify-center gap-[3px] h-7 w-40" aria-hidden="true">
              {Array.from({ length: 9 }).map((_, idx) => (
                <span
                  key={idx}
                  className={`wave-bar w-[3px] rounded-full ${
                    state === "speaking"
                      ? "bg-purple-400"
                      : state === "listening"
                        ? "bg-cyan-400"
                        : "bg-white/15"
                  }`}
                  style={{
                    height: `${8 + (idx % 3) * 5}px`,
                    animationDelay: `${idx * 90}ms`,
                    animationPlayState: isLive ? "running" : "paused",
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-5 sm:gap-7">
              <button
                onClick={() => openSheet("share")}
                className={`relative p-3.5 rounded-full border transition-all duration-300 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 ${
                  isScreenSharing
                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.25)]"
                    : "bg-white/[0.04] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]"
                }`}
                title="Share vision"
                aria-label="Share vision"
              >
                <Video size={19} />
                {isScreenSharing && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#05050b] ${
                      isScreenSharingPaused ? "bg-amber-400" : "bg-cyan-400 animate-pulse"
                    }`}
                  />
                )}
              </button>

              <button
                onClick={handleToggleConnection}
                className={`relative w-[74px] h-[74px] sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer ${
                  state === "disconnected"
                    ? "bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-400/30 text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.15)] hover:scale-105 active:scale-95"
                    : state === "listening"
                      ? "bg-cyan-500/15 border border-cyan-400/70 text-cyan-100 shadow-[0_0_34px_rgba(34,211,238,0.3)] animate-pulse scale-105"
                      : state === "speaking"
                        ? "bg-purple-500/85 border border-purple-300/80 text-white shadow-[0_0_34px_rgba(168,85,247,0.4)] scale-105 animate-pulse"
                        : "bg-amber-600 border border-amber-300 text-white animate-spin"
                }`}
                title={state === "disconnected" ? `Wake ${agentDisplayName}` : "Sleep core"}
                aria-label={state === "disconnected" ? "Start live session" : "End live session"}
              >
                {state === "disconnected" ? (
                  <Power size={25} className="opacity-90" />
                ) : state === "connecting" ? (
                  <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : state === "listening" ? (
                  <Mic size={26} />
                ) : (
                  <Volume2 size={26} />
                )}

                {state === "disconnected" && (
                  <span className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping" />
                )}
              </button>

              <button
                onClick={() => navigate("chat")}
                className="p-3.5 rounded-full border border-white/10 bg-white/[0.04] text-slate-400 hover:text-pink-300 hover:bg-pink-500/10 hover:border-pink-500/30 transition-all duration-300 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
                title="Open chat"
                aria-label="Open chat"
              >
                <MessageSquare size={19} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-[8px] font-mono uppercase tracking-[0.18em] text-slate-600">
              <Sparkles size={9} className="text-cyan-400/70" />
              <span>
                {isLive
                  ? "Tap core to sleep · vision & chat stay linked"
                  : "Sitara is resting · tap the core to begin"}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
