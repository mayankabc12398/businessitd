// Seeded RNG so all generated dummy data is identical on every load.
export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const makeRand = (seed) => {
  const r = mulberry32(seed);
  return {
    next: r,
    pick: (arr) => arr[Math.floor(r() * arr.length)],
    int: (min, max) => Math.floor(r() * (max - min + 1)) + min,
    chance: (p) => r() < p,
  };
};
export const pad = (n, w = 3) => String(n).padStart(w, '0');
export const isoDate = (y, m, d) => `${y}-${pad(m, 2)}-${pad(d, 2)}`;
