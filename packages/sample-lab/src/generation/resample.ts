import { RUNTIME_SAMPLE_RATE_HZ } from "./constants.js";

const KAISER_BETA = 10;
const ZERO_CROSSINGS = 64;

/** Output sample count after a rate conversion. Uses round(), never truncates. */
export function resampledSampleCount(
  inputSamples: number,
  fromRate: number,
  toRate: number,
): number {
  if (fromRate === toRate) return inputSamples;
  return Math.round((inputSamples * toRate) / fromRate);
}

function besselI0(x: number): number {
  const ax = Math.abs(x);
  if (ax < 3.75) {
    const y = (x / 3.75) ** 2;
    return (
      1.0 +
      y *
        (3.5156229 +
          y *
            (3.0899424 +
              y * (1.2067492 + y * (0.2659732 + y * (0.0360768 + y * 0.0045813)))))
    );
  }
  const y = 3.75 / ax;
  return (
    (Math.exp(ax) / Math.sqrt(ax)) *
    (0.39894228 +
      y *
        (0.01328592 +
          y *
            (0.00225319 +
              y *
                (-0.00157565 +
                  y *
                    (0.00916281 +
                      y *
                        (-0.02057706 +
                          y * (0.02635537 + y * (-0.01647633 + y * 0.00392377))))))))
  );
}

function kaiserWindow(n: number, length: number, beta: number): number {
  if (length <= 1) return 1;
  const t = (2 * n) / (length - 1) - 1;
  const arg = Math.max(0, 1 - t * t);
  return besselI0(beta * Math.sqrt(arg)) / besselI0(beta);
}

function sinc(x: number): number {
  if (x === 0) return 1;
  const pix = Math.PI * x;
  return Math.sin(pix) / pix;
}

/**
 * Kaiser-windowed sinc resampler.
 * Quality note: β=10 / 64 zero-crossings is in the libsamplerate "sinc medium–best"
 * band. Stems get layered and looped, so we do not use linear interpolation.
 */
export function resampleChannel(
  input: Float32Array,
  fromRate: number,
  toRate: number,
): Float32Array {
  if (fromRate === toRate) return new Float32Array(input);
  const outLen = resampledSampleCount(input.length, fromRate, toRate);
  const output = new Float32Array(outLen);
  const ratio = fromRate / toRate;
  const taps = ZERO_CROSSINGS * 2;
  const kaiserLut = new Float64Array(taps);
  for (let n = 0; n < taps; n++) {
    kaiserLut[n] = kaiserWindow(n, taps, KAISER_BETA);
  }

  for (let i = 0; i < outLen; i++) {
    const center = i * ratio;
    const left = Math.floor(center) - ZERO_CROSSINGS + 1;
    const right = left + taps;
    let sum = 0;
    let wsum = 0;
    for (let s = left; s < right; s++) {
      const t = center - s;
      if (Math.abs(t) >= ZERO_CROSSINGS) continue;
      const n = s - left;
      const w = sinc(t) * kaiserLut[n]!;
      sum += sampleAt(input, s) * w;
      wsum += w;
    }
    output[i] = wsum === 0 ? 0 : sum / wsum;
  }
  return output;
}

function sampleAt(input: Float32Array, index: number): number {
  if (index < 0 || index >= input.length) return 0;
  return input[index]!;
}

export function resamplePlanar(
  channels: Float32Array[],
  fromRate: number,
  toRate: number = RUNTIME_SAMPLE_RATE_HZ,
): Float32Array[] {
  return channels.map((ch) => resampleChannel(ch, fromRate, toRate));
}

/** Kept for the window helper so the Kaiser formula stays testable. */
export function kaiserAt(n: number, length: number): number {
  return kaiserWindow(n, length, KAISER_BETA);
}
