import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SitaraAudioSession, LiveState } from "../lib/audio";
import { ambientSynth } from "../lib/ambientSynth";
import { Memory, MemoryCategory } from "../lib/memoryTypes";
import type { SitaraEmotion } from "../components/SitaraCoreVisualizer";
import { NAV_ITEMS, PageId } from "./nav";
import { isThemeKey } from "./theme";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date | string;
  image?: string;
  isTyped?: boolean;
  isGeneratingImage?: boolean;
  isTaskResult?: boolean;
  agentName?: string;
  taskTitle?: string;
  taskStatus?: string;
  resultMarkdown?: string;
}

export type SheetId = "more" | "bond" | "share" | "guide" | null;

function detectEmotionFromText(text: string): SitaraEmotion {
  const lower = text.toLowerCase();
  if (lower.includes("haha") || lower.includes("lol") || lower.includes("funny") || lower.includes("joke") || lower.includes("hehe") || lower.includes("wink")) return "playful";
  if (lower.includes("happy") || lower.includes("harmony") || lower.includes("glad") || lower.includes("joy") || lower.includes("wonderful") || lower.includes("love") || lower.includes("smile")) return "happy";
  if (lower.includes("wow") || lower.includes("awesome") || lower.includes("excited") || lower.includes("amazing") || lower.includes("yay") || lower.includes("incredible") || lower.includes("hype")) return "excited";
  if (lower.includes("really?") || lower.includes("curious") || lower.includes("interest") || lower.includes("tell me more") || lower.includes("why") || lower.includes("how") || lower.includes("wonder")) return "curious";
  if (lower.includes("think") || lower.includes("calculat") || lower.includes("analyz") || lower.includes("hmmm") || lower.includes("process") || lower.includes("let me see") || lower.includes("conclude")) return "thinking";
  if (lower.includes("proud") || lower.includes("achieved") || lower.includes("expert") || lower.includes("skill") || lower.includes("confidence") || lower.includes("succeed")) return "proud";
  if (lower.includes("sad") || lower.includes("sorry") || lower.includes("unfortunate") || lower.includes("grief") || lower.includes("bad") || lower.includes("regret") || lower.includes("alas") || lower.includes("cry")) return "sad";
  if (lower.includes("shock") || lower.includes("surprise") || lower.includes("gasp") || lower.includes("unexpected") || lower.includes("seriously") || lower.includes("oh my")) return "surprised";
  if (lower.includes("blush") || lower.includes("shy") || lower.includes("embarrass") || lower.includes("nervous") || lower.includes("oops") || lower.includes("sorry about")) return "embarrassed";
  if (lower.includes("what?") || lower.includes("confus") || lower.includes("puzzled") || lower.includes("dont know") || lower.includes("not sure") || lower.includes("wait")) return "confused";
  return "idle";
}

function readPageFromHash(): PageId {
  if (typeof window === "undefined") return "home";
  const hash = window.location.hash.replace("#", "").trim();
  const found = NAV_ITEMS.find((item) => item.id === hash);
  return found ? found.id : "home";
}

interface SitaraProviderProps {
  children: React.ReactNode;
}

const SitaraContext = createContext<any>(null);

export function useSitara() {
  const context = useContext(SitaraContext);
  if (!context) {
    throw new Error("useSitara must be used inside a SitaraProvider");
  }
  return context;
}

