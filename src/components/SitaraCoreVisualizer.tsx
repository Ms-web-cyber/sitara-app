import React, { useEffect, useRef, useState } from "react";
import { SitaraAudioSession, LiveState } from "../lib/audio";
import { Sparkles } from "lucide-react";

export type SitaraEmotion = 
  | "idle" 
  | "happy" 
  | "excited" 
  | "curious" 
  | "thinking" 
  | "proud" 
  | "sad" 
  | "confused" 
  | "surprised" 
  | "embarrassed" 
  | "playful"
  | "jealous"
  | "clingy"
  | "longing"
  | "sweet"
  | "teasing"
  | "hyperactive";

interface SitaraCoreVisualizerProps {
  session: SitaraAudioSession | null;
  state: LiveState;
  themeColor: string; // Violet, crimson, emerald, celestial, gold, rose, charcoal
  activeEmotion?: SitaraEmotion;
  characterState: "idle" | "thinking" | "talking";
  currentMood?: string;
}

// Theme matching mapping function (extremely beautiful cinematic color tones)
const getGlowColors = (themeColor: string) => {
  switch (themeColor) {
    case "violet":
      return { primary: "rgba(147, 51, 234, 1)", secondary: "rgba(192, 38, 211, 0.8)", glow: "rgba(168, 85, 247, 0.7)" };
    case "crimson":
      return { primary: "rgba(225, 29, 72, 1)", secondary: "rgba(234, 88, 12, 0.8)", glow: "rgba(244, 63, 94, 0.7)" };
    case "emerald":
      return { primary: "rgba(5, 150, 105, 1)", secondary: "rgba(13, 148, 136, 0.8)", glow: "rgba(16, 185, 129, 0.7)" };
    case "celestial":
      return { primary: "rgba(2, 132, 199, 1)", secondary: "rgba(8, 145, 178, 0.8)", glow: "rgba(14, 165, 233, 0.7)" };
    case "gold":
      return { primary: "rgba(202, 138, 4, 1)", secondary: "rgba(217, 119, 6, 0.8)", glow: "rgba(234, 179, 8, 0.7)" };
    case "rose":
      return { primary: "rgba(219, 39, 119, 1)", secondary: "rgba(220, 38, 38, 0.8)", glow: "rgba(236, 72, 153, 0.7)" };
    default:
      return { primary: "rgba(34, 211, 238, 1)", secondary: "rgba(79, 70, 229, 0.8)", glow: "rgba(6, 182, 212, 0.7)" };
  }
};

