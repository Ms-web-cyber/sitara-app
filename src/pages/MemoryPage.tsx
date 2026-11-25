import React from "react";
import { Brain } from "lucide-react";
import { Page } from "../components/layout/Page";
import { MemoryDashboard } from "../components/MemoryDashboard";
import { useSitara } from "../app/SitaraProvider";

export default function MemoryPage() {
  const {
    memories,
    themeColor,
    chatHistory,
    handleAddManualMemory,
    handleDeleteMemory,
    handleClearAllMemories,
  } = useSitara();

  return (
    <Page
      title="Memory core"
      subtitle={`${memories.length} persistent recollections`}
      icon={<Brain size={17} />}
      scroll={false}
    >
      <MemoryDashboard
        embedded
        isOpen
        onClose={() => {}}
        memories={memories}
        themeColor={themeColor}
        chatHistory={chatHistory}
        onAddMemory={handleAddManualMemory}
        onDeleteMemory={handleDeleteMemory}
        onClearAllMemories={handleClearAllMemories}
      />
    </Page>
  );
}
