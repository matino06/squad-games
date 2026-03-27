/**
 * Better randomness utility for React Native / Hermes.
 *
 * Hermes' Math.random() can produce the same sequence on every cold start
 * because its PRNG seed is not properly varied between launches.
 * We use a Mulberry32 PRNG seeded with Date.now() XOR multiple Math.random()
 * calls so that even if Math.random() is weak, the time component ensures
 * different sequences across app sessions.
 */

// Mulberry32 — fast, high-quality 32-bit PRNG
function mulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Seed: mix current time with several Math.random() calls for maximum entropy
const _seed =
  (Date.now() & 0xffffffff) ^
  Math.floor(Math.random() * 0xffffffff) ^
  Math.floor(Math.random() * 0xffffffff) ^
  Math.floor(Math.random() * 0xffffffff);

const _rng = mulberry32(_seed);

// Warm up — discard first few outputs to mix internal state
for (let i = 0; i < 16; i++) _rng();

/** Returns a float in [0, 1) */
export function random() {
  return _rng();
}

/** Returns a random integer in [0, max) */
export function randomInt(max) {
  return Math.floor(_rng() * max);
}

/** Fisher-Yates shuffle using the seeded PRNG */
export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(_rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
