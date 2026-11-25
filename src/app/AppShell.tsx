import React from "react";
import { Heart, LayoutGrid, Sparkles, Video } from "lucide-react";
import { useSitara } from "./SitaraProvider";
import { PageId } from "./nav";
import { SideRail } from "../components/layout/SideRail";
import { BottomNav } from "../components/layout/BottomNav";
import { LivePill } from "../components/layout/LivePill";
import { Sheet } from "../components/layout/Sheet";
import { BondPanel } from "../components/BondPanel";
import { MoreSheet } from "../components/sheets/MoreSheet";
import { ShareSheet } from "../components/sheets/ShareSheet";
import { GuideSheet } from "../components/sheets/GuideSheet";
import CorePage from "../pages/CorePage";
import ChatPage from "../pages/ChatPage";
import AgentsPage from "../pages/AgentsPage";
import MemoryPage from "../pages/MemoryPage";
import WorkspacePage from "../pages/WorkspacePage";
import SettingsPage from "../pages/SettingsPage";

const PAGES: Record<PageId, React.ComponentType> = {
  home: CorePage,
  chat: ChatPage,
  agents: AgentsPage,
  memory: MemoryPage,
  workspace: WorkspacePage,
  settings: SettingsPage,
};

/**
 * Root layout for the whole app.
 * Mobile: page area + bottom tab bar.
 * Desktop: persistent side rail + wide page area.
 * One shared Sheet host serves every overlay (bond, share, guide, more).
 */
export function AppShell() {
  const { activePage, activeSheet, closeSheet } = useSitara();
  const ActivePage = PAGES[activePage] ?? CorePage;

  return (
    <div className="h-[100dvh] w-full flex flex-col md:flex-row overflow-hidden bg-[#020205] text-slate-100 pt-[env(safe-area-inset-top)]">
      <SideRail />

      <div className="flex-1 min-w-0 min-h-0 flex flex-col relative">
        <main className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
          <ActivePage />
        </main>

        <BottomNav />
        <LivePill />
      </div>

      <Sheet
        open={activeSheet === "bond"}
        onClose={closeSheet}
        title="Bond matrix"
        subtitle="Emotional telemetry & relationship stage"
        icon={<Heart size={16} />}
      >
        <BondPanel />
      </Sheet>

      <Sheet
        open={activeSheet === "share"}
        onClose={closeSheet}
        title="Share vision"
        subtitle="Camera & screen streaming"
        icon={<Video size={16} />}
      >
        <ShareSheet open={activeSheet === "share"} onClose={closeSheet} />
      </Sheet>

      <Sheet
        open={activeSheet === "guide"}
        onClose={closeSheet}
        title="Voice triggers"
        subtitle="Things you can say aloud"
        icon={<Sparkles size={16} />}
      >
        <GuideSheet />
      </Sheet>

      <Sheet
        open={activeSheet === "more"}
        onClose={closeSheet}
        title="More"
        subtitle="Workspace, bond & app"
        icon={<LayoutGrid size={16} />}
      >
        <MoreSheet />
      </Sheet>
    </div>
  );
}
