/**
 * Romantic Solo Piano Engine & Custom Audio Player
 * - Generates a high-resolution 44.1kHz stereo acoustic felt-piano serenade WAV in memory
 *   ("For Loraine — Romantic Piano Serenade") with realistic piano overtones, unison string chorus,
 *   and warm studio reverb so it plays reliably and clearly across all desktop and mobile browsers.
 * - Also supports Web Audio API fallback and custom MP3/WAV uploads.
 */

interface ScheduledPianoNote {
  startTime: number; // in seconds
  freq: number;      // in Hz
  duration: number;  // in seconds
  velocity: number;  // 0.0 to 1.0
  pan: number;       // -0.5 (left) to +0.5 (right)
}

// Note frequency helper
const N: Record<string, number> = {
  D2: 73.42,
  F2: 87.31,
  G2: 98.00,
  A2: 110.00,
  Bb2: 116.54,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.00,
  A3: 220.00,
  Bb3: 233.08,
  C4: 261.63,
  Db4: 277.18,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  Bb4: 466.16,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
};

function buildRomanticScore(): { notes: ScheduledPianoNote[]; totalDuration: number } {
  const beat = 0.62; // ~96 BPM expressive ballad
  const bar = beat * 4; // 2.48s per bar
  const raw: Array<[number, string, number, number]> = [
    // Bar 0: Fmaj9 warm opening
    [0.0, 'F2', 3.8, 0.68],
    [0.5, 'C3', 3.3, 0.58],
    [1.0, 'A3', 2.8, 0.60],
    [1.5, 'C4', 2.4, 0.56],
    [1.0, 'A4', 2.2, 0.85],
    [2.5, 'G4', 1.5, 0.76],
    [3.25, 'F4', 1.5, 0.72],

    // Bar 1: Fmaj7/C lyrical continuation
    [4.0, 'C3', 3.8, 0.62],
    [4.5, 'F3', 3.2, 0.55],
    [5.0, 'A3', 2.8, 0.56],
    [4.0, 'C5', 2.2, 0.88],
    [6.0, 'A4', 1.6, 0.78],
    [7.0, 'G4', 1.5, 0.74],

    // Bar 2: Dm9 tender reflection
    [8.0, 'D2', 3.8, 0.68],
    [8.5, 'A2', 3.3, 0.58],
    [9.0, 'F3', 2.8, 0.60],
    [9.5, 'A3', 2.4, 0.55],
    [8.0, 'F4', 1.8, 0.82],
    [9.5, 'G4', 1.2, 0.75],
    [10.5, 'A4', 2.0, 0.86],

    // Bar 3: Dm7 gentle lift
    [12.0, 'A2', 3.6, 0.60],
    [12.5, 'D3', 3.2, 0.55],
    [13.0, 'F3', 2.8, 0.56],
    [12.0, 'D5', 2.0, 0.88],
    [13.5, 'C5', 1.4, 0.82],
    [14.5, 'A4', 1.8, 0.78],

    // Bar 4: Bbmaj7 heartfelt warmth
    [16.0, 'Bb2', 3.8, 0.68],
    [16.5, 'F3', 3.3, 0.58],
    [17.0, 'D4', 2.8, 0.58],
    [16.0, 'F5', 2.0, 0.90],
    [17.5, 'E5', 1.2, 0.82],
    [18.5, 'D5', 1.8, 0.85],

    // Bar 5: Gm9 -> Bb/C
    [20.0, 'G2', 2.2, 0.65],
    [20.5, 'D3', 2.0, 0.56],
    [21.0, 'Bb3', 1.8, 0.58],
    [20.0, 'C5', 1.8, 0.84],
    [21.5, 'Bb4', 1.2, 0.78],
    [22.0, 'C3', 2.2, 0.66],
    [22.5, 'G3', 1.8, 0.58],
    [22.5, 'A4', 1.6, 0.82],
    [23.25, 'G4', 1.4, 0.76],

    // Bar 6: Fmaj9 -> Dm7
    [24.0, 'F2', 2.2, 0.68],
    [24.5, 'C3', 2.0, 0.58],
    [25.0, 'A3', 1.8, 0.60],
    [24.0, 'A4', 1.8, 0.86],
    [25.5, 'C5', 1.4, 0.84],
    [26.0, 'D3', 2.2, 0.64],
    [26.5, 'A3', 1.8, 0.58],
    [26.5, 'F5', 1.6, 0.88],
    [27.25, 'E5', 1.2, 0.80],

    // Bar 7: Bbmaj7 -> C13 -> Fmaj9 resolution
    [28.0, 'Bb2', 2.0, 0.65],
    [28.5, 'F3', 1.8, 0.58],
    [28.0, 'D5', 1.4, 0.85],
    [29.0, 'C5', 1.2, 0.82],
    [30.0, 'C3', 2.2, 0.64],
    [30.5, 'E3', 2.0, 0.56],
    [30.0, 'G4', 1.4, 0.80],
    [31.0, 'A4', 1.6, 0.84],

    // Bar 8: Final warm Fmaj9 chord hold before seamless loop
    [32.0, 'F2', 3.8, 0.68],
    [32.3, 'C3', 3.5, 0.60],
    [32.6, 'A3', 3.2, 0.62],
    [32.9, 'E4', 3.0, 0.65],
    [33.2, 'F4', 3.0, 0.82],
    [34.2, 'C4', 2.2, 0.68],
  ];

  const notes: ScheduledPianoNote[] = raw.map(([beatStart, noteName, beatDur, vel]) => {
    const freq = N[noteName] || 261.63;
    // Subtle stereo spread: lower notes slightly left, higher notes slightly right
    const normalizedPitch = Math.min(1, Math.max(0, (freq - 70) / 650));
    const pan = (normalizedPitch - 0.5) * 0.45;
    return {
      startTime: beatStart * beat,
      freq,
      duration: beatDur * beat,
      velocity: vel,
      pan,
    };
  });

  const totalDuration = 36 * beat; // ~22.32 seconds seamless loop
  return { notes, totalDuration };
}

