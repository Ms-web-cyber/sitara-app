export type ThemeKey =
  | "charcoal"
  | "violet"
  | "crimson"
  | "emerald"
  | "celestial"
  | "gold"
  | "rose";

export interface ThemeOption {
  key: ThemeKey;
  label: string;
  dot: string;
  ring: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { key: "charcoal", label: "Charcoal", dot: "bg-slate-500", ring: "border-slate-400" },
  { key: "violet", label: "Violet", dot: "bg-purple-500", ring: "border-purple-400" },
  { key: "crimson", label: "Crimson", dot: "bg-rose-500", ring: "border-rose-400" },
  { key: "emerald", label: "Emerald", dot: "bg-emerald-500", ring: "border-emerald-400" },
  { key: "celestial", label: "Celestial", dot: "bg-sky-500", ring: "border-sky-400" },
  { key: "gold", label: "Gold", dot: "bg-amber-500", ring: "border-amber-400" },
  { key: "rose", label: "Rose", dot: "bg-pink-500", ring: "border-pink-400" },
];

export const THEME_KEYS: ThemeKey[] = THEME_OPTIONS.map((t) => t.key);

export function isThemeKey(value: string): value is ThemeKey {
  return THEME_KEYS.includes(value as ThemeKey);
}

/** Ambient gradient used behind the holographic core stage. */
export function getAmbientStyles(themeColor: string): string {
  switch (themeColor) {
    case "violet":
      return "from-purple-950/40 via-violet-950/20 to-slate-950";
    case "crimson":
      return "from-red-950/40 via-orange-950/20 to-slate-950";
    case "emerald":
      return "from-emerald-950/40 via-teal-950/20 to-slate-950";
    case "celestial":
      return "from-sky-950/45 via-indigo-950/25 to-slate-950";
    case "gold":
      return "from-amber-950/30 via-yellow-950/15 to-slate-950";
    case "rose":
      return "from-rose-950/40 via-pink-950/20 to-slate-950";
    case "charcoal":
    default:
      return "from-slate-900/50 via-slate-950/30 to-slate-950";
  }
}

/** Accent text + glow for the active theme. */
export function getThemeTextGlow(themeColor: string): string {
  switch (themeColor) {
    case "violet":
      return "text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]";
    case "crimson":
      return "text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]";
    case "emerald":
      return "text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]";
    case "celestial":
      return "text-sky-400 drop-shadow-[0_0_12px_rgba(14,165,233,0.5)]";
    case "gold":
      return "text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]";
    case "rose":
      return "text-pink-400 drop-shadow-[0_0_12px_rgba(236,72,153,0.5)]";
    case "charcoal":
    default:
      return "text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]";
  }
}

/** Small badge styling for the active theme. */
export function getThemeBadge(themeColor: string): string {
  switch (themeColor) {
    case "violet":
      return "border-purple-500/30 text-purple-300 bg-purple-500/10";
    case "crimson":
      return "border-rose-500/30 text-rose-300 bg-rose-500/10";
    case "emerald":
      return "border-emerald-500/30 text-emerald-300 bg-emerald-500/10";
    case "celestial":
      return "border-sky-500/30 text-sky-300 bg-sky-500/10";
    case "gold":
      return "border-amber-500/30 text-amber-300 bg-amber-500/10";
    case "rose":
      return "border-pink-500/30 text-pink-300 bg-pink-500/10";
    case "charcoal":
    default:
      return "border-indigo-500/30 text-indigo-300 bg-indigo-500/10";
  }
}

/** Glow dot for theme pickers. */
export function getThemeRing(themeColor: string): string {
  return THEME_OPTIONS.find((t) => t.key === themeColor)?.ring ?? "border-slate-400";
}
