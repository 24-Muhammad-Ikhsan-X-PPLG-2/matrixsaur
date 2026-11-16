import { useCallback } from "react";

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  audioCtx = audioCtx ?? new Ctor();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

/** Raungan Trixsaurus yang disintesis dengan Web Audio — tanpa file audio, mudah diganti aset final. */
function synthRoar() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const dur = 0.95;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.42, now + 0.09);
  master.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  master.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(950, now);
  filter.frequency.exponentialRampToValueAtTime(240, now + dur);
  filter.connect(master);

  // Getaran kasar (tremolo) supaya terdengar seperti geraman.
  const tremolo = ctx.createGain();
  tremolo.gain.value = 0.6;
  tremolo.connect(filter);
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 27;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 0.4;
  lfo.connect(lfoDepth).connect(tremolo.gain);
  lfo.start(now);
  lfo.stop(now + dur);

  for (const mult of [1, 1.5]) {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150 * mult, now);
    osc.frequency.exponentialRampToValueAtTime(60 * mult, now + dur);
    osc.connect(tremolo);
    osc.start(now);
    osc.stop(now + dur);
  }

  // Desis napas.
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.22;
  noise.connect(noiseGain).connect(tremolo);
  noise.start(now);
  noise.stop(now + dur);
}

/** Mengembalikan fungsi raungan yang menghormati pengaturan suara pengguna. */
export function useRoar(enabled: boolean) {
  return useCallback(() => {
    if (!enabled) return;
    try {
      synthRoar();
    } catch {
      // Audio tidak tersedia di perangkat ini — abaikan, animasi tetap berjalan.
    }
  }, [enabled]);
}