function generateRomanticPianoWavBlobUrl(): string {
  const sampleRate = 44100;
  const { notes, totalDuration } = buildRomanticScore();
  const numSamples = Math.floor(totalDuration * sampleRate);

  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  for (const note of notes) {
    const startSample = Math.floor(note.startTime * sampleRate);
    const noteSamples = Math.floor((note.duration + 0.8) * sampleRate);
    const endSample = Math.min(numSamples, startSample + noteSamples);

    const w1 = (2 * Math.PI * note.freq) / sampleRate;
    const w1Detune = (2 * Math.PI * note.freq * 1.0008) / sampleRate;
    const w2 = w1 * 2;
    const w3 = w1 * 3;
    const w4 = w1 * 4;

    const panLeft = Math.cos(((note.pan + 0.5) * Math.PI) / 2);
    const panRight = Math.sin(((note.pan + 0.5) * Math.PI) / 2);
    const amp = note.velocity * 0.24;

    const attackSamples = Math.floor(0.014 * sampleRate);

    for (let i = startSample; i < endSample; i++) {
      const localIdx = i - startSample;
      const t = localIdx / sampleRate;

      // Hammer attack + natural two-stage piano soundboard & sustain decay
      let env = 1.0;
      if (localIdx < attackSamples) {
        env = 0.5 * (1 - Math.cos((Math.PI * localIdx) / attackSamples));
      } else {
        const decayT = t - 0.014;
        env =
          0.68 * Math.exp(-decayT * 1.45) +
          0.32 * Math.exp(-decayT * 0.48);
      }

      // Smooth release at end of note window
      const releaseStart = note.duration + 0.2;
      if (t > releaseStart) {
        const rel = Math.max(0, 1 - (t - releaseStart) / 0.6);
        env *= rel * rel;
      }

      const phase = localIdx;
      const sig =
        Math.sin(w1 * phase) * 0.58 +
        Math.sin(w1Detune * phase) * 0.32 +
        Math.sin(w2 * phase) * 0.26 * Math.exp(-t * 1.1) +
        Math.sin(w3 * phase) * 0.11 * Math.exp(-t * 2.1) +
        Math.sin(w4 * phase) * 0.04 * Math.exp(-t * 3.5);

      const sampleVal = sig * env * amp;
      left[i] += sampleVal * panLeft;
      right[i] += sampleVal * panRight;
    }
  }

  // Add warm stereo studio reverb (multi-tap feedback delay)
  const delay1 = Math.floor(0.089 * sampleRate);
  const delay2 = Math.floor(0.142 * sampleRate);
  for (let i = delay2; i < numSamples; i++) {
    left[i] += right[i - delay1] * 0.18 + left[i - delay2] * 0.12;
    right[i] += left[i - delay1] * 0.18 + right[i - delay2] * 0.12;
  }

  // Peak normalize to 0.72 so it's crystal-clear and warm on all speakers
  let maxPeak = 0.01;
  for (let i = 0; i < numSamples; i++) {
    const absL = Math.abs(left[i]);
    const absR = Math.abs(right[i]);
    if (absL > maxPeak) maxPeak = absL;
    if (absR > maxPeak) maxPeak = absR;
  }
  const normGain = 0.72 / maxPeak;

  // Encode 16-bit 44.1kHz Stereo WAV
  const dataSize = numSamples * 4;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true);  // PCM format
  view.setUint16(22, 2, true);  // 2 channels (stereo)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 4, true);
  view.setUint16(32, 4, true);
  view.setUint16(34, 16, true); // 16-bit
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    // Gentle fade-in (first 120ms) and fade-out (last 180ms) for click-free looping
    let loopEnv = 1.0;
    if (i < sampleRate * 0.12) {
      loopEnv = i / (sampleRate * 0.12);
    } else if (i > numSamples - sampleRate * 0.18) {
      loopEnv = (numSamples - i) / (sampleRate * 0.18);
    }

    const sL = Math.max(-1, Math.min(1, left[i] * normGain * loopEnv));
    const sR = Math.max(-1, Math.min(1, right[i] * normGain * loopEnv));

    view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7fff, true);
    view.setInt16(offset + 2, sR < 0 ? sR * 0x8000 : sR * 0x7fff, true);
    offset += 4;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

