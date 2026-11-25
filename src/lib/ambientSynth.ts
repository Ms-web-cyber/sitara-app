/**
 * Procedural Audio Synthesizer Engine for Sitara's Background Atmospheres.
 * Built 100% serverless and offline-friendly using Web Audio API.
 */

class AmbientSynthEngine {
  private ctx: AudioContext | null = null;
  private mainGain: GainNode | null = null;
  private currentTrack: "lofi" | "jazz" | "ambient" | "synthwave" | "stop" = "stop";
  private activeNodes: { stop: () => void }[] = [];
  private intervalId: any = null;

  constructor() {
    // Lazy loaded context to satisfy browser click gesture policies
  }

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    this.ctx = new AudioContextClass();
    this.mainGain = this.ctx.createGain();
    this.mainGain.gain.setValueAtTime(0.12, this.ctx.currentTime); // Subtle background level
    this.mainGain.connect(this.ctx.destination);
  }

  public play(track: "lofi" | "jazz" | "ambient" | "synthwave" | "stop") {
    try {
      this.init();
      if (!this.ctx || !this.mainGain) return "Browser Web Audio API not supported.";

      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }

      // Clean up previous loops & oscillators
      this.stopAll();
      this.currentTrack = track;

      if (track === "stop") {
        return "Background tracks paused successfully.";
      }

      // Initialize requested procedurally synthesized loop
      if (track === "ambient") {
        this.startAmbient();
      } else if (track === "lofi") {
        this.startLofi();
      } else if (track === "synthwave") {
        this.startSynthwave();
      } else if (track === "jazz") {
        this.startJazz();
      }

      return `Successfully playing procedural ${track} ambience loop in background.`;
    } catch (err: any) {
      console.error("AmbientSynthEngine playback failed:", err);
      return `Failed to initialize background track: ${err.message || err}`;
    }
  }

  public getCurrentTrack() {
    return this.currentTrack;
  }

  private stopAll() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.activeNodes.forEach(node => {
      try {
        node.stop();
      } catch (e) {}
    });
    this.activeNodes = [];
  }

  // --- PROCEDURAL ENGINE IMPLEMENTATIONS ---

  // 1. Warm spacey drone pad
  private startAmbient() {
    if (!this.ctx || !this.mainGain) return;
    const ctx = this.ctx;
    const frequencies = [130.81, 164.81, 196.00, 246.94, 293.66]; // Cmaj9 chord notes
    
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc.type = idx % 2 === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 1.5, ctx.currentTime);

      // Low speed LFO to sweep volume ambient pads
      lfo.frequency.setValueAtTime(0.06 + idx * 0.015, ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.03, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      
      osc.connect(gain);
      gain.connect(this.mainGain!);

      osc.start();
      lfo.start();

      this.activeNodes.push({
        stop: () => {
          try {
            osc.stop();
            lfo.stop();
            osc.disconnect();
            lfo.disconnect();
            gain.disconnect();
            lfoGain.disconnect();
          } catch (e) {}
        }
      });
    });
  }

  // 2. Dusty Lofi Progression with crackle & organic heartbeats
  private startLofi() {
    if (!this.ctx || !this.mainGain) return;
    const ctx = this.ctx;

    // Dust/Vinyl crackle generator
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.005;
    }
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 1100;
    
    noiseNode.connect(noiseFilter);
    noiseFilter.connect(this.mainGain);
    noiseNode.start();
    
    this.activeNodes.push({
      stop: () => {
        try {
          noiseNode.stop();
          noiseNode.disconnect();
          noiseFilter.disconnect();
        } catch (e) {}
      }
    });

    const chords = [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
      [146.83, 174.61, 220.00, 261.63], // Dm7
      [164.81, 196.00, 246.94, 293.66], // Em7
      [130.81, 174.61, 220.00, 261.63], // Fmaj7
    ];
    let chordIdx = 0;

    const playLofiChord = () => {
      const now = ctx.currentTime;
      const currentCh = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      currentCh.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(350, now);
        filter.frequency.exponentialRampToValueAtTime(120, now + 3.2);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.mainGain!);

        osc.start(now);
        osc.stop(now + 4.0);
      });

      // Soft lofi heart kick beat
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.frequency.setValueAtTime(75, now);
      kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
      kickGain.gain.setValueAtTime(0.12, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      kickOsc.connect(kickGain);
      kickGain.connect(this.mainGain!);
      
      kickOsc.start(now);
      kickOsc.stop(now + 0.2);
    };

    playLofiChord();
    this.intervalId = setInterval(playLofiChord, 4000);
  }

  // 3. Retro 80s Synthwave arpeggiator loop
  private startSynthwave() {
    if (!this.ctx || !this.mainGain) return;
    const ctx = this.ctx;
    
    const chords = [
      [110.00, 130.81, 164.81], // Am
      [130.81, 164.81, 196.00], // C
      [146.83, 174.61, 220.00], // Dm
      [146.83, 174.61, 220.00], // Dm
    ];
    let chordIdx = 0;
    let arpStep = 0;

    const tickArp = () => {
      const now = ctx.currentTime;
      const notes = chords[chordIdx];
      const baseNote = notes[arpStep % notes.length];
      
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(baseNote * 2, now); // play higher octave

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(350, now + 0.2);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.mainGain!);

      osc.start(now);
      osc.stop(now + 0.25);

      arpStep++;
      if (arpStep % 8 === 0) {
        chordIdx = (chordIdx + 1) % chords.length;
      }
    };

    tickArp();
    this.intervalId = setInterval(tickArp, 180);
  }

  // 4. Smooth Jazz EP Chords with brush cymbal swing
  private startJazz() {
    if (!this.ctx || !this.mainGain) return;
    const ctx = this.ctx;

    const progression = [
      [146.83, 174.61, 220.00, 261.63, 293.66], // Dm9
      [196.00, 246.94, 293.66, 329.63, 392.00], // G13
      [130.81, 164.81, 196.00, 246.94, 293.66], // Cmaj9
      [220.00, 277.18, 329.63, 392.00, 440.00], // A7alt
    ];
    let chordIdx = 0;

    const playJazzChord = () => {
      const now = ctx.currentTime;
      const notes = progression[chordIdx];
      chordIdx = (chordIdx + 1) % progression.length;

      // EP Rhodes emulation
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const vibrato = ctx.createOscillator();
        const vibratoGain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        vibrato.frequency.value = 4.2;
        vibratoGain.gain.value = 1.2;
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.045, now + 0.1 + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);

        osc.connect(gain);
        gain.connect(this.mainGain!);

        vibrato.start(now);
        osc.start(now);
        osc.stop(now + 5.0);
        vibrato.stop(now + 5.0);
      });

      // Swinging Ride Cymbal Click
      const playRideCymbal = (timeOffset: number) => {
        const rideOsc = ctx.createOscillator();
        const rideGain = ctx.createGain();
        const rideFilter = ctx.createBiquadFilter();

        rideOsc.type = "square";
        rideOsc.frequency.value = 9500;

        rideFilter.type = "highpass";
        rideFilter.frequency.value = 6500;

        rideGain.gain.setValueAtTime(0.01, now + timeOffset);
        rideGain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.12);

        rideOsc.connect(rideFilter);
        rideFilter.connect(rideGain);
        rideGain.connect(this.mainGain!);

        rideOsc.start(now + timeOffset);
        rideOsc.stop(now + timeOffset + 0.15);
      };

      playRideCymbal(0);
      playRideCymbal(0.4);
      playRideCymbal(0.6);
      playRideCymbal(1.0);
      playRideCymbal(1.4);
      playRideCymbal(1.6);
      playRideCymbal(2.0);
      playRideCymbal(2.4);
      playRideCymbal(2.6);
      playRideCymbal(3.0);
      playRideCymbal(3.4);
      playRideCymbal(3.6);
    };

    playJazzChord();
    this.intervalId = setInterval(playJazzChord, 4000);
  }
}

export const ambientSynth = new AmbientSynthEngine();
