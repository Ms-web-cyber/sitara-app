import React, { useEffect, useState, useMemo } from "react";
import { Bot, CheckCircle2, GitBranch, History, LayoutDashboard, Loader2, Play, Search, Send, ShieldCheck, Sparkles, Terminal, Wrench, Zap, Circle, ArrowRight } from "lucide-react";
import { useSitara } from "../app/SitaraProvider";
import {
  AGENT_REGISTRY,
  AgentInfo,
  TOOL_CATEGORIES,
  TOOL_PALETTE,
} from "../lib/agentRegistry";

type AgentTab = "dashboard" | "console" | "runs";

const TABS: { id: AgentTab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "console", label: "Console", icon: Terminal },
  { id: "runs", label: "Runs", icon: History },
];

const STATUS_DOT: Record<AgentInfo["status"], string> = {
  ready: "bg-emerald-400",
  standby: "bg-amber-400",
  planned: "bg-slate-600",
};

const STATUS_LABEL: Record<AgentInfo["status"], string> = {
  ready: "Ready",
  standby: "Standby",
  planned: "Planned",
};

export default function AgentsPage() {
  const { navigate, setTypedMessage } = useSitara();
  const [tab, setTab] = useState<AgentTab>("dashboard");
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null);
  const [composeAgentId, setComposeAgentId] = useState<string>("hermes");
  const [task, setTask] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>(["code.python", "memory.search"]);
  const [toolFilter, setToolFilter] = useState<string>("all");
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [isAgentsLoaded, setIsAgentsLoaded] = useState(false);
  const [runHistory, setRunHistory] = useState<any[]>([]);
  const [sseUrl, setSseUrl] = useState<string | null>(null);

  // Fetch agents from backend on mount
  useEffect(() => {
    async function loadAgents() {
      try {
        const res = await fetch("/api/agents");
        if (res.ok) {
          const data = await res.json();
          setAgents(data);
          setIsAgentsLoaded(true);
        }
      } catch (e) {
        console.error("Failed to load agents:", e);
      }
    }
    loadAgents();
  }, []);

  // SSE connection for run events
  useEffect(() => {
    if (!isAgentsLoaded) return;
    const evtSource = new EventSource("/api/agents/runs/events");
    setSseUrl("/api/agents/runs/events");

    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data || "{}");
      if (data.status === "run_complete" && data.runId) {
        setRunHistory((prev) => [data, ...prev].slice(0, 20));
      }
    };

    evtSource.onerror = () => {
      evtSource.close();
    };

    return () => {
      evtSource.close();
    };
  }, [isAgentsLoaded]);

  const composeAgent = AGENT_REGISTRY.find((agent) => agent.id === composeAgentId) ?? AGENT_REGISTRY[0];
  const readyCount = useMemo(
    () => AGENT_REGISTRY.filter((agent) => agent.status === "ready").length,
    []
  );
  const filteredTools = useMemo(
    () =>
      toolFilter === "all"
        ? TOOL_PALETTE
        : TOOL_PALETTE.filter((tool) => tool.category === toolFilter),
    [toolFilter]
  );

  const toggleTool = (toolId: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  const sendToChat = () => {
    const text = task.trim();
    if (!text) return;
    const agent = composeAgent;
    setTypedMessage(`@${agent.name} ${text}`);
    setTask("");
    navigate("chat");
  };

  return (
    <div className="min-h-full bg-[#020205] text-slate-100">
      <div className="flex flex-col gap-4">
        {/* Segmented tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-mono uppercase tracking-wider transition cursor-pointer ${
                  active ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon size={13} />
                {item.label}
              </button>
            );
          })}
        </div>

        {tab === "dashboard" && (
          <div className="flex flex-col gap-4">
              {[
                { label: "Agents", value: AGENT_REGISTRY.length, icon: Bot, color: "text-cyan-300" },
                { label: "Ready", value: readyCount, icon: CheckCircle2, color: "text-emerald-300" },
                { label: "Tools", value: TOOL_PALETTE.length, icon: Wrench, color: "text-amber-300" },
                { label: "Runs today", value: 0, icon: Play, color: "text-pink-300" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-slate-500">
                        {stat.label}
                      </span>
                      <Icon size={13} className={stat.color} />
                    </div>
                    <div className="text-xl font-display font-semibold text-white mt-1.5">
                      {stat.value}
                    </div>
                  </div>
                );
              })}
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-400">
                Active swarm registry
              </h2>
              <span className="text-[9px] font-mono text-slate-600">tap an agent for details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {AGENT_REGISTRY.map((agent) => {
                const Icon = agent.icon;
                return (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className="group text-left rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.045] hover:border-white/[0.12] p-4 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2 rounded-xl border">
                        <Icon size={15} />
                      </div>
                      <span className="flex items-center gap-1.5 text-[8px] font-mono uppercase tracking-wider text-slate-500">
                        <span className="w-1.5 h-1.5 rounded-full" />
                        {STATUS_LABEL[agent.status]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-3">
                      <span className="text-sm font-semibold text-white tracking-wide">
                        {agent.name}
                      </span>
                      <ChevronRight
                        size={14}
                        className="text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition"
                      />
                    </div>
                    <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 mt-0.5">
                      {agent.role}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-2 line-clamp-2">
                      {agent.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.05] flex-wrap">
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.03] text-slate-400">
                        {agent.tools.length} tools
                      </span>
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border border-cyan-500/20 bg-cyan-500/[0.06] text-cyan-300/80 truncate max-w-[140px]">
                        {agent.model}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.04] p-4 flex items-start gap-3">
              <Sparkles size={15} className="text-indigo-300 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-indigo-200">
                  Real agent runner lands next
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                  This shell is live. Checkpoint 2 connects the registry to a Gemini tool-calling loop, SSE run stream and persisted run history.
                </p>
              </div>
            </div>
          )
        )}

        {tab === "console" && (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-3.5 py-2.5 flex items-start gap-2">
              <ShieldCheck size={13} className="text-amber-300 shrink-0 mt-0.5" />
              <p className="text-[10px] font-mono text-amber-100/70 leading-relaxed">
                Runner backend is checkpoint 2. Today the composer hands your task to the chat engine so nothing in the shell is a dead end.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-3">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
                    Task composer
                  </h2>
                  <span className="text-[8px] font-mono uppercase tracking-wider text-slate-600">
                    {selectedTools.length} tools linked
                  </span>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
                    Agent
                  </span>
                  <select
                    value={composeAgentId}
                    onChange={(event) => setComposeAgentId(event.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40"
                  >
                    {AGENT_REGISTRY.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} · {agent.role}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
                    Task
                  </span>
                  <textarea
                    value={task}
                    onChange={(event) => setTask(event.target.value)}
                    placeholder="e.g. Analyse workspace_files and generate a summary PDF..."
                    rows={5}
                    className="w-full resize-none px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 leading-relaxed"
                  />
                </label>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Tool palette</span>
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                      <button
                        onClick={() => setToolFilter("all")}
                        className={`px-2 py-1 rounded-lg text-[8px] font-mono uppercase tracking-wider transition cursor-pointer ${
                          toolFilter === "all" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        All
                      </button>
                      {TOOL_CATEGORIES.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setToolFilter(category.id)}
                          className={`px-2 py-1 rounded-lg text-[8px] font-mono uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                            toolFilter === category.id ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                {/* Run output log */}
                <div className="mt-3 rounded-2xl border border-white/[0.07] bg-[#06060d] p-4 flex flex-col min-h-[180px]">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Run output</span>
                    <span className="text-[9px] font-mono text-slate-500">idle</span>
                  </div>
                  <div className="flex-1 flex flex-col items-start justify-start overflow-y-auto p-2 space-y-2 text-[10px] text-slate-400">
                    <div className="text-indigo-300/60 italic">Click "Send to chat" to run a task with selected tools</div>
                    <div id="run-log" className="space-y-1 max-h-[120px] overflow-y-auto">
                      <div className="text-amber-500/60 small">Ready for task...</div>
                    </div>
                  </div>
                </div>
                    {filteredTools.map((tool) => {
                      const active = selectedTools.includes(tool.id);
                      return (
                        <button
                          key={tool.id}
                          onClick={() => toggleTool(tool.id)}
                          title={tool.description}
                          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[9px] font-mono transition cursor-pointer ${
                            active ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-200" : "border-white/[0.07] bg-white/[0.02] text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <Code2 size={10} />
                          {tool.label}
                          {tool.status === "planned" && (
                            <span className="text-[7px] uppercase text-amber-400/80">soon</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={sendToChat}
                    disabled={!task.trim()}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[10px] font-mono uppercase tracking-wider transition ${
                      task.trim()
                        ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/25 cursor-pointer"
                        : "bg-white/[0.02] border-white/[0.06] text-slate-600 cursor-not-allowed"}
`}>
                    <Send size={12} /> Send to chat
                  </button>
                  <button
                    disabled
                    title="Runner backend arrives in checkpoint 2"
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-[10px] font-mono uppercase tracking-wider text-slate-600 cursor-not-allowed"
                  >
                    <Zap size={12} /> Run
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-[#06060d] p-4 flex flex-col min-h-[320px]">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-700" />
                    <span className="w-2 h-2 rounded-full bg-slate-700" />
                    <span className="w-2 h-2 rounded-full bg-slate-700" />
                    <span className="ml-1 text-[9px] font-mono uppercase tracking-wider text-slate-500">
                      live run log
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-slate-600">idle</span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8">
                  <div className="w-10 h-10 rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center mb-3">
                    <Loader2 size={16} className="text-slate-600" />
                  </div>
                  <p className="text-xs font-semibold text-slate-300">No run streaming yet</p>
                  <p className="text-[10px] font-mono text-slate-600 mt-1 max-w-[220px] leading-relaxed">
                    Steps, tool calls and partial output will stream here over SSE.
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-white/[0.06]">
                  {[
                    { label: "Plan", icon: GitBranch },
                    { label: "Tools", icon: Wrench },
                    { label: "Review", icon: ShieldCheck },
                    { label: "Deliver", icon: CheckCircle2 },
                  ].map((step) => {
                    const Icon = step.icon;
                    return (
                      <div
                        key={step.label}
                        className="flex flex-col items-center gap-1 py-2 rounded-lg border border-white/[0.04] bg-white/[0.01]"
                      >
                        <Icon size={11} className="text-slate-600" />
                        <span className="text-[8px] font-mono uppercase tracking-wider text-slate-600">
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === "runs" && (
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center mb-3">
                  <History size={18} className="text-slate-500" />
                </div>
                <h2 className="text-sm font-semibold text-slate-200">No agent runs yet</h2>
                <p className="text-[11px] text-slate-500 mt-1.5 max-w-sm leading-relaxed">
                  Completed runs will appear here with the agent, task, tool timeline and output. Persisted history is part of checkpoint 2.
                </p>
                <button
                  onClick={() => setTab("console")}
                  className="mt-4 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-[10px] font-mono uppercase tracking-wider text-cyan-200 hover:bg-cyan-500/20 transition cursor-pointer"
                >
                  Open console
                  <ArrowRight size={12} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AGENT_REGISTRY.slice(0, 4).map((agent) => {
                  const Icon = agent.icon;
                  return (
                    <div
                      key={agent.id}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex items-center gap-3"
                    >
                      <div className="p-2 rounded-lg border">
                        <Icon size={13} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-semibold text-slate-200">{agent.name}</div>
                        <div className="text-[9px] font-mono text-slate-500 truncate">
                          last run · never
                        </div>
                      </div>
                      <Circle size={8} className="text-slate-700" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}