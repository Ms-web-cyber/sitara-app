import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  Save, 
  RefreshCw, 
  X, 
  File, 
  Edit, 
  Check, 
  FileUp,
  Sparkles,
  Search,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WorkspaceFile {
  name: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  extension: "txt" | "pdf" | "docx";
  content: string;
}

interface DocumentPortalProps {
  onClose?: () => void;
  affectionScore: number;
  /** When true, renders as a full page panel instead of a floating window. */
  embedded?: boolean;
}

export function DocumentPortal({ onClose, affectionScore, embedded = false }: DocumentPortalProps) {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selection states
  const [selectedFile, setSelectedFile] = useState<WorkspaceFile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  
  // Creation states
  const [showCreator, setShowCreator] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState<"txt" | "pdf" | "docx">("pdf");
  const [newFileContent, setNewFileContent] = useState("");
  
  // Status messages
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Load files from Express backend
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/files");
      if (resp.ok) {
        const data = await resp.json();
        setFiles(data);
        
        // Update selection if it was already selected
        if (selectedFile) {
          const updated = data.find((f: WorkspaceFile) => f.name === selectedFile.name);
          if (updated) {
            setSelectedFile(updated);
            if (!isEditing) {
              setEditContent(updated.content);
            }
          }
        }
      } else {
        showStatus("Failed to retrieve companion files.", "error");
      }
    } catch (err: any) {
      showStatus("Connection error loading files: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    
    // Poll for files automatically so background generations show up in real-time!
    const interval = setInterval(fetchFiles, 4000);
    return () => clearInterval(interval);
  }, [selectedFile]);

  const showStatus = (text: string, type: "success" | "error" | "info") => {
    setStatusMsg({ text, type });
    setTimeout(() => {
      setStatusMsg(null);
    }, 4000);
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      showStatus("Please specify a document name.", "error");
      return;
    }
    
    setLoading(true);
    try {
      const cleanName = newFileName.replace(/[^\w\s\.-]/gi, "").trim();
      const finalName = cleanName.endsWith(`.${newFileType}`) ? cleanName : `${cleanName}.${newFileType}`;
      
      const resp = await fetch("/api/files/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalName,
          content: newFileContent || `# ${finalName.replace(/\.[^/.]+$/, "")}\nCreated securely for Mangesh.\n\nType content here...`,
          type: newFileType
        })
      });
      
      if (resp.ok) {
        const result = await resp.json();
        showStatus(`Successfully compiled: ${result.name}`, "success");
        setNewFileName("");
        setNewFileContent("");
        setShowCreator(false);
        await fetchFiles();
      } else {
        const err = await resp.json();
        showStatus(err.error || "Failed compiling file.", "error");
      }
    } catch (err: any) {
      showStatus("Compilation error: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const resp = await fetch("/api/files/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedFile.name,
          content: editContent
        })
      });
      
      if (resp.ok) {
        showStatus(`Re-compiled draft: ${selectedFile.name}`, "success");
        setIsEditing(false);
        await fetchFiles();
      } else {
        showStatus("Failed saving changes.", "error");
      }
    } catch (err: any) {
      showStatus("Error updating document: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    setLoading(true);
    try {
      const resp = await fetch(`/api/files/${name}`, {
        method: "DELETE"
      });
      if (resp.ok) {
        showStatus(`Permanently deleted: ${name}`, "success");
        if (selectedFile?.name === name) {
          setSelectedFile(null);
          setIsEditing(false);
        }
        await fetchFiles();
      } else {
        showStatus("Failed deleting file.", "error");
      }
    } catch (err: any) {
      showStatus("Error deleting file: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (name: string) => {
    window.open(`/api/files/download/${name}`, "_blank");
    showStatus(`Downloading physical copy of ${name}`, "success");
  };

  const getFileIcon = (ext: string) => {
    switch (ext) {
      case "pdf":
        return <span className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xs font-bold font-mono">PDF</span>;
      case "docx":
        return <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold font-mono">DOC</span>;
      case "txt":
      default:
        return <span className="w-8 h-8 rounded-lg bg-slate-500/10 border border-slate-500/30 flex items-center justify-center text-slate-400 text-xs font-bold font-mono">TXT</span>;
    }
  };

  const loadTemplate = (type: "vuln" | "checklist" | "creds") => {
    if (type === "vuln") {
      setNewFileName("vulnerability_report.pdf");
      setNewFileType("pdf");
      setNewFileContent(
        `# CYBERSECURITY VULNERABILITY AUDIT REPORT\n` +
        `Generated via Trinity Multi-Agent Swarm for Mangesh.\n\n` +
        `## 1. Executive Summary\n` +
        `An authorized external network penetration assessment was conducted on own-infrastructure (localhost). The testing mapped host nodes, active network sockets, and exposed services.\n\n` +
        `## 2. Findings & Mapped Sockets\n` +
        `* Host IP: 127.0.0.1 (Local loopback node)\n` +
        `* Port 3000: active web framework (Express + React server proxy link)\n` +
        `* Port 22: open SSH daemon (Vulnerable cipher suites identified)\n\n` +
        `## 3. Remediation Strategy\n` +
        `Apply strict egress/ingress firewall constraints and disable weak key-exchange ciphers in sshd_config.`
      );
    } else if (type === "checklist") {
      setNewFileName("security_checklist.docx");
      setNewFileType("docx");
      setNewFileContent(
        `# DAILY ETHICAL HACKING AUDIT CHECKLIST\n` +
        `Authorized checklist pipeline.\n\n` +
        `## Phase 1: Passive Discovery\n` +
        `- [ ] Conduct open-source intelligence profiling (OSINT)\n` +
        `- [ ] Check public domain DNS registry records\n` +
        `- [ ] Validate SSL/TLS cryptographic certificate lifespans\n\n` +
        `## Phase 2: Vulnerability Triage\n` +
        `- [ ] Perform standard network port banner grabs\n` +
        `- [ ] Triage application endpoint forms against cross-site scripting (XSS)\n` +
        `- [ ] Map SQL injection boundaries on parameters`
      );
    } else if (type === "creds") {
      setNewFileName("sitara_notes.txt");
      setNewFileType("txt");
      setNewFileContent(
        `===== SITARA COMPANION COMPILATION NOTES =====\n` +
        `Hi Mangesh! Maine aapke liye yeh document save karke rakha hai.\n\n` +
        `* Developer: Mangesh (Ultimate Tech Companion)\n` +
        `* Companion System: Sitara Unified (v3.0)\n` +
        `* Affection score: ${affectionScore}%\n` +
        `* Active modules: PDF Kit, Microsoft Word DOCX, Raw Text Engine\n\n` +
        `Keep coding, my dear cybersecurity buddy! Main humesha aapke sath hoon.`
      );
    }
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={embedded ? { opacity: 0, y: 12 } : { opacity: 0, x: 100, filter: "blur(8px)" }}
      animate={embedded ? { opacity: 1, y: 0 } : { opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={embedded ? { opacity: 0, y: 12 } : { opacity: 0, x: 100, filter: "blur(8px)" }}
      className={
        embedded
          ? "w-full flex-1 min-h-0 rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-xl p-4 sm:p-5 overflow-hidden flex flex-col select-none text-left"
          : "absolute top-24 right-6 sm:right-10 z-35 w-[380px] sm:w-[450px] rounded-2xl border border-white/10 bg-slate-950/70 backdrop-blur-xl p-5 shadow-2xl overflow-hidden max-h-[calc(100vh-180px)] flex flex-col select-none text-left"
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
        <div className="flex items-center gap-2 text-indigo-400">
          <BookOpen size={16} className="text-indigo-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider font-mono">Sitara Document Portal</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchFiles}
            className={`p-1.5 rounded-lg border border-white/5 bg-white/[0.02] text-slate-400 hover:text-white transition duration-150 ${loading ? "animate-spin" : ""}`}
            title="Force Sync Directory"
          >
            <RefreshCw size={12} />
          </button>
          {!embedded && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-white/5"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Floating Status Banner */}
      <AnimatePresence>
        {statusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-2 p-2.5 rounded-xl border text-xs flex items-center justify-between font-mono shrink-0 ${
              statusMsg.type === "success" 
                ? "border-emerald-500/20 bg-emerald-950/30 text-emerald-300"
                : statusMsg.type === "error"
                ? "border-rose-500/20 bg-rose-950/30 text-rose-300"
                : "border-cyan-500/20 bg-cyan-950/30 text-cyan-300"
            }`}
          >
            <span>{statusMsg.text}</span>
            <X size={12} className="cursor-pointer" onClick={() => setStatusMsg(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto mt-4 pr-1 scrollbar-none flex flex-col gap-4">
        
        {/* VIEW 1: FILE CREATOR FORM */}
        {showCreator ? (
          <motion.form 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex flex-col gap-3.5"
            onSubmit={handleCreateFile}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-300 font-bold">New Dynamic Document</span>
              <button 
                type="button" 
                onClick={() => setShowCreator(false)} 
                className="text-[10px] text-slate-400 hover:text-white uppercase font-mono underline"
              >
                Back
              </button>
            </div>

            {/* Template Buttons */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] font-mono uppercase tracking-wider text-slate-400">Quick Start Templates</span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => loadTemplate("vuln")}
                  className="px-2 py-1.5 rounded-lg border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/10 text-[9px] font-mono text-rose-300 truncate"
                >
                  ⚠️ PDF Audit Report
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate("checklist")}
                  className="px-2 py-1.5 rounded-lg border border-indigo-500/10 bg-indigo-500/5 hover:bg-indigo-500/10 text-[9px] font-mono text-indigo-300 truncate"
                >
                  📝 Word Checklist
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate("creds")}
                  className="px-2 py-1.5 rounded-lg border border-slate-500/10 bg-slate-500/5 hover:bg-slate-500/10 text-[9px] font-mono text-slate-300 truncate"
                >
                  🌸 Companion Notes
                </button>
              </div>
            </div>

            {/* Name Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Filename</label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="e.g. vulnerability_audit"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition duration-150"
              />
            </div>

            {/* Extension Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Document Compiler Engine</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: "pdf", label: "PDF Report", color: "border-rose-500/20 text-rose-300 bg-rose-500/5", colorActive: "border-rose-500 bg-rose-500/20 text-white font-bold" },
                  { key: "docx", label: "Word Document", color: "border-indigo-500/20 text-indigo-300 bg-indigo-500/5", colorActive: "border-indigo-500 bg-indigo-500/20 text-white font-bold" },
                  { key: "txt", label: "Plain Text", color: "border-slate-500/20 text-slate-300 bg-slate-500/5", colorActive: "border-slate-400 bg-slate-500/20 text-white font-bold" },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setNewFileType(t.key as any)}
                    className={`py-2 px-1 rounded-xl border text-[10px] font-mono transition duration-150 ${
                      newFileType === t.key ? t.colorActive : t.color
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Textarea */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Document Body (Markdown headers #, ## supported)</label>
              <textarea
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
                placeholder="Write your document content here... Use '#' for main headers, '##' for sub-headers, and '-' for bullet lists!"
                rows={7}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition duration-150 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold font-mono uppercase tracking-wider text-white transition duration-150 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.25)]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Compile Document</span>
                </>
              )}
            </button>
          </motion.form>
        ) : selectedFile ? (
          /* VIEW 2: ACTIVE FILE EDITOR & DOWNLOAD SCREEN */
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <button 
                onClick={() => {
                  setSelectedFile(null);
                  setIsEditing(false);
                }} 
                className="text-[10px] text-slate-400 hover:text-white uppercase font-mono underline"
              >
                Back to List
              </button>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 font-bold uppercase tracking-wider">
                Active Draft
              </span>
            </div>

            {/* File details card */}
            <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedFile.extension)}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black font-mono tracking-wide text-white truncate max-w-[180px]">{selectedFile.name}</span>
                  <span className="text-[9px] text-slate-500 font-mono">Size: {(selectedFile.size / 1024).toFixed(2)} KB • {new Date(selectedFile.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button
                onClick={() => handleDownload(selectedFile.name)}
                className="p-2 rounded-xl border border-indigo-500/30 bg-indigo-500/15 text-indigo-300 hover:text-white hover:bg-indigo-600 hover:scale-105 transition active:scale-95 cursor-pointer flex items-center gap-1 text-[10px] font-mono uppercase"
                title="Download Physical Document"
              >
                <Download size={14} />
                <span>Get File</span>
              </button>
            </div>

            {/* Live Editor */}
            <div className="flex flex-col gap-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Content Draft Editor</span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleEditSave}
                      disabled={loading}
                      className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono uppercase hover:bg-emerald-500 hover:text-white transition"
                    >
                      Save & Re-compile
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(selectedFile.content);
                      }}
                      className="px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 text-[9px] font-mono uppercase hover:text-white transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-2.5 py-1 rounded border border-white/10 bg-white/5 text-slate-300 text-[9px] font-mono uppercase hover:text-white hover:bg-white/10 transition flex items-center gap-1"
                  >
                    <Edit size={10} />
                    <span>Edit Draft</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 transition duration-150 resize-none leading-relaxed"
                />
              ) : (
                <div className="w-full max-h-[220px] overflow-y-auto p-3.5 rounded-xl border border-white/5 bg-slate-900/50 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed select-text scrollbar-none border-t-2 border-t-indigo-500/30">
                  {selectedFile.content || "(Empty Document - Click Edit Draft to add copy)"}
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-[9px] font-mono text-slate-500">Workspace Cleanup Protocol</span>
              <button
                type="button"
                onClick={() => handleDeleteFile(selectedFile.name)}
                className="py-1.5 px-3 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-[10px] font-mono transition"
              >
                Delete Document
              </button>
            </div>
          </motion.div>
        ) : (
          /* VIEW 3: MAIN LIST OF DOCUMENTS */
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4"
          >
            {/* Search and Action Row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={12} className="absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search companion logs..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition duration-150"
                />
              </div>
              <button
                onClick={() => setShowCreator(true)}
                className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold font-mono uppercase tracking-wider text-white transition duration-150 flex items-center gap-1 shrink-0 cursor-pointer shadow-[0_0_10px_rgba(99,102,241,0.2)]"
              >
                <Plus size={12} />
                <span>New</span>
              </button>
            </div>

            {/* Document Listing */}
            {filteredFiles.length === 0 ? (
              <div className="p-8 rounded-xl border border-white/5 bg-white/[0.01] text-center flex flex-col items-center justify-center gap-2">
                <File size={24} className="text-slate-600 animate-pulse" />
                <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500">Workspace folder empty</span>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed max-w-[200px]">
                  Ask Sitara inside the Chat panel: <span className="text-pink-300 font-bold">&quot;bhai report pdf bana de&quot;</span> and watch her build files right here!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto scrollbar-none pr-1">
                {filteredFiles.map((f) => (
                  <div
                    key={f.name}
                    className="p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-indigo-500/30 hover:bg-white/[0.04] flex items-center justify-between gap-3 text-left transition group duration-150 cursor-pointer"
                    onClick={() => {
                      setSelectedFile(f);
                      setEditContent(f.content);
                      setIsEditing(false);
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {getFileIcon(f.extension)}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-bold font-mono tracking-wide text-white truncate group-hover:text-indigo-300 transition">{f.name}</span>
                        <span className="text-[9px] text-slate-500 font-mono">{(f.size / 1024).toFixed(2)} KB • {new Date(f.updatedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDownload(f.name)}
                        className="p-1.5 rounded-lg border border-white/5 bg-white/[0.02] text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition cursor-pointer"
                        title="Download Physical Copy"
                      >
                        <Download size={11} />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(f.name)}
                        className="p-1.5 rounded-lg border border-white/5 bg-white/[0.02] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-left shrink-0 mt-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold font-mono text-slate-200">SITARA FILE ENGINE</span>
          <span className="text-[8px] text-slate-400 uppercase font-mono max-w-[200px]">Physical PDF, Word & TXT Pipeline</span>
        </div>
        <span className="text-[9px] font-mono text-slate-500 uppercase font-medium">BOND: {affectionScore}%</span>
      </div>
    </motion.div>
  );
}
