import { beforeAll, describe, expect, it } from "vitest";
import { KPattern, type KPuzzle, type KPatternData } from "cubing/kpuzzle";
import { analyzePattern, loadKPuzzle } from "../src/core/analysis";

let kpuzzle: KPuzzle;

beforeAll(async () => {
  kpuzzle = await loadKPuzzle();
});

function analyzeAlg(alg: string) {
  const pattern =
    alg === ""
      ? kpuzzle.defaultPattern()
      : kpuzzle.defaultPattern().applyAlg(alg);
  return analyzePattern(pattern);
}

function solvedData(): KPatternData {
  return structuredClone(kpuzzle.defaultPattern().patternData);
}

function changedIndices(flags: readonly boolean[]): number[] {
  return flags.flatMap((changed, i) => (changed ? [i] : []));
}

// Slot indices affected by R, captured from the cubing.js 3x3 KPuzzle
// definition (orbit piece ordering is part of that definition).
const R_CORNER_SLOTS = [0, 1, 4, 7];
const R_EDGE_SLOTS = [1, 5, 8, 10];

describe("analyzePattern", () => {
  it("A1: solved cube has no changes", () => {
    const a = analyzeAlg("");
    expect(a).toMatchObject({
      cornersMoved: 0,
      cornersTwisted: 0,
      edgesMoved: 0,
      edgesFlipped: 0,
      total: 0,
    });
    expect(a.changedCorners).toEqual(Array(8).fill(false));
    expect(a.changedEdges).toEqual(Array(12).fill(false));
  });

  it("A2: R changes 8 pieces (4 corners + 4 edges moved) at the R-layer slots", () => {
    const a = analyzeAlg("R");
    expect(a).toMatchObject({
      cornersMoved: 4,
      cornersTwisted: 0,
      edgesMoved: 4,
      edgesFlipped: 0,
      total: 8,
    });
    expect(changedIndices(a.changedCorners)).toEqual(R_CORNER_SLOTS);
    expect(changedIndices(a.changedEdges)).toEqual(R_EDGE_SLOTS);
  });

  it("A3: every single face turn changes 8 pieces", () => {
    for (const face of ["U", "D", "L", "R", "F", "B"]) {
      const a = analyzeAlg(face);
      expect(a, face).toMatchObject({
        cornersMoved: 4,
        cornersTwisted: 0,
        edgesMoved: 4,
        edgesFlipped: 0,
        total: 8,
      });
    }
  });

  it("A4: a move followed by its inverse changes nothing", () => {
    expect(analyzeAlg("R R'").total).toBe(0);
  });

  it("A5: a half turn changes 8 pieces", () => {
    const a = analyzeAlg("R2");
    expect(a).toMatchObject({ cornersMoved: 4, edgesMoved: 4, total: 8 });
  });

  it("A6: whole-cube rotations are not changes", () => {
    for (const alg of ["x", "y", "z", "x y2 z'"]) {
      expect(analyzeAlg(alg).total, alg).toBe(0);
    }
  });

  it("A7: a trailing rotation does not affect the result", () => {
    expect(analyzeAlg("R x")).toEqual(analyzeAlg("R"));
  });

  it("A8: slice moves change 16 pieces (8 corners + 8 edges moved)", () => {
    // M x = L' R (same-axis layers commute and x = R M' L'), so the
    // center-normalized post-M state is exactly L' R: the slice edges
    // travel with the centers and stay solved relative to them, while
    // both outer layers become wrong relative to the centers.
    for (const alg of ["M", "E", "S", "M2"]) {
      const a = analyzeAlg(alg);
      expect(a, alg).toMatchObject({
        cornersMoved: 8,
        cornersTwisted: 0,
        edgesMoved: 8,
        edgesFlipped: 0,
        total: 16,
      });
    }
  });

  it("A9: superflip counts 12 edges flipped in place, nothing moved", () => {
    const data = solvedData();
    data["EDGES"]!.orientation = Array(12).fill(1);
    const a = analyzePattern(new KPattern(kpuzzle, data));
    expect(a).toMatchObject({
      cornersMoved: 0,
      cornersTwisted: 0,
      edgesMoved: 0,
      edgesFlipped: 12,
      total: 12,
    });
    expect(a.changedEdges).toEqual(Array(12).fill(true));
  });

  it("A10: two corners twisted in place count as orientation-only changes", () => {
    const data = solvedData();
    data["CORNERS"]!.orientation = [1, 2, 0, 0, 0, 0, 0, 0];
    const a = analyzePattern(new KPattern(kpuzzle, data));
    expect(a).toMatchObject({
      cornersMoved: 0,
      cornersTwisted: 2,
      edgesMoved: 0,
      edgesFlipped: 0,
      total: 2,
    });
    expect(changedIndices(a.changedCorners)).toEqual([0, 1]);
  });

  it("A11: R U R' U' changes 7 pieces (4 corners + 3 edges moved)", () => {
    // Verified against the KPuzzle itself; folklore would guess 6.
    const a = analyzeAlg("R U R' U'");
    expect(a).toMatchObject({
      cornersMoved: 4,
      cornersTwisted: 0,
      edgesMoved: 3,
      edgesFlipped: 0,
      total: 7,
    });
  });

  it("A12: throws when no rotation can restore the centers", () => {
    const data = solvedData();
    data["CENTERS"]!.pieces = [0, 2, 1, 3, 4, 5]; // illegal center swap
    expect(() => analyzePattern(new KPattern(kpuzzle, data))).toThrow();
  });
});
