import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Brain,
  FolderOpen,
  Home,
  MessageSquare,
  Settings,
} from "lucide-react";

export type PageId = "home" | "chat" | "agents" | "memory" | "workspace" | "settings";

export interface NavItem {
  id: PageId;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: "home",
    label: "Core",
    shortLabel: "Core",
    description: "Voice stage & companions",
    icon: Home,
  },
  {
    id: "chat",
    label: "Chat",
    shortLabel: "Chat",
    description: "Conversation transcript",
    icon: MessageSquare,
  },
  {
    id: "agents",
    label: "Agents",
    shortLabel: "Agents",
    description: "Swarm dashboard & console",
    icon: Bot,
  },
  {
    id: "memory",
    label: "Memory",
    shortLabel: "Memory",
    description: "Persistent recollections",
    icon: Brain,
  },
  {
    id: "workspace",
    label: "Workspace",
    shortLabel: "Files",
    description: "Documents & workspace files",
    icon: FolderOpen,
  },
  {
    id: "settings",
    label: "Settings",
    shortLabel: "Settings",
    description: "Engines, appearance & data",
    icon: Settings,
  },
];

export const MOBILE_PRIMARY_PAGES: PageId[] = ["home", "chat", "agents", "memory"];

export function getNavItem(id: PageId): NavItem {
  return NAV_ITEMS.find((item) => item.id === id) ?? NAV_ITEMS[0];
}