export const SitaraCoreVisualizer: React.FC<SitaraCoreVisualizerProps> = ({
  session,
  state,
  themeColor,
  activeEmotion = "idle",
  characterState,
  currentMood
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  
  // Video element refs for character state machine
  const idleVideoRef = useRef<HTMLVideoElement | null>(null);
  const thinkingVideoRef = useRef<HTMLVideoElement | null>(null);
  const talkingVideoRef = useRef<HTMLVideoElement | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const colors = getGlowColors(themeColor);

  const effectiveMood = (currentMood || activeEmotion || "idle").toLowerCase();

  const getMoodAnimationClass = (m: string) => {
    switch (m) {
      case "happy": return "animate-mood-happy";
      case "jealous": return "animate-mood-jealous";
      case "clingy": return "animate-mood-clingy";
      case "longing": return "animate-mood-longing";
      case "playful": return "animate-mood-playful";
      case "sweet": return "animate-mood-sweet";
      case "teasing": return "animate-mood-teasing";
      case "hyperactive": return "animate-mood-hyperactive";
      case "embarrassed": return "animate-mood-embarrassed";
      case "excited": return "animate-mood-excited";
      case "curious": return "animate-mood-curious";
      case "thinking": return "animate-mood-thinking";
      case "sad": return "animate-mood-sad";
      default: return "animate-holographic-breath";
    }
  };

  const handleVideoError = (videoName: string) => {
    console.warn(`[Sitara Web Video] Failed to load video source for: ${videoName}`);
    setHasError(true);
  };

  // Interaction and tracking references
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.4 });
  const targetMouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.4 });
  
  // Physics & Animation states
  const speechVolumeRef = useRef<number>(0);

  // Floating sci-fi background particle arrays
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    speed: number;
    size: number;
    opacity: number;
  }>>([]);

  // Synchronized video playback state manager (highly polished and flicker-free)
  useEffect(() => {
    const playVideo = (videoEl: HTMLVideoElement | null) => {
      if (!videoEl) return;
      try {
        videoEl.currentTime = 0;
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn("Autoplay block detected, retrying muted play:", error);
          });
        }
      } catch (err) {}
    };

    const pauseVideo = (videoEl: HTMLVideoElement | null) => {
      if (!videoEl) return;
      try {
        videoEl.pause();
      } catch (err) {}
    };

    if (characterState === "idle") {
      playVideo(idleVideoRef.current);
      pauseVideo(thinkingVideoRef.current);
      pauseVideo(talkingVideoRef.current);
    } else if (characterState === "thinking") {
      playVideo(thinkingVideoRef.current);
      pauseVideo(idleVideoRef.current);
      pauseVideo(talkingVideoRef.current);
    } else if (characterState === "talking") {
      playVideo(talkingVideoRef.current);
      pauseVideo(idleVideoRef.current);
      pauseVideo(thinkingVideoRef.current);
    }
  }, [characterState]);

  // Cursor position tracking hook
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetMouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Main high speed Canvas graphics rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    // Generate responsive background floating stars
    const generateParticles = () => {
      const count = Math.min(60, Math.floor(width / 24));
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height + height * 0.1,
        speed: Math.random() * 0.35 + 0.12,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
      }));
    };

    generateParticles();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      generateParticles();
    };

    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const systemTime = performance.now();

      // Dynamic Audio analysis fetching from real voice session
      let audioLevel = 0;
      let bufferLength = 64;
      const dataArray = new Uint8Array(bufferLength);
      let activeAnalyser = null;

      if (state === "speaking" && session?.outputAnalyser) {
        activeAnalyser = session.outputAnalyser;
      } else if (state === "listening" && session?.inputAnalyser) {
        activeAnalyser = session.inputAnalyser;
      }

      if (activeAnalyser) {
        try {
          activeAnalyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          audioLevel = sum / bufferLength; // 0 to 255
        } catch (e) {}
      }

      // Smooth amplitude tracking for real-time particle excitation
      speechVolumeRef.current += (audioLevel / 255 - speechVolumeRef.current) * 0.2;

      // Cinematic ambient stardust sizing
      const baseScale = height / 440;
      const s = Math.max(0.95, Math.min(1.85, baseScale)); // scale multiplier

      // Smooth cursor mouse tracking lag
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;

      const centerX = width / 2;

      // ==========================================
      // 1. DRAW GRAND STAGE VOLUMETRIC PROJECTOR BEAM (Cinematic Glow Backlight)
      // ==========================================
      ctx.save();
      const projectorCenterY = height + 40;
      const baseDiameterX = 280 * s;

      // Volumetric light beams shooting up from projector base
      const conicalBeamGrad = ctx.createLinearGradient(centerX, height * 0.25, centerX, height);
      conicalBeamGrad.addColorStop(0, "rgba(0,0,0,0)");
      conicalBeamGrad.addColorStop(0.4, colors.primary.replace("1)", "0.03)"));
      conicalBeamGrad.addColorStop(0.75, colors.primary.replace("1)", "0.08)"));
      conicalBeamGrad.addColorStop(1, colors.secondary.replace("0.8)", "0.18)"));

      ctx.fillStyle = conicalBeamGrad;
      ctx.beginPath();
      ctx.moveTo(centerX - baseDiameterX * 0.35, projectorCenterY - 145);
      ctx.lineTo(centerX + baseDiameterX * 0.35, projectorCenterY - 145);
      ctx.lineTo(centerX + baseDiameterX * 1.5, height);
      ctx.lineTo(centerX - baseDiameterX * 1.5, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // ==========================================
      // 2. MINIMALIST ATMOSPHERE NEURAL FIELDS (SUBTLE GLITCH)
      // ==========================================
      const applyGlitch = (state === "connecting" && Math.random() < 0.1) || (Math.random() < 0.005);
      if (applyGlitch) {
        ctx.save();
        ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 2);
        ctx.fillStyle = Math.random() < 0.5 ? "rgba(236,72,153,0.03)" : "rgba(34,211,238,0.03)";
        ctx.fillRect(0, 0, width, height);
      }

      // ==========================================
      // 3. UPDATE AND DRAW HOLOGRAM NEURAL PARTICLES RISING (Cinematic Stardust)
      // ==========================================
      const mood = effectiveMood;
      particlesRef.current.forEach((p) => {
        let speedMult = 1;
        let horizOffset = 0;

        if (mood === "jealous") {
          speedMult = 1.4;
          horizOffset = (Math.random() - 0.5) * 2.2;
        } else if (mood === "hyperactive") {
          speedMult = 2.2;
          horizOffset = Math.sin(systemTime * 0.01 + p.size) * 1.5;
        } else if (mood === "playful" || mood === "teasing") {
          speedMult = 1.25;
          horizOffset = Math.sin(p.y * 0.025 + systemTime * 0.003) * 1.2;
        } else if (mood === "sad" || mood === "longing") {
          speedMult = 0.65;
        } else if (mood === "happy" || mood === "sweet" || mood === "clingy") {
          speedMult = 1.1;
        }

        const riseSpeed = p.speed * (1 + speechVolumeRef.current * 1.8) * speedMult;
        p.y -= riseSpeed;
        
        // Horizontal drift sway
        p.x += Math.sin(p.y * 0.015 + p.size) * 0.4 + horizOffset;
        
        // Transparency matches base lift height
        const currentOpacity = p.opacity * Math.max(0, p.y / height);

        // Recirculate particle if it reaches up too high near her crown
        if (p.y < height * 0.12) {
          p.y = height + Math.random() * 30;
          p.x = Math.random() * width;
        }

        let particleColor = colors.primary.replace("1)", `${currentOpacity * 0.45})`);
        if (mood === "jealous") {
          particleColor = `rgba(244, 63, 94, ${currentOpacity * 0.85})`;
        } else if (mood === "happy" || mood === "excited") {
          particleColor = `rgba(250, 204, 21, ${currentOpacity * 0.75})`;
        } else if (mood === "sweet" || mood === "clingy") {
          particleColor = `rgba(244, 114, 182, ${currentOpacity * 0.7})`;
        } else if (mood === "hyperactive") {
          particleColor = `rgba(34, 211, 238, ${currentOpacity * 0.85})`;
        } else if (mood === "sad" || mood === "longing") {
          particleColor = `rgba(147, 51, 234, ${currentOpacity * 0.6})`;
        }

        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * s, 0, Math.PI * 2);
        ctx.fill();
      });

      if (applyGlitch) {
        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [session, state, themeColor, activeEmotion, characterState, effectiveMood]);

  return (
    <div className="relative w-full h-full flex items-center justify-center -translate-y-10 sm:-translate-y-12">
      {/* 1. Behind Overlay / Atmospheric Backlight Glow (Z-index 0) */}
      <div className="absolute inset-0 bg-transparent flex items-center justify-center pointer-events-none z-0">
        <div className={`w-[500px] h-[500px] rounded-full blur-[140px] opacity-25 bg-gradient-to-tr transition-all duration-1000 ${
          themeColor === "violet" ? "from-purple-600/30 to-fuchsia-600/5" :
          themeColor === "crimson" ? "from-rose-600/30 to-orange-600/5" :
          themeColor === "emerald" ? "from-emerald-600/30 to-teal-600/5" :
          themeColor === "celestial" ? "from-sky-600/30 to-cyan-600/5" :
          themeColor === "gold" ? "from-amber-600/30 to-yellow-600/5" :
          themeColor === "rose" ? "from-rose-600/30 to-pink-600/5" :
          "from-indigo-600/30 to-cyan-600/5"
        }`} />
      </div>

      {/* 2. Character Videos state crossfade manager (Z-index 10) */}
      <div 
        id="sitara-animated-presence"
        className="absolute z-10 w-full h-full flex items-center justify-center pointer-events-auto transition-all duration-700"
      >
        <style>{`
          @keyframes holographic-breathing {
            0%, 100% {
              filter: drop-shadow(0 0 15px var(--hologram-glow, rgba(6, 182, 212, 0.2)));
            }
            50% {
              filter: drop-shadow(0 0 35px var(--hologram-glow, rgba(6, 182, 212, 0.5)));
            }
          }
          .animate-holographic-breath {
            animation: holographic-breathing 4.8s ease-in-out infinite;
          }

          @keyframes mood-happy {
            0%, 100% {
              transform: scale(1) translateY(0);
              filter: drop-shadow(0 0 20px var(--hologram-glow, rgba(6, 182, 212, 0.3))) drop-shadow(0 0 35px rgba(234, 179, 8, 0.3));
            }
            50% {
              transform: scale(1.025) translateY(-5px);
              filter: drop-shadow(0 0 40px var(--hologram-glow, rgba(6, 182, 212, 0.5))) drop-shadow(0 0 55px rgba(234, 179, 8, 0.55));
            }
          }

          @keyframes mood-jealous {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
              filter: drop-shadow(0 0 25px rgba(225, 29, 72, 0.6)) drop-shadow(0 0 45px rgba(244, 63, 94, 0.45));
            }
            20% {
              transform: translate3d(-3px, 1.5px, 0) scale(1.01);
              filter: drop-shadow(0 0 35px rgba(225, 29, 72, 0.85));
            }
            40% {
              transform: translate3d(3px, -1.5px, 0) scale(0.992);
              filter: drop-shadow(0 0 50px rgba(244, 63, 94, 0.95));
            }
            60% {
              transform: translate3d(-2.5px, -1px, 0) scale(1.015);
              filter: drop-shadow(0 0 35px rgba(225, 29, 72, 0.85));
            }
            80% {
              transform: translate3d(2.5px, 1px, 0) scale(1);
            }
          }

          @keyframes mood-clingy {
            0%, 100% {
              transform: translateY(0) rotate(0deg) scale(1.02);
              filter: drop-shadow(0 0 28px rgba(236, 72, 153, 0.45));
            }
            50% {
              transform: translateY(-6px) rotate(1.2deg) scale(1.038);
              filter: drop-shadow(0 0 48px rgba(219, 39, 119, 0.7));
            }
          }

          @keyframes mood-longing {
            0%, 100% {
              transform: translateY(0) scale(0.99);
              filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.35));
            }
            50% {
              transform: translateY(-8px) scale(1.012);
              filter: drop-shadow(0 0 45px rgba(168, 85, 247, 0.6));
            }
          }

          @keyframes mood-playful {
            0%, 100% {
              transform: translateY(0) rotate(0deg) scale(1);
              filter: drop-shadow(0 0 22px rgba(6, 182, 212, 0.4));
            }
            25% {
              transform: translateY(-6px) rotate(-1.5deg) scale(1.018);
            }
            50% {
              transform: translateY(1px) rotate(0deg) scale(1);
              filter: drop-shadow(0 0 38px rgba(16, 185, 129, 0.6));
            }
            75% {
              transform: translateY(-5px) rotate(1.5deg) scale(1.018);
            }
          }

          @keyframes mood-sweet {
            0%, 100% {
              transform: scale(1) translateY(0);
              filter: drop-shadow(0 0 22px rgba(244, 114, 182, 0.4));
            }
            50% {
              transform: scale(1.022) translateY(-3px);
              filter: drop-shadow(0 0 42px rgba(251, 113, 133, 0.7));
            }
          }

          @keyframes mood-teasing {
            0%, 100% {
              transform: rotate(0deg) translateY(0) scale(1);
              filter: drop-shadow(0 0 22px rgba(168, 85, 247, 0.45));
            }
            33% {
              transform: rotate(2deg) translateY(-4px) scale(1.015);
              filter: drop-shadow(0 0 36px rgba(236, 72, 153, 0.65));
            }
            66% {
              transform: rotate(-1.5deg) translateY(2px) scale(1.005);
            }
          }

          @keyframes mood-hyperactive {
            0%, 100% {
              transform: translateY(0) scale(1);
              filter: drop-shadow(0 0 28px rgba(250, 204, 21, 0.65));
            }
            25% {
              transform: translateY(-5px) scale(1.03);
              filter: drop-shadow(0 0 50px rgba(34, 211, 238, 0.85));
            }
            50% {
              transform: translateY(2px) scale(0.992);
            }
            75% {
              transform: translateY(-4px) scale(1.025);
              filter: drop-shadow(0 0 50px rgba(236, 72, 153, 0.85));
            }
          }

          @keyframes mood-embarrassed {
            0%, 100% {
              transform: scale(0.985) translateY(2px);
              filter: drop-shadow(0 0 25px rgba(244, 63, 94, 0.45));
            }
            25% {
              transform: scale(0.982) translate3d(-2px, 2px, 0);
            }
            75% {
              transform: scale(0.988) translate3d(2px, 1px, 0);
              filter: drop-shadow(0 0 38px rgba(251, 113, 133, 0.65));
            }
          }

          @keyframes mood-excited {
            0%, 100% {
              transform: translateY(0) scale(1);
              filter: drop-shadow(0 0 28px rgba(234, 179, 8, 0.55));
            }
            50% {
              transform: translateY(-9px) scale(1.032);
              filter: drop-shadow(0 0 52px rgba(250, 204, 21, 0.8));
            }
          }

          @keyframes mood-curious {
            0%, 100% {
              transform: rotate(0deg) translateY(0);
              filter: drop-shadow(0 0 22px rgba(56, 189, 248, 0.4));
            }
            50% {
              transform: rotate(2.5deg) translateY(-5px) scale(1.012);
              filter: drop-shadow(0 0 40px rgba(14, 165, 233, 0.65));
            }
          }

          @keyframes mood-thinking {
            0%, 100% {
              transform: scale(1) translateY(0);
              filter: drop-shadow(0 0 22px rgba(168, 85, 247, 0.35));
            }
            50% {
              transform: scale(1.018) translateY(-4px);
              filter: drop-shadow(0 0 42px rgba(192, 38, 211, 0.6));
            }
          }

          @keyframes mood-sad {
            0%, 100% {
              transform: translateY(4px) scale(0.98);
              filter: drop-shadow(0 0 16px rgba(99, 102, 241, 0.3));
            }
            50% {
              transform: translateY(8px) scale(0.972);
              filter: drop-shadow(0 0 28px rgba(79, 70, 229, 0.45));
            }
          }

          .animate-mood-happy { animation: mood-happy 3.2s ease-in-out infinite; }
          .animate-mood-jealous { animation: mood-jealous 0.32s ease-in-out infinite; }
          .animate-mood-clingy { animation: mood-clingy 2.4s ease-in-out infinite; }
          .animate-mood-longing { animation: mood-longing 4.5s ease-in-out infinite; }
          .animate-mood-playful { animation: mood-playful 1.8s ease-in-out infinite; }
          .animate-mood-sweet { animation: mood-sweet 3.0s ease-in-out infinite; }
          .animate-mood-teasing { animation: mood-teasing 1.6s ease-in-out infinite; }
          .animate-mood-hyperactive { animation: mood-hyperactive 0.72s ease-in-out infinite; }
          .animate-mood-embarrassed { animation: mood-embarrassed 0.42s ease-in-out infinite; }
          .animate-mood-excited { animation: mood-excited 1.2s ease-in-out infinite; }
          .animate-mood-curious { animation: mood-curious 2.8s ease-in-out infinite; }
          .animate-mood-thinking { animation: mood-thinking 3.5s ease-in-out infinite; }
          .animate-mood-sad { animation: mood-sad 4.0s ease-in-out infinite; }
        `}</style>
        <div 
          className={`relative w-full max-w-4xl aspect-[16/9] flex items-center justify-center scale-[0.95] sm:scale-110 select-none pointer-events-none md:max-h-[72vh] max-h-[62vh] transition-all duration-500 ${
            getMoodAnimationClass(effectiveMood)
          }`}
          style={{
            "--hologram-glow": colors.glow
          } as React.CSSProperties}
        >
          {/* Subtle Outer Ambient Shadow Cast */}
          <div className="absolute inset-0 rounded-[2.5rem] blur-[30px] opacity-20 bg-cyan-600/15 pointer-events-none mix-blend-screen" />

          {/* IDLE VIDEO */}
          <video
            ref={idleVideoRef}
            src="/assets/idle.mp4"
            loop
            muted
            playsInline
            autoPlay
            className={`absolute inset-0 w-full h-full object-cover rounded-[2.5rem] transition-opacity duration-700 ease-in-out ${
              characterState === "idle" ? "opacity-100 z-10 animate-fade-in" : "opacity-0 z-0"
            }`}
            style={{
              maskImage: "radial-gradient(circle, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 80%)",
              WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 80%)",
            }}
            onError={() => handleVideoError("idle")}
          />

          {/* THINKING VIDEO */}
          <video
            ref={thinkingVideoRef}
            src="/assets/thinking.mp4"
            loop
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover rounded-[2.5rem] transition-opacity duration-700 ease-in-out ${
              characterState === "thinking" ? "opacity-100 z-10 animate-fade-in" : "opacity-0 z-0"
            }`}
            style={{
              maskImage: "radial-gradient(circle, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 80%)",
              WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 80%)",
            }}
            onError={() => handleVideoError("thinking")}
          />

          {/* TALKING VIDEO */}
          <video
            ref={talkingVideoRef}
            src="/assets/talking.mp4"
            loop
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover rounded-[2.5rem] transition-opacity duration-700 ease-in-out ${
              characterState === "talking" ? "opacity-100 z-10 animate-fade-in" : "opacity-0 z-0"
            }`}
            style={{
              maskImage: "radial-gradient(circle, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 80%)",
              WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 80%)",
            }}
            onError={() => handleVideoError("talking")}
          />

          {/* Faint cybernetic visual edge grid guard */}
          <div className="absolute inset-0 rounded-[2.5rem] border border-white/5 pointer-events-none bg-radial-gradient from-transparent to-black/35" />

          {/* Video Placeholder/Fallback Tutorial Overlay if asset files are absent */}
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#05060f]/90 backdrop-blur-md rounded-3xl p-6 text-center z-50 pointer-events-auto border border-white/5 shadow-2xl animate-fade-in">
              <Sparkles className="text-cyan-400 mb-2 animate-pulse" size={32} />
              <h3 className="text-sm font-bold tracking-widest font-mono text-white select-none">AWAITING VIDEOS CORES</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed font-sans">
                Please place your character video assets inside the <code className="text-cyan-300 font-mono">/assets</code> directory of your workspace named exactly:
              </p>
              <div className="mt-3 space-y-1.5 text-left font-mono text-[10px] text-cyan-200 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
                <div>• idle.mp4 (State: Idle)</div>
                <div>• thinking.mp4 (State: Thinking)</div>
                <div>• talking.mp4 (State: Talking)</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Foreground Hover-Responsive Canvas for glowing particles (Holographic Overlay Z-index 20) */}
      <canvas
        id="sitara-hologram-living-canvas"
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
      />
    </div>
  );
};
