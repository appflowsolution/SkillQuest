// Motor de Audio Clínico Sintetizado con Web Audio API
// Compatible 100% con iOS Safari sin dependencias externas ni problemas de CORS

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentAacAudio: HTMLAudioElement | null = null;
  private audioBufferCache: Map<string, AudioBuffer> = new Map();
  private activeBufferSource: AudioBufferSourceNode | null = null;
  private idleOsc1: OscillatorNode | null = null;
  private idleOsc2: OscillatorNode | null = null;
  private idleGain: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.initContext();
        if (this.ctx && this.ctx.state === 'running') {
          window.removeEventListener('pointerdown', unlock);
          window.removeEventListener('touchstart', unlock);
          window.removeEventListener('click', unlock);
          window.removeEventListener('keydown', unlock);
        }
      };
      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
      window.addEventListener('click', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
    }
  }

  public initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public isSuspended(): boolean {
    return !this.ctx || this.ctx.state === 'suspended';
  }

  public async preloadAudioBuffer(url: string): Promise<AudioBuffer | null> {
    if (this.audioBufferCache.has(url)) {
      return this.audioBufferCache.get(url)!;
    }
    try {
      this.initContext();
      if (!this.ctx) return null;
      const res = await fetch(url);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
        this.ctx!.decodeAudioData(arrayBuffer, resolve, reject);
      });
      this.audioBufferCache.set(url, audioBuffer);
      return audioBuffer;
    } catch {
      return null;
    }
  }

  public async playWebAudioClip(url: string, volume = 0.95): Promise<boolean> {
    if (this.isMuted) return false;
    this.stopAac();

    try {
      this.initContext();
      if (!this.ctx) return false;

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume().catch(() => {});
      }

      let buffer: AudioBuffer | null | undefined = this.audioBufferCache.get(url);
      if (!buffer) {
        buffer = await this.preloadAudioBuffer(url);
      }

      if (!buffer || !this.ctx) {
        // Fallback to HTMLAudioElement if Web Audio decoding fails
        const fallbackAudio = new Audio(url);
        fallbackAudio.volume = volume;
        this.currentAacAudio = fallbackAudio;
        await fallbackAudio.play().catch(() => {});
        return true;
      }

      // Stop previous buffer source if playing
      if (this.activeBufferSource) {
        try {
          this.activeBufferSource.stop();
          this.activeBufferSource.disconnect();
        } catch { /* ignore */ }
        this.activeBufferSource = null;
      }

      const source = this.ctx.createBufferSource();
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);

      source.buffer = buffer;
      source.connect(gain);
      gain.connect(this.ctx.destination);

      source.onended = () => {
        if (this.activeBufferSource === source) {
          this.activeBufferSource = null;
        }
      };

      this.activeBufferSource = source;
      source.start(0);
      return true;
    } catch {
      try {
        const fallback = new Audio(url);
        fallback.volume = volume;
        this.currentAacAudio = fallback;
        fallback.play().catch(() => {});
      } catch { /* ignore */ }
      return false;
    }
  }

  public stopAac() {
    if (this.activeBufferSource) {
      try {
        this.activeBufferSource.stop();
        this.activeBufferSource.disconnect();
      } catch {
        // Silent
      }
      this.activeBufferSource = null;
    }
    if (this.currentAacAudio) {
      try {
        this.currentAacAudio.pause();
        this.currentAacAudio.currentTime = 0;
      } catch {
        // Silent
      }
      this.currentAacAudio = null;
    }
    // Cancel any browser speech synthesis to prevent phantom male system voice
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Silent
      }
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAac();
      this.stopRocketIdle();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Toque suave para botones generales
  public playTap() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Audio fallback silencioso si el navegador restringe
    }
  }

  // Sonido de gema / toque acertado en juego
  public playGemPop(pitchMultiplier = 1) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = 440 * pitchMultiplier;
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // Silencioso
    }
  }

  // Reforzador de éxito (Acorde mayor brillante / C5-E5-G5-C6)
  public playSuccess() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + index * 0.08);

        const startTime = this.ctx!.currentTime + index * 0.08;
        const duration = 0.25;

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // Silencioso
    }
  }

  // Sonido de activación de descanso (Campana de paz cálida)
  public playBreakBell() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      // Acorde armónico relajante (F4 y C5)
      osc1.frequency.setValueAtTime(349.23, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(523.25, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 1.2);
      osc2.stop(this.ctx.currentTime + 1.2);
    } catch {
      // Silencioso
    }
  }

  // Sonido de alerta/prompt sutil para la RBT
  public playPromptChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {
      // Silencioso
    }
  }

  // Tic-tac rítmico para cuenta regresiva crítica de tiempo
  public playClockTick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(820, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Silencioso
    }
  }

  // Sonido de extensión de tiempo (+1 MORE MINUTE) - Arpegio triunfante ascendente
  public playTimeExtension() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const notes = [440, 554.37, 659.25, 880, 1108.73]; // A4, C#5, E5, A5, C#6
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        const startTime = this.ctx!.currentTime + index * 0.07;
        const duration = 0.35;

        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, startTime + duration);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.22, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // Silencioso
    }
  }

  // Sonido de obstáculo / glitch temporal sutil
  public playGlitch() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {
      // Silencioso
    }
  }

  // Sonido de soltar bloque desde la grúa cósmica
  public playBlockDrop() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // Silencioso
    }
  }

  // Sonido de encaje sólido y satisfactorio de bloque en la torre
  public playBlockLand(pitchMultiplier = 1) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 260 * pitchMultiplier;
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(freq * 1.25, this.ctx.currentTime + 0.15);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, this.ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.18);
      osc2.stop(this.ctx.currentTime + 0.18);
    } catch {
      // Silencioso
    }
  }

  // Sonido de cambio de turno («¡Te toca a ti!» / «¡Tu turno!»)
  public playTurnChime(isPlayerTurn = true) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const notes = isPlayerTurn ? [587.33, 880] : [783.99, 523.25]; // D5->A5 o G5->C5
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        const start = this.ctx!.currentTime + idx * 0.1;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + 0.22);
      });
    } catch {
      // Silencioso
    }
  }

  // Sonido suave de fallo / fuera de objetivo («¡Casi!»)
  public playBlockMiss() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.32);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.32);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.32);
    } catch {
      // Silencioso
    }
  }

  // Sonido nítido táctil de comunicador AAC
  public playAacTap() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Silencioso
    }
  }

  // Sonido de la chispa guía (magical guide spark shimmer)
  public playGuideSpark() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const freqs = [659.25, 830.61, 987.77, 1318.51]; // E5 -> G#5 -> B5 -> E6
      freqs.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        const start = this.ctx!.currentTime + idx * 0.05;
        osc.frequency.setValueAtTime(f, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + 0.18);
      });
    } catch {
      // Silencioso
    }
  }

  // Éxito de frase AAC completada (triunfal)
  public playAacPhraseSuccess() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      chord.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        const start = this.ctx!.currentTime + idx * 0.07;
        osc.frequency.setValueAtTime(f, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {
      // Silencioso
    }
  }

  // Natural human speech audio playback for AAC words & sentences
  public speakAac(text: string) {
    if (this.isMuted) return;

    this.stopAac();

    const normalized = text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const audioPath = normalized.includes('_') 
      ? `/audio/aac/sentence_${normalized}.mp3` 
      : `/audio/aac/${normalized}.mp3`;

    try {
      const audio = new Audio(audioPath);
      audio.volume = 0.95;
      this.currentAacAudio = audio;
      audio.onended = () => {
        if (this.currentAacAudio === audio) {
          this.currentAacAudio = null;
        }
      };
      audio.play().catch(() => {
        const words = normalized.split('_').filter(Boolean);
        if (words.length > 1) {
          this.playWordSequence(words);
        } else {
          this.fallbackWebSpeech(text);
        }
      });
    } catch {
      this.fallbackWebSpeech(text);
    }
  }

  // Sequentially play neural MP3 files word-by-word with natural pacing
  public playWordSequence(words: string[], index = 0) {
    if (this.isMuted || index >= words.length) return;
    const word = words[index];
    try {
      const audio = new Audio(`/audio/aac/${word}.mp3`);
      audio.volume = 0.95;
      audio.onended = () => {
        setTimeout(() => {
          this.playWordSequence(words, index + 1);
        }, 70);
      };
      audio.play().catch(() => {
        this.playWordSequence(words, index + 1);
      });
    } catch {
      this.playWordSequence(words, index + 1);
    }
  }

  // Pristine AvaNeural speech playback for Echo Beats (A, E, O) via Web Audio API
  public playVowelSound(vowel: 'a' | 'e' | 'o') {
    if (this.isMuted) return;
    this.playWebAudioClip(`/audio/echo/vowel_${vowel}.mp3?v=20261010c`, 0.95);
  }

  // Model prompt with AvaNeural ("Make the sound: A!") via Web Audio API
  public playEchoModel(vowel: 'a' | 'e' | 'o') {
    if (this.isMuted) return;
    this.playWebAudioClip(`/audio/echo/model_${vowel}.mp3?v=20261010c`, 0.95);
  }

  // Celebratory speech praise with AvaNeural via Web Audio API
  public playEchoPraise(type: 'heard_you' | 'great_job' | 'good_try') {
    if (this.isMuted) return;
    this.playWebAudioClip(`/audio/echo/${type}.mp3?v=20261010c`, 0.95);
  }

  // Celebratory musical fanfare for echoic imitation
  public playCheer() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C-E-G-C-E fanfare

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch {
      // Silent
    }
  }

  // Cosmic Fuel: Inyección de combustible con tono armónico según valor
  public playFuelInject(value = 1) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const baseFreq = value >= 10 ? 660 : value >= 5 ? 520 : value >= 2 ? 440 : 360;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, this.ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.14);
    } catch {
      // Silent
    }
  }

  // Cosmic Fuel: Válvula de purga (descarga de presión para sustracción)
  public playPurgeVent() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch {
      // Silent
    }
  }

  // Cosmic Fuel: Rumor sordo y vibración de cohete en rampa listo para arrancar (idle rumble)
  public startRocketIdle() {
    if (this.isMuted) return;
    this.stopRocketIdle();
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      // Frecuencias graves combinadas (52 Hz y 74 Hz) simulando turbobombas criogénicas
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(52, this.ctx.currentTime);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(74, this.ctx.currentTime);

      // Filtro pasa-bajos que da la textura sorda y retumbante de motor
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);

      // Volumen ambiental suave y agradable
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.045, this.ctx.currentTime + 0.8);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();

      this.idleOsc1 = osc1;
      this.idleOsc2 = osc2;
      this.idleGain = gain;
    } catch {
      // Silent
    }
  }

  public stopRocketIdle() {
    try {
      if (this.idleGain && this.ctx) {
        this.idleGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.25);
      }
      setTimeout(() => {
        try {
          if (this.idleOsc1) {
            this.idleOsc1.stop();
            this.idleOsc1.disconnect();
            this.idleOsc1 = null;
          }
          if (this.idleOsc2) {
            this.idleOsc2.stop();
            this.idleOsc2.disconnect();
            this.idleOsc2 = null;
          }
          if (this.idleGain) {
            this.idleGain.disconnect();
            this.idleGain = null;
          }
        } catch { /* ignore */ }
      }, 300);
    } catch {
      // Silent
    }
  }

  // Cosmic Fuel: Ignición y despegue atronador del cohete con estruendo expansivo
  public playRocketLaunch() {
    this.stopRocketIdle();
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Capa 1: Retumbo y vibración profunda (rumble)
      const oscLow = this.ctx.createOscillator();
      const gainLow = this.ctx.createGain();
      oscLow.type = 'sawtooth';
      oscLow.frequency.setValueAtTime(65, now);
      oscLow.frequency.linearRampToValueAtTime(260, now + 1.8);

      gainLow.gain.setValueAtTime(0.28, now);
      gainLow.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      oscLow.connect(gainLow);
      gainLow.connect(this.ctx.destination);
      oscLow.start(now);
      oscLow.stop(now + 2.0);

      // Capa 2: Rugido de plasma sónico ascendente (flame jet)
      const oscJet = this.ctx.createOscillator();
      const gainJet = this.ctx.createGain();
      oscJet.type = 'triangle';
      oscJet.frequency.setValueAtTime(140, now);
      oscJet.frequency.exponentialRampToValueAtTime(680, now + 1.6);

      gainJet.gain.setValueAtTime(0.22, now);
      gainJet.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      oscJet.connect(gainJet);
      gainJet.connect(this.ctx.destination);
      oscJet.start(now);
      oscJet.stop(now + 1.8);
    } catch {
      // Silent
    }
  }

  private fallbackWebSpeech(text: string) {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const naturalVoice = voices.find(v => 
          v.lang.startsWith('en') && 
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Ava') || v.name.includes('Ana'))
        );
        if (naturalVoice) utterance.voice = naturalVoice;
        utterance.rate = 0.92;
        utterance.pitch = 1.05;
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Silent
    }
  }
}

export const soundEngine = new SoundEngine();
