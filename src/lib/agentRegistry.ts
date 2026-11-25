import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Flame,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  User,
  Zap,
} from "lucide-react";

export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  description: string;
  model: string;
  status: "ready" | "standby" | "planned";
  color: string;
  icon: LucideIcon;
  tools: string[];
  tags: string[];
}

/**
 * Static seed registry for the shell. Checkpoint 2 will serve this from
 * /api/agents and add the real runner + run history.
 */
export const AGENT_REGISTRY: AgentInfo[] = [
  {
    id: "hermes",
    name: "Hermes",
    role: "Commander & Executor",
    description: "Delegation, code orchestration, execution graphs and tool routing.",
    model: "Gemini · reasoning",
    status: "ready",
    color: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    icon: Zap,
    tools: ["code.python", "files.read", "docs.create", "agents.delegate"],
    tags: ["core", "execution"],
  },
  {
    id: "claude",
    name: "Claude",
    role: "Analyst & Interpreter",
    description: "Empathetic translation, architecture notes, reports and explanations.",
    model: "Reasoning profile",
    status: "ready",
    color: "text-pink-300 bg-pink-500/10 border-pink-500/20",
    icon: User,
    tools: ["web.read", "docs.create", "memory.search"],
    tags: ["analysis", "writing"],
  },
  {
    id: "methos",
    name: "Methos",
    role: "Strategist & Risk",
    description: "Resource scheduling, task decomposition and risk assessment.",
    model: "Gemini · planning",
    status: "standby",
    color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
    icon: Target,
    tools: ["plan.create", "agents.delegate"],
    tags: ["planning"],
  },
  {
    id: "cyberstrike",
    name: "CyberStrike",
    role: "Security Operator",
    description: "Authorised vulnerability validation and defensive security review.",
    model: "Security profile",
    status: "standby",
    color: "text-red-300 bg-red-500/10 border-red-500/20",
    icon: Flame,
    tools: ["web.search", "browser.inspect"],
    tags: ["security", "guarded"],
  },
  {
    id: "penexpert",
    name: "PenExpert",
    role: "Autonomous Engineer",
    description: "Multi-stage autonomous testing, pathfinding and code execution.",
    model: "Gemini · tools",
    status: "standby",
    color: "text-purple-300 bg-purple-500/10 border-purple-500/20",
    icon: Briefcase,
    tools: ["code.python", "files.write", "browser.automation"],
    tags: ["engineering", "guarded"],
  },
  {
    id: "mythos",
    name: "Mythos",
    role: "Research & Discovery",
    description: "Surface recon, automated scanning, web research and discovery.",
    model: "Gemini · search",
    status: "standby",
    color: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20",
    icon: Sparkles,
    tools: ["web.search", "youtube.search"],
    tags: ["research"],
  },
  {
    id: "sonnet",
    name: "Sonnet",
    role: "Ethicist & Guardian",
    description: "Safety guidelines, policy checks and approval gates for risky tools.",
    model: "Policy profile",
    status: "ready",
    color: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20",
    icon: Shield,
    tools: ["policy.check", "approval.request"],
    tags: ["safety"],
  },
  {
    id: "opus",
    name: "Opus",
    role: "Verifier & QA",
    description: "Cross-validation, accuracy checks and final delivery review.",
    model: "Verification profile",
    status: "standby",
    color: "text-blue-300 bg-blue-500/10 border-blue-500/20",
    icon: RefreshCw,
    tools: ["verify.run", "test.run"],
    tags: ["quality"],
  },
];

export interface ToolInfo {
  id: string;
  label: string;
  description: string;
  category: "code" | "web" | "media" | "docs" | "browser" | "device" | "memory";
  status: "ready" | "planned";
}

export const TOOL_PALETTE: ToolInfo[] = [
  {
    id: "code.python",
    label: "Python runner",
    description: "Run scripts with output capture and a 10s timeout.",
    category: "code",
    status: "ready",
  },
  {
    id: "web.search",
    label: "Web search",
    description: "Search the live web and collect snippets.",
    category: "web",
    status: "planned",
  },
  {
    id: "web.read",
    label: "Read page",
    description: "Fetch a URL and return clean, capped text.",
    category: "web",
    status: "planned",
  },
  {
    id: "media.image",
    label: "Image studio",
    description: "Generate images and save them in chat.",
    category: "media",
    status: "ready",
  },
  {
    id: "docs.create",
    label: "Documents",
    description: "Create and edit PDF, DOCX and TXT files.",
    category: "docs",
    status: "ready",
  },
  {
    id: "files.read",
    label: "Workspace files",
    description: "List, read, write and delete workspace files.",
    category: "docs",
    status: "ready",
  },
  {
    id: "browser.automation",
    label: "Browser automation",
    description: "Drive a local Playwright agent for real browser actions.",
    category: "browser",
    status: "planned",
  },
  {
    id: "device.control",
    label: "Device actions",
    description: "Notifications, clipboard and guarded Android actions.",
    category: "device",
    status: "planned",
  },
  {
    id: "memory.search",
    label: "Memory core",
    description: "Save and search persistent recollections.",
    category: "memory",
    status: "ready",
  },
  {
    id: "youtube.search",
    label: "YouTube search",
    description: "Find videos, channels and playlists.",
    category: "web",
    status: "ready",
  },
];

export const TOOL_CATEGORIES: { id: ToolInfo["category"]; label: string }[] = [
  { id: "code", label: "Code" },
  { id: "web", label: "Web" },
  { id: "media", label: "Media" },
  { id: "docs", label: "Docs" },
  { id: "browser", label: "Browser" },
  { id: "device", label: "Device" },
  { id: "memory", label: "Memory" },
];
