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

    return (
    <div className="min-h-full bg-[#0205] text-slate-100">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-mono uppercase tracking-wider transition cursor-pointer bg-white/5 text-slate-300"
              >
                <Icon size={13} />
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="text-slate-400 text-sm">Agents page content</div>
      </div>
    </div>
  );
}
  );
}
