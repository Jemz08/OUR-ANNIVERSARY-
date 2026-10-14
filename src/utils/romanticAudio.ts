/**
 * Romantic Music Box & Chime Synthesizer using Web Audio API
 * Plays gentle music box / harp tones for the lantern ascension.
 */

class RomanticAudioController {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private timerId: any = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Plays a single gentle music-box chime note
   */
  public playChime(freq: number, duration: number = 1.6, gainLevel: number = 0.12) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Sine wave with subtle harmonics for a crystalline music-box bell effect
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Attack and exponential decay
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(gainLevel, this.ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio context may be restricted before user gesture
    }
  }

  /**
   * Plays a magical sparkle chime arpeggio when ribbon unties
   */
  public playRibbonUntieSparkle() {
    if (this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playChime(freq, 1.2, 0.09);
      }, idx * 110);
    });
  }

  /**
   * Plays a warm celebration toast clink sound
   */
  public playToastChime() {
    if (this.isMuted) return;
    this.playChime(1567.98, 1.8, 0.14); // G6 crystal clink
    setTimeout(() => {
      this.playChime(1760.0, 1.5, 0.08); // A6 overtone
    }, 45);
  }

  /**
   * Starts a gentle, romantic music-box melody (Tangled / Canon in D inspired arpeggios)
   */
  public startMelody() {
    if (this.isPlaying) return;
    this.initContext();
    this.isPlaying = true;

    // Romantic music-box sequence (Frequencies in Hz)
    const melody: { freq: number; dur: number }[] = [
      { freq: 523.25, dur: 1.2 }, // C5
      { freq: 659.25, dur: 1.2 }, // E5
      { freq: 783.99, dur: 1.4 }, // G5
      { freq: 1046.5, dur: 1.8 }, // C6
      { freq: 880.0, dur: 1.4 },  // A5
      { freq: 783.99, dur: 1.2 }, // G5
      { freq: 659.25, dur: 1.2 }, // E5
      { freq: 587.33, dur: 1.6 }, // D5
      { freq: 523.25, dur: 1.2 }, // C5
      { freq: 659.25, dur: 1.2 }, // E5
      { freq: 880.0, dur: 1.4 },  // A5
      { freq: 1046.5, dur: 2.0 }, // C6
    ];

    let noteIndex = 0;
    const playNext = () => {
      if (!this.isPlaying) return;
      const current = melody[noteIndex % melody.length];
      this.playChime(current.freq, current.dur, 0.07);
      noteIndex++;
      this.timerId = setTimeout(playNext, 650);
    };

    playNext();
  }

  /**
   * Stops the melody
   */
  public stopMelody() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMelody();
    } else {
      this.startMelody();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

export const romanticAudio = new RomanticAudioController();
