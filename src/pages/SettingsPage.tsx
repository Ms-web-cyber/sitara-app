import React, { useState } from "react";
import {
  Check,
  Cpu,
  Database,
  Download,
  ExternalLink,
  Heart,
  Key,
  Palette,
  RotateCcw,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { Page } from "../components/layout/Page";
import { useSitara } from "../app/SitaraProvider";
import { THEME_OPTIONS } from "../app/theme";

function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-3.5 border-b border-white/[0.06]">
        <span className="p-2 rounded-xl border border-white/10 bg-white/[0.03] text-cyan-300 shrink-0">
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-xs font-semibold text-white tracking-wide">{title}</h2>
          {description && (
            <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="w-full flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-3.5 py-2.5 text-left hover:bg-white/[0.03] transition cursor-pointer"
      role="switch"
      aria-checked={checked}
    >
      <span className="min-w-0">
        <span className="block text-[11px] font-medium text-slate-200">{label}</span>
        {hint && <span className="block text-[9px] font-mono text-slate-500 mt-0.5">{hint}</span>}
      </span>
      <span
        className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 shrink-0 ${
          checked ? "bg-cyan-500" : "bg-white/10"
        }`}
      >
        <span
          className={`block bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

const MODES: { id: "sitara" | "hermes" | "dual"; label: string; hint: string }[] = [
  { id: "sitara", label: "Sitara", hint: "Companion-first voice core" },
  { id: "hermes", label: "Hermes", hint: "Task & tool executor" },
  { id: "dual", label: "Dual", hint: "Both engines together" },
];

export default function SettingsPage() {
  const {
    themeColor,
    setThemeColor,
    agentMode,
    setAgentMode,
    agentDisplayName,
    highThinkingEnabled,
    handleToggleHighThinking,
    isNemotronEnabled,
    handleToggleNemotron,
    geminiApiKey,
    setGeminiApiKey,
    geminiKeySaved,
    geminiKeyMasked,
    handleSaveGeminiKey,
    nvidiaApiKey,
    setNvidiaApiKey,
    nvidiaKeySaved,
    handleSaveNvidiaKey,
    memories,
    handleClearAllMemories,
    chatHistory,
    clearChat,
    resetRelationship,
    canInstall,
    installApp,
    isStandalone,
  } = useSitara();

  const [showKeys, setShowKeys] = useState(false);

  return (
    <Page
      title="Settings"
      subtitle="Engines, appearance & data"
      icon={<SettingsIcon size={17} />}
      maxWidth="max-w-3xl"
    >
      <div className="flex flex-col gap-4">
        <Section
          title="Appearance"
          description="Atmosphere colour of the holographic core and accents."
          icon={<Palette size={15} />}
        >
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {THEME_OPTIONS.map((theme) => {
              const active = themeColor === theme.key;
              return (
                <button
                  key={theme.key}
                  onClick={() => setThemeColor(theme.key)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition cursor-pointer ${
                    active
                      ? `${theme.ring} bg-white/[0.06]`
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                  aria-pressed={active}
                >
                  <span className={`w-4 h-4 rounded-full ${theme.dot} shadow-md`} />
                  <span className="text-[9px] font-mono text-slate-400">{theme.label}</span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section
          title="Companion mode"
          description={`Active engine linked to the voice and chat core · ${agentDisplayName}`}
          icon={<Heart size={15} />}
        >
          <div className="grid grid-cols-3 gap-2">
            {MODES.map((mode) => {
              const active = agentMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setAgentMode(mode.id)}
                  className={`flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl border text-left transition cursor-pointer ${
                    active
                      ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-100"
                      : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]"
                  }`}
                  aria-pressed={active}
                >
                  <span className="text-[11px] font-semibold">{mode.label}</span>
                  <span className="text-[8px] font-mono uppercase tracking-wider opacity-70">
                    {mode.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section
          title="Reasoning engines"
          description="High thinking adds depth; Nemotron adds ultra-scale multi-agent reasoning."
          icon={<Cpu size={15} />}
        >
          <Toggle
            checked={highThinkingEnabled}
            onChange={handleToggleHighThinking}
            label="High thinking engine"
            hint="Longer reasoning before answering"
          />
          <Toggle
            checked={isNemotronEnabled}
            onChange={handleToggleNemotron}
            label="NVIDIA Nemotron 3 Ultra"
            hint="384B steerable multi-agent profile"
          />
        </Section>

        <Section
          title="API keys"
          description="Keys are stored on the local Sitara server, never bundled in the app."
          icon={<Key size={15} />}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              {showKeys ? "Keys visible" : "Keys hidden"}
            </span>
            <button
              onClick={() => setShowKeys((value) => !value)}
              className="text-[9px] font-mono uppercase tracking-wider text-cyan-300 hover:text-cyan-200 transition cursor-pointer"
            >
              {showKeys ? "Hide" : "Show"}
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
              Google Gemini API key
            </label>
            <div className="flex gap-2">
              <input
                type={showKeys ? "text" : "password"}
                value={geminiApiKey}
                onChange={(event) => setGeminiApiKey(event.target.value)}
                placeholder={geminiKeySaved ? geminiKeyMasked || "••••••••••••" : "AIza..."}
                autoComplete="off"
                spellCheck={false}
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 font-mono"
              />
              <button
                onClick={handleSaveGeminiKey}
                className="px-3 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 text-[10px] font-mono uppercase tracking-wider hover:bg-cyan-500/20 transition cursor-pointer shrink-0"
              >
                {geminiKeySaved ? <Check size={13} /> : "Save"}
              </button>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[9px] font-mono text-slate-500 hover:text-cyan-300 transition"
            >
              Get a Gemini key <ExternalLink size={9} />
            </a>
          </div>

          <div className="h-px bg-white/[0.06]" />

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
              NVIDIA API key
            </label>
            <div className="flex gap-2">
              <input
                type={showKeys ? "text" : "password"}
                value={nvidiaApiKey}
                onChange={(event) => setNvidiaApiKey(event.target.value)}
                placeholder="nvapi-..."
                autoComplete="off"
                spellCheck={false}
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40 font-mono"
              />
              <button
                onClick={handleSaveNvidiaKey}
                className="px-3 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-[10px] font-mono uppercase tracking-wider hover:bg-emerald-500/20 transition cursor-pointer shrink-0"
              >
                {nvidiaKeySaved ? <Check size={13} /> : "Save"}
              </button>
            </div>
            <a
              href="https://build.nvidia.com/nvidia/nemotron-3-ultra"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[9px] font-mono text-slate-500 hover:text-emerald-300 transition"
            >
              Get an NVIDIA key <ExternalLink size={9} />
            </a>
          </div>
        </Section>

        <Section
          title="Data & storage"
          description="Everything stays on this device's Sitara server."
          icon={<Database size={15} />}
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
              <div className="text-[8px] font-mono uppercase tracking-wider text-slate-500">
                Chat messages
              </div>
              <div className="text-lg font-display font-semibold text-white mt-0.5">
                {chatHistory.length}
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
              <div className="text-[8px] font-mono uppercase tracking-wider text-slate-500">
                Memories
              </div>
              <div className="text-lg font-display font-semibold text-white mt-0.5">
                {memories.length}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (chatHistory.length && window.confirm("Clear the full chat transcript?")) {
                  clearChat();
                }
              }}
              disabled={chatHistory.length === 0}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-[10px] font-mono uppercase tracking-wider text-slate-300 hover:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <Trash2 size={12} /> Clear chat
            </button>
            <button
              onClick={() => {
                if (memories.length && window.confirm("Permanently erase all memories?")) {
                  handleClearAllMemories();
                }
              }}
              disabled={memories.length === 0}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] text-[10px] font-mono uppercase tracking-wider text-rose-300 hover:bg-rose-500/15 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <Trash2 size={12} /> Clear memories
            </button>
          </div>

          <button
            onClick={() => {
              if (window.confirm("Reset the bond back to Stage 1? Affection and mood will reset.")) {
                resetRelationship();
              }
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-rose-300 hover:border-rose-500/20 hover:bg-rose-500/[0.06] transition cursor-pointer"
          >
            <RotateCcw size={12} /> Reset relationship
          </button>
        </Section>

        <Section
          title="App"
          description="Install Sitara as a home-screen app for full-screen voice access."
          icon={<Download size={15} />}
        >
          {isStandalone ? (
            <div className="flex items-center gap-2 text-[11px] text-emerald-300">
              <ShieldCheck size={14} /> Running as an installed app
            </div>
          ) : canInstall ? (
            <button
              onClick={installApp}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono uppercase tracking-wider text-emerald-200 hover:bg-emerald-500/20 transition cursor-pointer"
            >
              <Download size={12} /> Install Sitara
            </button>
          ) : (
            <p className="text-[10px] font-mono text-slate-500 leading-relaxed">
              Use your browser menu &rarr; <span className="text-slate-300">Add to Home screen</span>{" "}
              to install Sitara.
            </p>
          )}

          <div className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-black/20 px-3.5 py-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Version
            </span>
            <span className="text-[11px] font-mono text-slate-300">v3.0 · core shell</span>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-black/20 px-3.5 py-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Developer
            </span>
            <span className="text-[11px] font-mono text-pink-300">Mangesh</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              onClick={() => (window.location.hash = "#agents")}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-white/10 bg-white/[0.03] text-[9px] font-mono text-slate-400 hover:text-white transition cursor-pointer"
            >
              <Zap size={10} /> Agent console
            </button>
            <button
              onClick={() => (window.location.hash = "#memory")}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-white/10 bg-white/[0.03] text-[9px] font-mono text-slate-400 hover:text-white transition cursor-pointer"
            >
              <Sparkles size={10} /> Memory core
            </button>
          </div>
        </Section>
      </div>
    </Page>
  );
}
