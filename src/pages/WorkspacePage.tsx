import React from "react";
import { FolderOpen } from "lucide-react";
import { Page } from "../components/layout/Page";
import { DocumentPortal } from "../components/DocumentPortal";
import { useSitara } from "../app/SitaraProvider";

export default function WorkspacePage() {
  const { affectionScore } = useSitara();

  return (
    <Page
      title="Workspace"
      subtitle="Documents, PDFs & generated files"
      icon={<FolderOpen size={17} />}
      scroll={false}
      maxWidth="max-w-5xl"
    >
      <DocumentPortal embedded affectionScore={affectionScore} />
    </Page>
  );
}