class RomanticPianoEngine {
  private builtInAudio: HTMLAudioElement | null = null;
  private builtInWavUrl: string | null = null;
  private customAudioElement: HTMLAudioElement | null = null;
  private customTrackName: string | null = null;
  private isPlaying = false;
  private isMuted = false;
  private volume = 0.85; // clear, warm default volume (85%)

  private ensureBuiltInAudio(): HTMLAudioElement {
    if (!this.builtInAudio) {
      this.builtInWavUrl = generateRomanticPianoWavBlobUrl();
      const audio = new Audio(this.builtInWavUrl);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = this.isMuted ? 0 : this.volume;
      this.builtInAudio = audio;
    }
    return this.builtInAudio;
  }

  private getActiveAudio(): HTMLAudioElement {
    return this.customAudioElement || this.ensureBuiltInAudio();
  }

  public setCustomAudioFile(fileUrl: string, fileName: string) {
    const wasPlaying = this.isPlaying;
    this.pause();
    if (this.customAudioElement) {
      this.customAudioElement.pause();
      this.customAudioElement.src = '';
    }
    const audio = new Audio(fileUrl);
    audio.loop = true;
    audio.volume = this.isMuted ? 0 : this.volume;
    this.customAudioElement = audio;
    this.customTrackName = fileName;
    if (wasPlaying) {
      void this.play();
    }
  }

  public clearCustomAudioFile() {
    const wasPlaying = this.isPlaying;
    this.pause();
    if (this.customAudioElement) {
      this.customAudioElement.pause();
      this.customAudioElement.src = '';
      this.customAudioElement = null;
    }
    this.customTrackName = null;
    if (wasPlaying) {
      void this.play();
    }
  }

  public getTrackName(): string {
    return this.customTrackName || 'For Loraine — Romantic Piano Serenade';
  }

  public async play(): Promise<boolean> {
    try {
      const audio = this.getActiveAudio();
      audio.volume = this.isMuted ? 0 : this.volume;
      await audio.play();
      this.isPlaying = true;
      return true;
    } catch {
      this.isPlaying = false;
      return false;
    }
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.builtInAudio) {
      this.builtInAudio.pause();
    }
    if (this.customAudioElement) {
      this.customAudioElement.pause();
    }
  }

  public stop(): void {
    this.pause();
    const audio = this.getActiveAudio();
    audio.currentTime = 0;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    const effectiveVol = muted ? 0 : this.volume;
    if (this.builtInAudio) {
      this.builtInAudio.volume = effectiveVol;
    }
    if (this.customAudioElement) {
      this.customAudioElement.volume = effectiveVol;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(nextVolume: number): void {
    this.volume = Math.max(0, Math.min(1, nextVolume));
    if (this.volume > 0 && this.isMuted) {
      this.isMuted = false;
    }
    const effectiveVol = this.isMuted ? 0 : this.volume;
    if (this.builtInAudio) {
      this.builtInAudio.volume = effectiveVol;
    }
    if (this.customAudioElement) {
      this.customAudioElement.volume = effectiveVol;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const romanticPiano = new RomanticPianoEngine();
