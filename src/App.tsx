import React from "react";
import { SitaraProvider } from "./app/SitaraProvider";
import { AppShell } from "./app/AppShell";

export default function App() {
  return (
    <SitaraProvider>
      <AppShell />
    </SitaraProvider>
  );
}
