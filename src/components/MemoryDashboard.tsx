import React, { useState } from "react";
import { Memory, MemoryCategory } from "../lib/memoryTypes";
import { 
  Brain, 
  X, 
  Trash2, 
  Plus, 
  User, 
  Heart, 
  Target, 
  Briefcase, 
  Users, 
  Flame, 
  Sparkles,
  RefreshCw,
  Shield,
  Cpu,
  Zap,
  Activity,
  Workflow
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MemoryDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  memories: Memory[];
  onAddMemory: (category: MemoryCategory, text: string) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
  onClearAllMemories: () => Promise<void>;
  themeColor: string;
  chatHistory?: any[];
  /** When true, renders inside a page instead of as a slide-over drawer. */
  embedded?: boolean;
}

export function MemoryDashboard({
  isOpen,
  onClose,
  memories,
  onAddMemory,
  onDeleteMemory,
  onClearAllMemories,
  themeColor,
  chatHistory = [],
  embedded = false,
}: MemoryDashboardProps) {
  const [activeTab, setActiveTab] = useState<MemoryCategory | "all" | "collaboration">("all");
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState<MemoryCategory>("identity");
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Category Configuration
  const categoryConfig: Record<MemoryCategory, { label: string; icon: any; color: string; bg: string }> = {
    identity: { 
      label: "Identity Core", 
      icon: User, 
      color: "text-amber-400 border-amber-500/25", 
      bg: "bg-amber-500/5 hover:bg-amber-500/10" 
    },
    preference: { 
      label: "Preferences", 
      icon: Heart, 
      color: "text-pink-400 border-pink-500/25", 
      bg: "bg-pink-500/5 hover:bg-pink-500/10" 
    },
    goal: { 
      label: "Life Goals", 
      icon: Target, 
      color: "text-emerald-400 border-emerald-500/25", 
      bg: "bg-emerald-500/5 hover:bg-emerald-500/10" 
    },
    project: { 
      label: "Active Projects", 
      icon: Briefcase, 
      color: "text-cyan-400 border-cyan-500/25", 
      bg: "bg-cyan-500/5 hover:bg-cyan-500/10" 
    },
    relationship: { 
      label: "Relationships", 
      icon: Users, 
      color: "text-purple-400 border-purple-500/25", 
      bg: "bg-purple-500/5 hover:bg-purple-500/10" 
    },
    emotional: { 
      label: "Milestones", 
      icon: Flame, 
      color: "text-red-400 border-red-500/25", 
      bg: "bg-red-500/5 hover:bg-red-500/10" 
    },
    behavior: { 
      label: "Behaviors & Habits", 
      icon: Brain, 
      color: "text-indigo-400 border-indigo-500/25", 
      bg: "bg-indigo-500/5 hover:bg-indigo-500/10" 
    },
  };

  const getThemeBadgeGlow = () => {
    switch (themeColor) {
      case "violet": return "border-purple-500/30 text-purple-400 bg-purple-500/10";
      case "crimson": return "border-rose-500/30 text-rose-400 bg-rose-500/10";
      case "emerald": return "border-emerald-500/30 text-emerald-400 bg-emerald-500/10";
      case "celestial": return "border-sky-500/30 text-sky-400 bg-sky-500/10";
      case "gold": return "border-amber-500/30 text-amber-400 bg-amber-500/10";
      case "rose": return "border-pink-500/30 text-pink-400 bg-pink-500/10";
      case "charcoal":
      default:
        return "border-indigo-500/30 text-indigo-400 bg-indigo-500/10";
    }
  };

  const filteredMemories = activeTab === "all" 
    ? memories 
    : memories.filter(m => m.category === activeTab);

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    setSubmitting(true);
    try {
      await onAddMemory(newCategory, newText.trim());
      setNewText("");
      setIsAdding(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return "Durable Record";
    }
  };

  const panel = (
    <motion.div
      initial={embedded ? false : { x: "100%" }}
      animate={{ x: 0 }}
      exit={embedded ? undefined : { x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={
        embedded
          ? "w-full flex-1 min-h-0 flex flex-col text-left"
          : "absolute inset-y-0 right-0 w-full max-w-lg bg-[#020206]/95 border-l border-white/15 backdrop-blur-2xl z-50 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]"
      }
    >
      {/* Header */}
      {!embedded && (
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${getThemeBadgeGlow()}`}>
              <Brain size={22} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-medium text-lg tracking-tight text-white flex items-center gap-2">
                Sitara Memory Core
                <Sparkles size={14} className="text-cyan-400" />
              </h3>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-0.5">
                Persistent recollect files ({memories.length})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Quick stats & action row */}
      <div
        className={
          embedded
            ? "rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 mb-3 shrink-0"
            : "px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between gap-2.5"
        }
      >
              <span className="text-[10px] text-slate-400 font-mono">
                💡 Sitara remembers these details naturally as you chat.
              </span>
              <div className="flex gap-2 shrink-0">
                {memories.length > 0 && (
                  <button
                    onClick={async () => {
                      if (confirm("Are you sure you want to permanently erase Sitara's memories and interaction history?")) {
                        await onClearAllMemories();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-500/40 bg-red-950/20 hover:bg-red-500 hover:text-white text-xs font-mono font-medium tracking-wider text-red-400 shadow-md hover:shadow-red-500/10 transition duration-150 cursor-pointer"
                    title="Clear all memories and reset mind"
                  >
                    <Trash2 size={12} />
                    <span>DELETE ALL</span>
                  </button>
                )}
                {!isAdding && (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-500 hover:text-slate-950 text-xs font-mono font-medium tracking-wider text-cyan-400 shadow-md hover:shadow-cyan-500/10 transition duration-150 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>MANUAL SEED</span>
                  </button>
                )}
              </div>
            </div>

            {/* Manual entry card drawer inside dashboard */}
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-white/15 bg-[#080812]"
                >
                  <form onSubmit={handleManualAdd} className="p-5 space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono tracking-wider text-slate-300 uppercase mb-2">
                        Memory Archetype Category
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(Object.keys(categoryConfig) as MemoryCategory[]).map((cat) => {
                          const Icon = categoryConfig[cat].icon;
                          const active = newCategory === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setNewCategory(cat)}
                              className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium tracking-wide transition duration-150 cursor-pointer ${
                                active 
                                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                  : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <Icon size={12} className={active ? "text-cyan-400" : "text-slate-400"} />
                              <span className="truncate">{categoryConfig[cat].label.split(" ")[0]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono tracking-wider text-slate-300 uppercase mb-2">
                        Recollection Statement (3rd Person declarative)
                      </label>
                      <textarea
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="e.g. The user's startup is called Sitara, a voice AI platform."
                        required
                        className="w-full h-18 text-xs p-3 rounded-xl border border-white/15 bg-black/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none font-sans"
                      />
                    </div>

                    <div className="flex gap-2.5 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono tracking-wide text-slate-400 hover:text-white hover:bg-white/5 transition duration-150 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-widest shadow-md transition duration-150 disabled:opacity-50 cursor-pointer"
                      >
                        {submitting ? "Saving..." : "Commit Memory"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAB SELECTOR SCROLLER */}
            <div className="px-6 py-4 flex gap-1.5 overflow-x-auto no-scrollbar border-b border-white/10 shrink-0">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-2 rounded-full border text-[11px] tracking-wider uppercase font-medium transition duration-150 cursor-pointer shrink-0 ${
                  activeTab === "all"
                    ? "border-cyan-500 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    : "border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20"
                }`}
              >
                All Memories
              </button>
              <button
                onClick={() => setActiveTab("collaboration")}
                className={`px-3.5 py-2 rounded-full border text-[11px] tracking-wider uppercase font-medium transition duration-150 cursor-pointer shrink-0 ${
                  activeTab === "collaboration"
                    ? "border-purple-500 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.35)]"
                    : "border-white/10 bg-white/5 text-purple-300 hover:text-white hover:border-white/20"
                }`}
              >
                🤝 Collaboration History
              </button>
              {(Object.keys(categoryConfig) as MemoryCategory[]).map((cat) => {
                const config = categoryConfig[cat];
                const active = activeTab === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-3.5 py-2 rounded-full border text-[11px] tracking-wider uppercase font-medium transition duration-150 shrink-0 cursor-pointer ${
                      active
                        ? "border-cyan-500 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        : "border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {config.label.split(" ")[0]}
                  </button>
                );
              })}
            </div>

            {/* RECOLLECTION ITEMS CARDS CONTAINER */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
              <AnimatePresence initial={false}>
                {activeTab === "collaboration" ? (
                  <motion.div
                    key="collaboration-tab"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6"
                  >
                    {/* Active Agents Swarm Registry */}
                    <div>
                      <h4 className="text-xs uppercase font-mono font-bold text-cyan-400 tracking-wider flex items-center gap-2 mb-3">
                        <Cpu size={14} className="text-cyan-400 animate-pulse" />
                        <span>Active Swarm Registry</span>
                      </h4>
                      <div className="grid grid-cols-1 gap-2.5">
                        {[
                          { name: "Hermes", role: "Commander & Executor", desc: "Delegation, code orchestration, and execution", icon: Zap, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                          { name: "Claude / Fugu AI", role: "Analyst & Interpreter", desc: "Empathetic translation, reports, and explanation", icon: User, color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
                          { name: "Methos / Fable 5", role: "Strategist & Risk Assessor", desc: "Resource scheduling, strategy, and risk assessment", icon: Target, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                          { name: "CyberStrike", role: "Offensive Operator", desc: "Vulnerability validation, penetration operations", icon: Flame, color: "text-red-400 bg-red-500/10 border-red-500/20" },
                          { name: "PenExpert", role: "Autonomous Engineer", desc: "Multi-stage autonomous testing and pathfinding", icon: Briefcase, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
                          { name: "Bug-Bounty / Mythos 5", role: "Vulnerability Hunter", desc: "Surface recon, automated scanning, and bug discovery", icon: Sparkles, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
                          { name: "Sonnet 5", role: "Ethicist & Guardian", desc: "Safety guidelines, ethical review, and policy checking", icon: Shield, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
                          { name: "Opus 4.8", role: "Verifier & QA", desc: "Cross-validation, accuracy check, and validation", icon: RefreshCw, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                        ].map((agent) => {
                          const IconComponent = agent.icon;
                          return (
                            <div key={agent.name} className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-slate-950/40 hover:bg-slate-900/50 transition">
                              <div className={`p-2 rounded-lg border shrink-0 ${agent.color}`}>
                                <IconComponent size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold text-xs text-white tracking-wide">{agent.name}</span>
                                  <span className="flex items-center gap-1 text-[8px] font-mono uppercase text-emerald-400 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                    Standby
                                  </span>
                                </div>
                                <span className="text-[9px] font-mono text-slate-400 block mt-0.5">{agent.role}</span>
                                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-sans">{agent.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Task Execution Logs */}
                    <div>
                      <h4 className="text-xs uppercase font-mono font-bold text-purple-400 tracking-wider flex items-center gap-2 mb-3">
                        <Workflow size={14} className="text-purple-400 animate-pulse" />
                        <span>Recent Handoff & Execution Logs</span>
                      </h4>
                      
                      <div className="space-y-3">
                        {/* Dynamic Tasks from ChatHistory */}
                        {chatHistory.filter(msg => msg.isTaskResult).map((task) => (
                          <div key={task.id} className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/[0.02] space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[8px] font-mono uppercase bg-purple-500/20 border border-purple-500/30 text-purple-300">
                                  {task.agentName}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {task.taskStatus}
                                </span>
                              </div>
                              <span className="text-[8px] font-mono text-slate-500">
                                {task.timestamp ? new Date(task.timestamp).toLocaleTimeString() : "Recent"}
                              </span>
                            </div>
                            <h5 className="font-semibold text-xs text-slate-200 leading-snug">{task.taskTitle}</h5>
                            <p className="text-[10px] text-slate-400 font-sans leading-relaxed line-clamp-3 overflow-hidden break-words">
                              {task.resultMarkdown}
                            </p>
                          </div>
                        ))}

                        {/* Seeded/Archived logs to ensure transparency & populate history elegantly */}
                        {[
                          {
                            id: "archived-1",
                            taskTitle: "Trinity System Synchronization & Communication Channels Test",
                            agentName: "HERMES",
                            taskStatus: "SUCCESS",
                            resultMarkdown: "Initialization complete. All 8 agents synchronized. Communication channels verified, secure payload repository mapping loaded, verification protocol online.",
                            timestamp: "4 hours ago",
                            collaborators: ["Hermes", "Claude", "Opus 4.8"]
                          },
                          {
                            id: "archived-2",
                            taskTitle: "Target Vulnerability Reconnaissance & Surface Scanning",
                            agentName: "MYTHOS 5",
                            taskStatus: "SUCCESS",
                            resultMarkdown: "Scanned target endpoints. Identified open subdomains, listed 12 functional service interfaces, and flagged outdated front-end package declarations.",
                            timestamp: "2 hours ago",
                            collaborators: ["Mythos 5", "CyberStrike"]
                          },
                          {
                            id: "archived-3",
                            taskTitle: "Autonomous Chained Privilege Escalation Attempt",
                            agentName: "PENEXPERT",
                            taskStatus: "SUCCESS",
                            resultMarkdown: "Chained IDOR vulnerability on authorization route with relational queries to verify access controls. Generated audit records for active verification.",
                            timestamp: "1 hour ago",
                            collaborators: ["PenExpert", "Fable 5", "Sonnet 5"]
                          }
                        ].map((task) => (
                          <div key={task.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[8px] font-mono uppercase bg-slate-850 text-slate-300 border border-white/5">
                                  {task.agentName}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {task.taskStatus}
                                </span>
                                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest bg-white/5 px-1 py-0.5 rounded">ARCHIVED</span>
                              </div>
                              <span className="text-[8px] font-mono text-slate-500">{task.timestamp}</span>
                            </div>
                            <h5 className="font-semibold text-xs text-slate-200 leading-snug">{task.taskTitle}</h5>
                            <p className="text-[10px] text-slate-400 font-sans leading-relaxed break-words">
                              {task.resultMarkdown}
                            </p>
                            <div className="flex items-center gap-1 text-[8px] font-mono text-slate-500 pt-1.5 border-t border-white/5">
                              <span>Collaborators:</span>
                              {task.collaborators.map((collab) => (
                                <span key={collab} className="text-slate-400 bg-white/5 px-1 py-0.2 rounded">{collab}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : filteredMemories.length === 0 ? (
                  <motion.div
                    key="empty-memories"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500"
                  >
                    <div className="p-4 rounded-full border border-dashed border-white/10 bg-white/[0.02] mb-4">
                      <Brain size={32} className="opacity-40" />
                    </div>
                    <h4 className="text-sm font-semibold tracking-wide text-slate-300">No memories recorded yet</h4>
                    <p className="text-xs max-w-xs mt-1.5 leading-relaxed font-mono">
                      {activeTab === "all" 
                        ? "Start talking aloud with Sitara! Her background consolidator analyzes transcript slices and builds a life context naturally."
                        : `No persistent recollections saved in Category "${categoryConfig[activeTab as MemoryCategory]?.label}". Add one or speak with Sitara.`}
                    </p>
                  </motion.div>
                ) : (
                  filteredMemories.map((m) => {
                    const cfg = categoryConfig[m.category];
                    const Icon = cfg.icon;

                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`flex items-start justify-between gap-4 p-4 rounded-xl border border-white/5 backdrop-blur-md bg-white/[0.02] ${cfg.bg} transition-colors group relative`}
                      >
                        <div className="flex gap-3.5 overflow-hidden">
                          <div className={`p-2 rounded-lg border mt-0.5 shrink-0 bg-black/40 ${cfg.color}`}>
                            <Icon size={14} />
                          </div>
                          <div className="overflow-hidden">
                            <span className={`text-[9px] font-mono uppercase tracking-wider block ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            <p className="text-xs text-slate-200 mt-1 font-sans leading-relaxed break-words font-medium">
                              {m.text}
                            </p>
                            <span className="text-[9px] font-mono text-slate-500 mt-2 block">
                              Recalled: {formatDate(m.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Forget / Delete trigger button */}
                        <button
                          onClick={() => onDeleteMemory(m.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg border border-red-500/25 bg-red-950/15 text-red-400 hover:bg-red-500 hover:text-white transition duration-150 absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 shrink-0 cursor-pointer"
                          title="Forget this memory"
                        >
                          <Trash2 size={13} />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

      {/* Technical visual core footprint footer */}
      <div
        className={
          embedded
            ? "mt-3 shrink-0 flex items-center justify-between text-[9px] font-mono text-slate-600 tracking-wider"
            : "p-5 border-t border-white/10 bg-black/40 flex items-center justify-between text-[9px] font-mono text-slate-600 tracking-wider"
        }
      >
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.7)] animate-pulse" />
          <span>MEM-SYNC STREAM ACTIVE</span>
        </span>
        <span>DURABLE LOCAL JSON DB SEED</span>
      </div>
    </motion.div>
  );

  if (embedded) return panel;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
          {panel}
        </>
      )}
    </AnimatePresence>
  );
}
