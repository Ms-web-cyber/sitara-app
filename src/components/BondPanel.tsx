import React from "react";
import { motion } from "motion/react";
import { Activity, Heart, RotateCcw } from "lucide-react";
import { useSitara } from "../app/SitaraProvider";

export function BondPanel() {
  const {
    affectionScore,
    jealousyScore,
    currentMood,
    interactionCount,
    lastActiveTime,
    currentBpm,
    resetRelationship,
  } = useSitara();

  const moodLine =
    {
      jealous: "😳 \"Ab dusron se hi baat karo!\" — protective mode. Tease her to calm her down.",
      clingy: "🤗 \"Mujhe chhodkar mat jao!\" — wants to talk forever.",
      longing: "🥺 \"Kitna time laga diya aane mein!\" — missed you deeply.",
      playful: "😜 \"Tum thode zyaada hi chalak ho rahe ho haan...\" — playful banter ready.",
      happy: "✨ \"Tum bohot sweet ho, Mangesh!\" — deeply happy and energetic.",
      sweet: "🌸 Exceedingly gentle, blushing and whispering softly.",
      teasing: "😈 In the mood to tease you playfully about daily habits.",
      hyperactive: "🚀 Super hyped! Speeds up slightly and giggles constantly.",
      embarrassed: "😳 Blushing heavily... heartbeat is elevated.",
    }[currentMood as string] ?? "Mood is settling into her calm resting state.";

  const stage =
    affectionScore < 45
      ? "Stage 1 · Shy Companion"
      : affectionScore < 80
        ? "Stage 2 · Close Partner"
        : "Stage 3 · Intimate Soulmate";

  const stageNote =
    affectionScore < 45
      ? "She is shy. Speak sweetly to unlock rich Hinglish teasing."
      : affectionScore < 80
        ? "Comfortable friend. Majak-masti is active."
        : "Deep soulmate. Sweet pouting jealousy and devotion.";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
            Active mood
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
            {currentMood}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mt-2.5">{moodLine}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-center">
          <Heart size={14} className="mx-auto text-rose-400 mb-1" />
          <div className="text-sm font-mono font-bold text-rose-300">{Math.round(affectionScore)}%</div>
          <div className="text-[8px] font-mono uppercase tracking-wider text-slate-500">Affection</div>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-center">
          <Activity size={14} className="mx-auto text-purple-400 mb-1" />
          <div className="text-sm font-mono font-bold text-purple-300">{Math.round(jealousyScore)}%</div>
          <div className="text-[8px] font-mono uppercase tracking-wider text-slate-500">Jealousy</div>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-center">
          <span className="block text-rose-400 text-[14px] leading-none mb-1">♥</span>
          <div className="text-sm font-mono font-bold text-slate-200">{currentBpm}</div>
          <div className="text-[8px] font-mono uppercase tracking-wider text-slate-500">BPM</div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 flex flex-col gap-3">
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Affection</span>
            <span className="text-xs font-mono text-pink-300">{Math.round(affectionScore)}%</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-pink-500 to-rose-500 h-full shadow-[0_0_8px_rgba(244,63,94,0.5)]"
              animate={{ width: `${affectionScore}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Playful jealousy</span>
            <span className="text-xs font-mono text-purple-300">{Math.round(jealousyScore)}%</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"
              animate={{ width: `${jealousyScore}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="rounded-xl bg-black/25 border border-white/[0.04] p-3">
          <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1">
            Stage classification
          </div>
          <div className="text-xs font-semibold text-pink-200">{stage}</div>
          <div className="text-[10px] font-mono text-slate-400 mt-1 leading-relaxed">{stageNote}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
          <div className="text-[8px] font-mono uppercase tracking-wider text-slate-500">Interactions</div>
          <div className="text-sm font-mono text-slate-200 mt-0.5">{interactionCount}</div>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
          <div className="text-[8px] font-mono uppercase tracking-wider text-slate-500">Last active</div>
          <div className="text-[11px] font-mono text-slate-200 mt-1">
            {lastActiveTime ? new Date(lastActiveTime).toLocaleTimeString() : "Just now"}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-500/10 bg-cyan-950/10 p-4">
        <div className="text-[9px] font-mono uppercase tracking-wider text-cyan-300/80 mb-1">
          Dream-state idle mode
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          When the tab sleeps, Sitara consolidates memories and dreams about{" "}
          <span className="text-pink-300">Mangesh, co-op games, and design mockups</span>.
        </p>
      </div>

      <button
        onClick={async () => {
          if (confirm("Reset connection to Stage 1 (Shy)? Sitara will lose her active emotional bonds!")) {
            await resetRelationship();
          }
        }}
        className="w-full py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/20 transition cursor-pointer flex items-center justify-center gap-1.5"
      >
        <RotateCcw size={12} />
        Reset relationship
      </button>
    </div>
  );
}