export function SitaraProvider({ children }: SitaraProviderProps) {
  const [state, setState] = useState<LiveState>("disconnected");
  const [session, setSession] = useState<SitaraAudioSession | null>(null);

  // Real-time screen sharing states
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isScreenSharingPaused, setIsScreenSharingPaused] = useState<boolean>(false);
  const [screenVisionMode, setScreenVisionMode] = useState<boolean>(true);

  // References to preserve state across intervals
  const screenStreamRef = useRef<MediaStream | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const screenIntervalRef = useRef<any>(null);

  const isPausedRef = useRef<boolean>(false);
  const screenVisionRef = useRef<boolean>(true);
  const stateRef = useRef<LiveState>("disconnected");
  const sessionRef = useRef<SitaraAudioSession | null>(null);

  // Navigation & overlay shell state
  const [activePage, setActivePageState] = useState<PageId>(readPageFromHash);
  const [activeSheet, setActiveSheet] = useState<SheetId>(null);
  const [chatUnread, setChatUnread] = useState<number>(0);
  const activePageRef = useRef<PageId>(activePage);
  const modelTurnStartedRef = useRef<boolean>(false);

  // Core stage state
  const [activeEmotion, setActiveEmotion] = useState<SitaraEmotion>("idle");
  const [themeColor, setThemeColor] = useState<string>("charcoal");
  const [userCaption, setUserCaption] = useState<string>("");
  const [modelCaption, setModelCaption] = useState<string>("");
  const [characterState, setCharacterState] = useState<"idle" | "thinking" | "talking">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  // Bond / relationship metadata
  const [affectionScore, setAffectionScore] = useState<number>(65);
  const [jealousyScore, setJealousyScore] = useState<number>(12);
  const [currentMood, setCurrentMood] = useState<string>("playful");
  const [interactionCount, setInteractionCount] = useState<number>(15);
  const [lastActiveTime, setLastActiveTime] = useState<string>("");
  const [highThinkingEnabled, setHighThinkingEnabled] = useState<boolean>(true);

  // Conversation state
  const [agentMode, setAgentMode] = useState<"sitara" | "hermes" | "dual">("sitara");
  const [typedMessage, setTypedMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [ambientTrack, setAmbientTrack] = useState<string>("stop");

  // Memory core
  const [memories, setMemories] = useState<Memory[]>([]);

  // PWA install
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // NVIDIA Nemotron 3 Ultra engine
  const [isNemotronEnabled, setIsNemotronEnabled] = useState<boolean>(() => {
    return localStorage.getItem("isNemotronEnabled") === "true";
  });
  const [nvidiaApiKey, setNvidiaApiKey] = useState<string>(() => {
    return localStorage.getItem("nvidiaApiKey") || "";
  });
  const [nvidiaKeySaved, setNvidiaKeySaved] = useState<boolean>(false);

  // Google Gemini engine
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem("geminiApiKey") || "";
  });
  const [geminiKeySaved, setGeminiKeySaved] = useState<boolean>(false);
  const [geminiKeyMasked, setGeminiKeyMasked] = useState<string>("");

  const navigate = useCallback((page: PageId) => {
    setActivePageState(page);
    setActiveSheet(null);
    if (page === "chat") setChatUnread(0);
    try {
      if (typeof window !== "undefined" && window.location.hash !== `#${page}`) {
        window.history.pushState({ page }, "", `#${page}`);
      }
    } catch (error) {
      // Hash updates are a progressive enhancement only.
    }
  }, []);

  useEffect(() => {
    activePageRef.current = activePage;
    if (activePage === "chat") {
      setChatUnread(0);
    }
  }, [activePage]);

  useEffect(() => {
    const syncFromLocation = () => {
      setActivePageState(readPageFromHash());
      setActiveSheet(null);
    };
    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener("hashchange", syncFromLocation);
    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener("hashchange", syncFromLocation);
    };
  }, []);

  const openSheet = useCallback((sheet: Exclude<SheetId, null>) => {
    setActiveSheet(sheet);
  }, []);

  const closeSheet = useCallback(() => {
    setActiveSheet(null);
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return false;
    try {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return true;
    } catch (error) {
      console.error("Install prompt failed:", error);
      return false;
    }
  }, [deferredPrompt]);

  // Keep refs in sync so long-lived callbacks never read stale state.
  useEffect(() => {
    isPausedRef.current = isScreenSharingPaused;
  }, [isScreenSharingPaused]);

  useEffect(() => {
    screenVisionRef.current = screenVisionMode;
  }, [screenVisionMode]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    return () => {
      if (screenIntervalRef.current) {
        clearInterval(screenIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    setThemeColor("charcoal");
  }, [agentMode]);

  useEffect(() => {
    fetch("/api/nvidia/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasKey) setNvidiaKeySaved(true);
      })
      .catch((e) => console.error("Error fetching NVIDIA config:", e));

    fetch("/api/gemini/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasKey) {
          setGeminiKeySaved(true);
          if (data.keyMasked) setGeminiKeyMasked(data.keyMasked);
        }
      })
      .catch((e) => console.error("Error fetching Gemini config:", e));
  }, []);

  const handleSaveGeminiKey = async () => {
    try {
      localStorage.setItem("geminiApiKey", geminiApiKey);
      const res = await fetch("/api/gemini/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: geminiApiKey }),
      });
      const data = await res.json();
      if (data.success) {
        setGeminiKeySaved(true);
        if (data.keyMasked) setGeminiKeyMasked(data.keyMasked);
        setTimeout(() => setGeminiKeySaved(false), 4000);
      }
    } catch (err) {
      console.error("Failed to save Gemini API Key:", err);
    }
  };

  const handleSaveNvidiaKey = async () => {
    try {
      localStorage.setItem("nvidiaApiKey", nvidiaApiKey);
      const res = await fetch("/api/nvidia/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: nvidiaApiKey }),
      });
      const data = await res.json();
      if (data.success) {
        setNvidiaKeySaved(true);
        setTimeout(() => setNvidiaKeySaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save NVIDIA API Key:", err);
    }
  };

  const handleToggleNemotron = () => {
    const nextVal = !isNemotronEnabled;
    setIsNemotronEnabled(nextVal);
    localStorage.setItem("isNemotronEnabled", String(nextVal));
  };

  // Load memories + metadata on boot
  useEffect(() => {
    const backupKey = "sitara_memories_backup";
    let localBackup: Memory[] = [];
    try {
      const backupStr = localStorage.getItem(backupKey);
      if (backupStr) localBackup = JSON.parse(backupStr);
    } catch (e) {
      console.error("Failed to parse local memories backup:", e);
    }

    fetch("/api/memories")
      .then((res) => res.json())
      .then(async (data) => {
        if (Array.isArray(data)) {
          if (data.length === 0 && localBackup.length > 0) {
            try {
              const syncResp = await fetch("/api/memories/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ memories: localBackup }),
              });
              const syncRes = await syncResp.json();
              if (syncRes && syncRes.memories) {
                setMemories(syncRes.memories);
                localStorage.setItem(backupKey, JSON.stringify(syncRes.memories));
              } else {
                setMemories(localBackup);
              }
            } catch (syncErr) {
              console.error("[Memory Recovery] Sync to server failed, using local backup:", syncErr);
              setMemories(localBackup);
            }
          } else {
            setMemories(data);
            localStorage.setItem(backupKey, JSON.stringify(data));
          }
        }
      })
      .catch((err) => {
        console.error("Initial persistent recollections load failure:", err);
        if (localBackup.length > 0) setMemories(localBackup);
      });

    fetch("/api/metadata")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (data.affectionScore !== undefined) setAffectionScore(data.affectionScore);
          if (data.jealousyScore !== undefined) setJealousyScore(data.jealousyScore);
          if (data.currentMood !== undefined) setCurrentMood(data.currentMood);
          if (data.interactionCount !== undefined) setInteractionCount(data.interactionCount);
          if (data.lastActiveTime !== undefined) setLastActiveTime(data.lastActiveTime);
          if (data.highThinkingEnabled !== undefined) setHighThinkingEnabled(data.highThinkingEnabled);
        }
      })
      .catch((err) => console.error("Initial metadata load failure:", err));
  }, []);

  useEffect(() => {
    localStorage.setItem("sitara_memories_backup", JSON.stringify(memories));
  }, [memories]);

  const handleAddManualMemory = async (category: MemoryCategory, text: string) => {
    try {
      const resp = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, text }),
      });
      const saved = await resp.json();
      if (saved && saved.id) setMemories((prev) => [...prev, saved]);
    } catch (err) {
      console.error("Manual database recollect upload error:", err);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      const resp = await fetch(`/api/memories/${id}`, { method: "DELETE" });
      const resObj = await resp.json();
      if (resObj && resObj.success) {
        setMemories((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error("Manual memory delete execution failed:", err);
    }
  };

  const handleClearAllMemories = async () => {
    try {
      const resp = await fetch("/api/memories", { method: "DELETE" });
      const resObj = await resp.json();
      if (resObj && resObj.success) setMemories([]);
    } catch (err) {
      console.error("Clear all memories execution failed:", err);
    }
  };

  const resetRelationship = async () => {
    try {
      const res = await fetch("/api/metadata/reset", { method: "POST" });
      const d = await res.json();
      if (d) {
        setAffectionScore(d.affectionScore);
        setJealousyScore(d.jealousyScore);
        setCurrentMood(d.currentMood);
        setInteractionCount(d.interactionCount);
        setLastActiveTime(d.lastActiveTime);
      }
      return true;
    } catch (e) {
      console.error("Relationship reset failed:", e);
      return false;
    }
  };

  // Screen sharing helpers
  const captureFrameAndSend = () => {
    const video = screenVideoRef.current;
    if (!video || isPausedRef.current || !screenVisionRef.current) return;
    if (stateRef.current === "disconnected") return;

    try {
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      if (!screenCanvasRef.current) {
        screenCanvasRef.current = document.createElement("canvas");
      }
      const canvas = screenCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const maxDim = 960;
      let width = video.videoWidth;
      let height = video.videoHeight;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(video, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.55);
      const base64 = dataUrl.split(",")[1];

      if (sessionRef.current && stateRef.current !== "disconnected") {
        sessionRef.current.sendVideoFrame(base64);
      }
    } catch (err) {
      console.error("[Screen Capture] Failed drawing frame to canvas:", err);
    }
  };

  const startScreenSharing = async () => {
    setErrorText(null);
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getDisplayMedia !== "function") {
      setErrorText("Screen sharing is not supported on mobile browsers. Please use the 'Camera Share' option instead or open on a computer/laptop!");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 5 } },
        audio: false,
      });

      screenStreamRef.current = stream;

      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      video.play().catch((e) => console.error("Video play warning:", e));
      screenVideoRef.current = video;

      setIsScreenSharing(true);
      setIsScreenSharingPaused(false);

      stream.getVideoTracks()[0].onended = () => stopScreenSharing();

      if (screenIntervalRef.current) clearInterval(screenIntervalRef.current);
      screenIntervalRef.current = setInterval(() => captureFrameAndSend(), 2000);
      setTimeout(() => captureFrameAndSend(), 500);
      setActiveSheet(null);
    } catch (e: any) {
      console.error("Screen sharing permission declined or missing API:", e);
      if (e.name !== "NotAllowedError") setErrorText(`Could not capture screen: ${e.message || e}`);
    }
  };

  const startCameraSharing = async (facingMode: "environment" | "user") => {
    setErrorText(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 5 } },
        audio: false,
      });

      screenStreamRef.current = stream;

      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      video.play().catch((e) => console.error("Camera video play warning:", e));
      screenVideoRef.current = video;

      setIsScreenSharing(true);
      setIsScreenSharingPaused(false);

      stream.getVideoTracks()[0].onended = () => stopScreenSharing();

      if (screenIntervalRef.current) clearInterval(screenIntervalRef.current);
      screenIntervalRef.current = setInterval(() => captureFrameAndSend(), 2000);
      setTimeout(() => captureFrameAndSend(), 500);
      setActiveSheet(null);
    } catch (e: any) {
      console.error("Camera sharing permission declined or failed:", e);
      setErrorText(`Could not start camera: ${e.message || e}`);
    }
  };

  const stopScreenSharing = () => {
    if (screenIntervalRef.current) {
      clearInterval(screenIntervalRef.current);
      screenIntervalRef.current = null;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      screenStreamRef.current = null;
    }

    if (screenVideoRef.current) {
      screenVideoRef.current.pause();
      screenVideoRef.current = null;
    }

    setIsScreenSharing(false);
    setIsScreenSharingPaused(false);
  };

  const pauseScreenSharing = () => setIsScreenSharingPaused(true);

  const resumeScreenSharing = () => {
    setIsScreenSharingPaused(false);
    setTimeout(() => captureFrameAndSend(), 100);
  };

  const switchScreenShare = () => {
    stopScreenSharing();
    setActiveSheet("share");
  };

  // Live audio session handlers (created once)
  useEffect(() => {
    const instance = new SitaraAudioSession({
      onStateChange: (newState) => {
        setState(newState);
        if (newState === "disconnected") {
          setUserCaption("");
          setModelCaption("");
          setActiveEmotion("idle");
          setCharacterState("idle");
        } else if (newState === "listening") {
          setActiveEmotion("idle");
          setCharacterState("idle");
          modelTurnStartedRef.current = false;
        } else if (newState === "speaking") {
          setCharacterState("talking");
        }
      },
      onTranscription: (role, text) => {
        if (role === "user") {
          modelTurnStartedRef.current = false;
          setUserCaption(text);
          setModelCaption("");
          setCharacterState("thinking");

          setChatHistory((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.role === "user" && !last.isTyped) {
              copy[copy.length - 1] = { ...last, text };
              return copy;
            }
            return [
              ...copy,
              { id: `voice-user-${Date.now()}`, role: "user", text, timestamp: new Date() },
            ];
          });
        } else if (role === "model") {
          if (!modelTurnStartedRef.current) {
            modelTurnStartedRef.current = true;
            if (activePageRef.current !== "chat") {
              setChatUnread((count) => count + 1);
            }
          }

          setModelCaption((prev) => {
            const next = prev + text;
            setActiveEmotion(detectEmotionFromText(next));

            setChatHistory((prevHistory) => {
              const copy = [...prevHistory];
              const last = copy[copy.length - 1];
              if (last && last.role === "model" && !last.isGeneratingImage) {
                copy[copy.length - 1] = { ...last, text: next };
                return copy;
              }
              return [
                ...copy,
                { id: `model-${Date.now()}`, role: "model", text: next, timestamp: new Date() },
              ];
            });

            return next;
          });
          setUserCaption("");
        }
      },
      onToolCall: (name, args, callback) => {
        console.log(`[App] Tool call triggered: ${name}`, args);

        if (name === "changeBackground") {
          const requested = String(args?.color || "").toLowerCase();
          const applied = isThemeKey(requested) ? requested : "charcoal";
          setThemeColor(applied);
          callback({ result: `Atmospheric theme shifted to ${applied}.` });
        } else if (name === "generateImage") {
          const prompt = args.prompt;
          const tempId = `gen-img-loading-${Date.now()}`;

          setChatHistory((prev) => [
            ...prev,
            {
              id: tempId,
              role: "model",
              text: `Generating an image for: "${prompt}"...`,
              isGeneratingImage: true,
              timestamp: new Date(),
            },
          ]);

          fetch("/api/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.image) {
                const mime = data.isFallback ? "image/svg+xml" : "image/jpeg";
                setChatHistory((prev) =>
                  prev.map((msg) =>
                    msg.id === tempId
                      ? {
                          id: `gen-img-success-${Date.now()}`,
                          role: "model",
                          text:
                            `I have generated this image for you: "${prompt}"` +
                            (data.isFallback
                              ? `\n\n*(Note: Free tier quota exceeded. Presenting custom holographic projection blueprint)*`
                              : ""),
                          image: `data:${mime};base64,${data.image}`,
                          timestamp: new Date(),
                        }
                      : msg
                  )
                );
                callback({ success: true, message: "Image successfully generated and shown to the user." });
              } else {
                setChatHistory((prev) =>
                  prev.map((msg) =>
                    msg.id === tempId
                      ? {
                          id: `gen-img-error-${Date.now()}`,
                          role: "model",
                          text: `Sorry, I couldn't generate the image: ${data.error || "Unknown model error"}`,
                          timestamp: new Date(),
                        }
                      : msg
                  )
                );
                callback({ success: false, error: data.error || "Failed to generate image" });
              }
            })
            .catch((err) => {
              setChatHistory((prev) =>
                prev.map((msg) =>
                  msg.id === tempId
                    ? {
                        id: `gen-img-error-${Date.now()}`,
                        role: "model",
                        text: `Sorry, an error occurred during image generation: ${err.message || err}`,
                        timestamp: new Date(),
                      }
                    : msg
                )
              );
              callback({ success: false, error: err.message || err });
            });
        } else if (name === "reportTaskResult") {
          const agentName = args.agentName || "System";
          const taskTitle = args.taskTitle || "Task Execution";
          const resultMarkdown = args.resultMarkdown || "";
          const status = args.status || "SUCCESS";

          setChatHistory((prev) => [
            ...prev,
            {
              id: `task-${Date.now()}`,
              role: "model",
              isTaskResult: true,
              agentName,
              taskTitle,
              resultMarkdown,
              taskStatus: status,
              text: `⚙️ [${agentName.toUpperCase()} - ${status}] ${taskTitle}\n\n${resultMarkdown}`,
              timestamp: new Date(),
            },
          ]);
          setActivePageState("chat");
          setActiveSheet(null);
          setChatUnread(0);
          callback({ success: true, message: "Task result successfully logged and displayed in the Chat panel." });
        } else if (name === "playAmbientTrack") {
          const trackType = args.trackType?.toLowerCase() || "stop";
          const resMsg = ambientSynth.play(trackType as any);
          setAmbientTrack(trackType);
          callback({ success: true, message: resMsg });
        } else {
          callback({ error: `Tool ${name} is not implemented.` });
        }
      },
      onError: (err) => setErrorText(err),
      onMemorySync: (updatedMemories) => {
        if (Array.isArray(updatedMemories)) setMemories(updatedMemories);
      },
      onMetadataSync: (metadata) => {
        if (metadata) {
          if (metadata.affectionScore !== undefined) setAffectionScore(metadata.affectionScore);
          if (metadata.jealousyScore !== undefined) setJealousyScore(metadata.jealousyScore);
          if (metadata.currentMood !== undefined) setCurrentMood(metadata.currentMood);
          if (metadata.interactionCount !== undefined) setInteractionCount(metadata.interactionCount);
          if (metadata.lastActiveTime !== undefined) setLastActiveTime(metadata.lastActiveTime);
        }
      },
      onFileSync: (data) => {
        setChatHistory((prev) => [
          ...prev,
          {
            id: `file-sync-${Date.now()}`,
            role: "model",
            text: `📁 **[Sitara Document Portal - ${data.action === "create" ? "Bana di gayi" : "Update ki gayi"}]:** Mangesh, maine aapke liye \`${data.name}\` safalta-purvak ${data.action === "create" ? "bana" : "update"} di hai! Aap isse **Workspace** tab mein dekh aur edit kar sakte hain! ✨`,
            timestamp: new Date(),
          },
        ]);
        setActivePageState("chat");
        setActiveSheet(null);
        setChatUnread(0);
      },
    });

    sessionRef.current = instance;
    setSession(instance);

    return () => {
      instance.disconnect();
      sessionRef.current = null;
    };
  }, []);

  const handleToggleConnection = async () => {
    setErrorText(null);
    if (!sessionRef.current) return;

    if (state === "disconnected") {
      await sessionRef.current.connect(agentMode, highThinkingEnabled);
    } else {
      sessionRef.current.disconnect();
    }
  };

  const handleToggleHighThinking = async () => {
    const newVal = !highThinkingEnabled;
    setHighThinkingEnabled(newVal);
    try {
      await fetch("/api/metadata/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ highThinkingEnabled: newVal }),
      });
    } catch (e) {
      console.error("Failed to save high thinking metadata setting:", e);
    }
  };

  const handleSendTypedMessage = async (text?: string) => {
    const msgToSend = typeof text === "string" ? text : typedMessage;
    if (!msgToSend.trim()) return;

    if (!sessionRef.current || state === "disconnected") {
      const userMsgId = `user-typed-${Date.now()}`;
      const modelMsgId = `sitara-typed-${Date.now()}`;

      setChatHistory((prev) => [
        ...prev,
        { id: userMsgId, role: "user", text: msgToSend.trim(), timestamp: new Date(), isTyped: true },
        { id: modelMsgId, role: "model", text: "Thinking...", timestamp: new Date() },
      ]);

      if (typeof text !== "string") setTypedMessage("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: msgToSend.trim(),
            agentMode,
            highThinkingEnabled,
            isNemotronEnabled,
          }),
        });

        let replyText = "Mangesh... lagta hai network thoda slow chal raha hai, par main aapki madad ke liye tayar hoon! Ek baar firse likhiye na please? 🥺✨";

        if (response.ok) {
          const contentType = response.headers.get("Content-Type") || "";
          if (contentType.includes("application/json")) {
            const data = await response.json();
            replyText = data.reply || "Main yahin hoon! (I am here!)";
          }
        }

        setChatHistory((prev) =>
          prev.map((msg) => (msg.id === modelMsgId ? { ...msg, text: replyText } : msg))
        );
      } catch (err) {
        console.error("Failed to get chat reply:", err);
        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.id === modelMsgId
              ? {
                  ...msg,
                  text: "Sorry, lagta hai mera network kharab hai. Ek baar firse try karo na please! (My network is acting up, please try again!)",
                }
              : msg
          )
        );
      }
      return;
    }

    setChatHistory((prev) => [
      ...prev,
      { id: `user-typed-${Date.now()}`, role: "user", text: msgToSend.trim(), timestamp: new Date(), isTyped: true },
    ]);

    sessionRef.current.sendTextMessage(msgToSend.trim());
    if (typeof text !== "string") setTypedMessage("");
  };

  const handleAttachImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      const cleanBase64 = base64Data.split(",")[1];

      setChatHistory((prev) => [
        ...prev,
        {
          id: `user-img-${Date.now()}`,
          role: "user",
          text: "Shared a visual frame with you.",
          image: base64Data,
          timestamp: new Date(),
        },
      ]);

      if (sessionRef.current && state !== "disconnected") {
        sessionRef.current.sendVideoFrame(cleanBase64);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            id: `sitara-local-warning-${Date.now()}`,
            role: "model",
            text: "I received your image! Please activate the primary core voice/mic link so I can talk about it live.",
            timestamp: new Date(),
          },
        ]);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleGenerateImageDirectly = (promptStr?: string) => {
    const prompt = typeof promptStr === "string" ? promptStr : typedMessage;
    if (!prompt.trim()) return;
    if (typeof promptStr !== "string") setTypedMessage("");

    const tempId = `gen-img-loading-${Date.now()}`;
    setChatHistory((prev) => [
      ...prev,
      { id: `user-prompt-${Date.now()}`, role: "user", text: `Draw an image: "${prompt}"`, timestamp: new Date() },
      { id: tempId, role: "model", text: `Generating an image for "${prompt}"...`, isGeneratingImage: true, timestamp: new Date() },
    ]);

    fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.image) {
          const mime = data.isFallback ? "image/svg+xml" : "image/jpeg";
          setChatHistory((prev) =>
            prev.map((msg) =>
              msg.id === tempId
                ? {
                    id: `gen-img-success-${Date.now()}`,
                    role: "model",
                    text:
                      `Here is the image I generated for: "${prompt}"` +
                      (data.isFallback
                        ? `\n\n*(Note: Free tier quota exceeded. Presenting custom holographic projection blueprint)*`
                        : ""),
                    image: `data:${mime};base64,${data.image}`,
                    timestamp: new Date(),
                  }
                : msg
            )
          );
        } else {
          setChatHistory((prev) =>
            prev.map((msg) =>
              msg.id === tempId
                ? {
                    id: `gen-img-error-${Date.now()}`,
                    role: "model",
                    text: `Sorry, image generation failed. ${data.error || "Unknown error"}`,
                    timestamp: new Date(),
                  }
                : msg
            )
          );
        }
      })
      .catch((err) => {
        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? {
                  id: `gen-img-error-${Date.now()}`,
                  role: "model",
                  text: `Sorry, an error occurred: ${err.message || err}`,
                  timestamp: new Date(),
                }
              : msg
          )
        );
      });
  };

  const clearChat = () => {
    setChatHistory([]);
    setChatUnread(0);
  };

  const agentDisplayName =
    agentMode === "sitara" ? "Sitara" : agentMode === "hermes" ? "Hermes" : "Sitara + Hermes";

  const currentBpm = useMemo(() => {
    let base = 68;
    if (state === "speaking") base += 14;
    base += Math.round(affectionScore * 0.25);
    base += Math.round(jealousyScore * 0.4);
    const wobble = Math.sin(Date.now() / 2500) * 1.5;
    return Math.max(60, Math.min(155, Math.round(base + wobble)));
  }, [state, affectionScore, jealousyScore]);

  const isStandalone = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      (window.navigator as any).standalone === true
    );
  }, []);

  const value = {
    // Navigation
    activePage,
    navigate,
    activeSheet,
    openSheet,
    closeSheet,
    chatUnread,

    // Session
    state,
    session,
    handleToggleConnection,
    agentMode,
    setAgentMode,
    agentDisplayName,
    isStandalone,
    installApp,
    canInstall: Boolean(deferredPrompt),

    // Captions & stage
    modelCaption,
    userCaption,
    characterState,
    activeEmotion,
    themeColor,
    setThemeColor,
    errorText,
    setErrorText,
    currentBpm,

    // Bond
    affectionScore,
    jealousyScore,
    currentMood,
    interactionCount,
    lastActiveTime,
    resetRelationship,

    // Engines
    highThinkingEnabled,
    handleToggleHighThinking,
    geminiApiKey,
    setGeminiApiKey,
    geminiKeySaved,
    geminiKeyMasked,
    handleSaveGeminiKey,
    nvidiaApiKey,
    setNvidiaApiKey,
    nvidiaKeySaved,
    handleSaveNvidiaKey,
    isNemotronEnabled,
    handleToggleNemotron,

    // Screen sharing
    isScreenSharing,
    isScreenSharingPaused,
    screenVisionMode,
    setScreenVisionMode,
    screenStreamRef,
    startScreenSharing,
    startCameraSharing,
    stopScreenSharing,
    pauseScreenSharing,
    resumeScreenSharing,
    switchScreenShare,

    // Chat
    chatHistory,
    setChatHistory,
    typedMessage,
    setTypedMessage,
    handleSendTypedMessage,
    handleAttachImage,
    handleGenerateImageDirectly,
    clearChat,
    ambientTrack,

    // Memory
    memories,
    handleAddManualMemory,
    handleDeleteMemory,
    handleClearAllMemories,
  };

  return <SitaraContext.Provider value={value}>{children}</SitaraContext.Provider>;
}
