import { beforeAll, describe, expect, it } from "vitest";
import type { KPuzzle } from "cubing/kpuzzle";
import { analyzePattern, loadKPuzzle } from "../src/core/analysis";
import { randomScramble } from "../src/core/scramble";

let kpuzzle: KPuzzle;

beforeAll(async () => {
  kpuzzle = await loadKPuzzle();
});

/** Tiny deterministic RNG (mulberry32) for seeded tests. */
function seededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MOVE_PATTERN = /^[UDLRFB](['2])?$/;

describe("randomScramble", () => {
  it("S1: produces 25 moves by default", () => {
    expect(randomScramble(seededRng(1))).toHaveLength(25);
  });

  it("S2: only uses outer face turns with ' and 2 modifiers", () => {
    for (const move of randomScramble(seededRng(2), 200)) {
      expect(move).toMatch(MOVE_PATTERN);
    }
  });

  it("S3: never turns the same face twice in a row", () => {
    const faces = randomScramble(seededRng(3), 200).map((m) => m[0]);
    for (let i = 1; i < faces.length; i++) {
      expect(faces[i], `index ${i}`).not.toBe(faces[i - 1]);
    }
  });

  it("S4: is deterministic for a seed and varies across seeds", () => {
    expect(randomScramble(seededRng(42))).toEqual(randomScramble(seededRng(42)));
    expect(randomScramble(seededRng(42))).not.toEqual(randomScramble(seededRng(43)));
  });

  it("S5: scrambles produce a non-trivial cube state", () => {
    const alg = randomScramble(seededRng(5)).join(" ");
    const analysis = analyzePattern(kpuzzle.defaultPattern().applyAlg(alg));
    expect(analysis.total).toBeGreaterThan(0);
  });
});
