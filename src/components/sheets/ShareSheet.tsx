import React from "react";
import {
  Heart,
  Monitor,
  Pause,
  Play,
  RefreshCw,
  Smartphone,
  Square,
  Video,
} from "lucide-react";
import { useSitara } from "../../app/SitaraProvider";

interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
}

export function ShareSheet({ open, onClose }: ShareSheetProps) {
  const {
    isScreenSharing,
    isScreenSharingPaused,
    screenVisionMode,
    setScreenVisionMode,
    screenStreamRef,
    startScreenSharing,
    startCameraSharing,
    stopScreenSharing,
    pauseScreenSharing,
    resumeScreenSharing,
    switchScreenShare,
    agentDisplayName,
  } = useSitara();

  if (!open) return null;

  const stream = screenStreamRef.current;

  return (
    <div className="flex flex-col gap-4">
      {isScreenSharing ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2 h-2 rounded-full ${
                  isScreenSharingPaused ? "bg-amber-400" : "bg-cyan-400 animate-pulse"
                }`}
              />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-200 truncate">
                {isScreenSharingPaused ? "Vision paused" : "Vision streaming"}
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">0.5 FPS · JPEG</span>
          </div>

          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/10">
            <video
              ref={(el) => {
                if (el && stream && el.srcObject !== stream) {
                  el.srcObject = stream;
                  el.muted = true;
                  el.play().catch((err) => console.log("Preview play issue:", err));
                }
              }}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isScreenSharingPaused ? "opacity-30 blur-sm" : "opacity-90"
              }`}
              autoPlay
              playsInline
              muted
            />
            {isScreenSharingPaused && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] uppercase tracking-widest font-mono text-amber-300 font-bold px-2.5 py-1 bg-amber-950/50 border border-amber-500/20 rounded-lg">
                  Transmission paused
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {isScreenSharingPaused ? (
              <button
                onClick={resumeScreenSharing}
                className="py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-xs font-mono text-cyan-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Play size={12} /> Resume
              </button>
            ) : (
              <button
                onClick={pauseScreenSharing}
                className="py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-mono text-amber-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Pause size={12} /> Pause
              </button>
            )}
            <button
              onClick={switchScreenShare}
              className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw size={12} /> Switch
            </button>
            <button
              onClick={() => {
                stopScreenSharing();
                onClose();
              }}
              className="py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-mono text-rose-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Square size={10} /> Stop
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-200">
                Screen vision mode
              </div>
              <div className="text-[9px] font-mono text-slate-500">
                Gemini auto-analysis of shared frames
              </div>
            </div>
            <button
              onClick={() => setScreenVisionMode(!screenVisionMode)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 shrink-0 cursor-pointer ${
                screenVisionMode ? "bg-cyan-500" : "bg-white/10"
              }`}
              aria-label="Toggle screen vision mode"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${
                  screenVisionMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-slate-400 leading-relaxed">
            Share a live visual feed with <span className="text-cyan-300">{agentDisplayName}</span>.
            Frames are sampled every 2 seconds so the call stays light.
          </p>

          <button
            onClick={() => startCameraSharing("environment")}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 hover:from-cyan-500/15 hover:to-indigo-500/15 border border-cyan-500/30 text-left transition flex items-center gap-3.5 cursor-pointer group"
          >
            <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-300 group-hover:scale-110 transition">
              <Smartphone size={19} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                Back camera
                <span className="text-[8px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                  Mobile
                </span>
              </span>
              <span className="block text-[11px] text-slate-400 mt-0.5">
                Show your surroundings, laptop screen or notes.
              </span>
            </span>
          </button>

          <button
            onClick={() => startCameraSharing("user")}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/15 hover:to-pink-500/15 border border-purple-500/30 text-left transition flex items-center gap-3.5 cursor-pointer group"
          >
            <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-300 group-hover:scale-110 transition">
              <Heart size={19} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold text-white">Front camera</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">
                Face-to-face visual interaction.
              </span>
            </span>
          </button>

          <button
            onClick={startScreenSharing}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/15 hover:to-teal-500/15 border border-emerald-500/30 text-left transition flex items-center gap-3.5 cursor-pointer group"
          >
            <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-300 group-hover:scale-110 transition">
              <Monitor size={19} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                PC screen
                <span className="text-[8px] font-mono bg-white/10 text-slate-300 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                  Desktop
                </span>
              </span>
              <span className="block text-[11px] text-slate-400 mt-0.5">
                Stream a window or your entire computer display.
              </span>
            </span>
          </button>

          <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <Video size={14} className="text-slate-500 mt-0.5 shrink-0" />
            <p className="text-[10px] font-mono text-slate-500 leading-relaxed">
              Tip: start the live core first. Screen frames are only sent while a voice session is
              active.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
