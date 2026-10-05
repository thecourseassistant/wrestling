class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private isBgmPlaying: boolean = false;

  private audioCache: Record<string, HTMLAudioElement> = {};
  private audioFailed: Record<string, boolean> = {};

  // Dynamic Crowd Audio
  private customCrowdAudio: HTMLAudioElement | null = null;
  private customCrowdFailed: boolean = false;
  private crowdOscs: OscillatorNode[] = [];
  private crowdGain: GainNode | null = null;
  private isCrowdActive: boolean = false;

  constructor() {
    this.preloadCustomAudio();
    this.attachUserGestureUnlock();
  }

  private attachUserGestureUnlock() {
    const unlock = () => {
      this.initCtx();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', unlock);
      window.addEventListener('keydown', unlock);
      window.addEventListener('touchstart', unlock);
      window.addEventListener('click', unlock);
    }
  }

  private preloadCustomAudio() {
    try {
      // Use relative path globbing so Vite resolves assets properly in dev AND build (GitHub Pages / subfolders)
      const audioModules = import.meta.glob('../assets/audio/*.{mp3,wav,ogg}', { eager: true, import: 'default' });

      Object.entries(audioModules).forEach(([path, url]) => {
        const fileName = path.split('/').pop()?.split('.')[0]?.toLowerCase();
        if (!fileName || !url) return;

        const srcUrl = url as string;
        const audio = new Audio(srcUrl);
        audio.preload = 'auto';

        audio.onerror = () => {
          this.audioFailed[fileName] = true;
          if (fileName === 'crowd') {
            this.customCrowdFailed = true;
          }
        };

        audio.onloadedmetadata = () => {
          if (isNaN(audio.duration) || audio.duration === 0) {
            this.audioFailed[fileName] = true;
            if (fileName === 'crowd') {
              this.customCrowdFailed = true;
            }
          }
        };

        if (fileName === 'crowd') {
          audio.loop = true;
          this.customCrowdAudio = audio;
        } else {
          this.audioCache[fileName] = audio;
        }
      });
    } catch {
      // Fallback
    }
  }

  private playCustomOrFallback(fileKeys: string[], fallbackFn: () => void) {
    if (this.isMuted) return;

    this.initCtx();

    for (const key of fileKeys) {
      const customAudio = this.audioCache[key];
      const isFailed = this.audioFailed[key];

      if (customAudio && !isFailed && customAudio.duration > 0) {
        try {
          const clone = customAudio.cloneNode() as HTMLAudioElement;
          clone.volume = 0.85;
          const playPromise = clone.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              // Successfully playing custom file!
            }).catch(() => {
              this.audioFailed[key] = true;
              fallbackFn();
            });
            return;
          }
        } catch {
          this.audioFailed[key] = true;
        }
      }
    }

    fallbackFn();
  }

  public initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      if (this.isBgmPlaying) this.stopBGM();
      this.stopCrowdRoar();
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  // 🔊 DYNAMIC CROWD ROAR
  public updateCrowdRoar(comboStreak: number) {
    if (this.isMuted) return;

    this.initCtx();

    if (
      this.customCrowdAudio &&
      !this.customCrowdFailed &&
      this.customCrowdAudio.duration > 0
    ) {
      if (this.customCrowdAudio.paused) {
        this.customCrowdAudio.play().catch(() => {
          this.customCrowdFailed = true;
          this.fallbackCrowdHarmonics(comboStreak);
        });
      }

      const targetVol = Math.min(0.70, 0.05 + comboStreak * 0.12);
      this.customCrowdAudio.volume = targetVol;
      return;
    }

    this.fallbackCrowdHarmonics(comboStreak);
  }

  private fallbackCrowdHarmonics(comboStreak: number) {
    this.initCtx();
    if (!this.ctx) return;

    if (!this.isCrowdActive) {
      this.startCrowdHarmonics();
    }

    if (this.crowdGain) {
      const targetGain = Math.min(0.28, 0.01 + comboStreak * 0.05);
      this.crowdGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.2);
    }
  }

  private startCrowdHarmonics() {
    if (!this.ctx || this.isCrowdActive) return;

    const freqs = [220, 277.18, 329.63, 440];
    this.crowdGain = this.ctx.createGain();
    this.crowdGain.gain.value = 0.01;

    this.crowdOscs = freqs.map((f) => {
      if (!this.ctx) return null as any;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 4 + Math.random() * 2;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 8;
      lfo.connect(osc.frequency);
      lfo.start();

      osc.connect(this.crowdGain!);
      osc.start();
      return osc;
    }).filter(Boolean);

    this.crowdGain.connect(this.ctx.destination);
    this.isCrowdActive = true;
  }

  public stopCrowdRoar() {
    if (this.customCrowdAudio) {
      this.customCrowdAudio.pause();
    }

    this.crowdOscs.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // Fallback
      }
    });
    this.crowdOscs = [];
    this.isCrowdActive = false;
  }

  public playPunchSound() {
    this.playCustomOrFallback(['punch', 'attack', 'hit'], () => {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(120, now);
      subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.15);

      subGain.gain.setValueAtTime(0.8, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      subOsc.start(now);
      subOsc.stop(now + 0.15);
    });
  }

  public playParrySound() {
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.1);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playMatThudSound() {
    this.playCustomOrFallback(['thud', 'slam'], () => {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();

      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(110, now);
      subOsc.frequency.exponentialRampToValueAtTime(20, now + 0.3);

      subGain.gain.setValueAtTime(0.85, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      subOsc.start(now);
      subOsc.stop(now + 0.3);
    });
  }

  public playRopeBounceSound() {
    this.playCustomOrFallback(['slide', 'dodge', 'rope'], () => {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(300, now + 0.08);
      osc.frequency.linearRampToValueAtTime(90, now + 0.18);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    });
  }

  public playRingBellSound() {
    this.playCustomOrFallback(['bell'], () => {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [0, 0.12, 0.25].forEach((offset) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(920, now + offset);
        osc.frequency.exponentialRampToValueAtTime(840, now + offset + 0.45);

        gain.gain.setValueAtTime(0.45, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.45);
      });
    });
  }

  public playYouLoseSound() {
    this.playCustomOrFallback(['you_lose', 'defeat', 'lose'], () => {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [392.00, 349.23, 311.13, 261.63];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.18);

        gain.gain.setValueAtTime(0.4, now + idx * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 0.4);
      });
    });
  }

  public playSuperGaugeFullSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.35, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  }

  public playCorrectAnswerSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.4, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.35);
    });
  }

  public playIncorrectAnswerSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.setValueAtTime(100, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playRefTapSound() {
    this.playPunchSound();
  }

  public playCrowdCheerSound() {
    this.updateCrowdRoar(4);
  }

  public toggleBGM(): boolean {
    if (this.isBgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }

  public startBGM() {
    if (this.isMuted || this.isBgmPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isBgmPlaying = true;
    let step = 0;
    const bassline = [110, 110, 130.81, 110, 146.83, 130.81, 110, 98];

    this.bgmInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const freq = bassline[step % bassline.length];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);

      step++;
    }, 200);
  }

  public stopBGM() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.isBgmPlaying = false;
  }
}

export const sound = new SoundEngine();
