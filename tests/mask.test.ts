import { beforeAll, describe, expect, it } from "vitest";
import type { KPuzzle } from "cubing/kpuzzle";
import { analyzePattern, loadKPuzzle } from "../src/core/analysis";
import { ALL_REGULAR_MASK, buildStickeringMask } from "../src/core/mask";

let kpuzzle: KPuzzle;

beforeAll(async () => {
  kpuzzle = await loadKPuzzle();
});

describe("buildStickeringMask", () => {
  it("K1: dims every corner and edge when nothing changed", () => {
    const analysis = analyzePattern(kpuzzle.defaultPattern());
    expect(buildStickeringMask(analysis)).toBe(
      "EDGES:DDDDDDDDDDDD,CORNERS:DDDDDDDD,CENTERS:------",
    );
  });

  it("K2: keeps exactly the changed pieces regular after R", () => {
    const analysis = analyzePattern(kpuzzle.defaultPattern().applyAlg("R"));
    // R-layer slots from the KPuzzle definition: edges 1,5,8,10; corners 0,1,4,7.
    expect(buildStickeringMask(analysis)).toBe(
      "EDGES:D-DDD-DD-D-D,CORNERS:--DD-DD-,CENTERS:------",
    );
  });

  it("K3: keeps everything regular when every piece changed", () => {
    const analysis = analyzePattern(
      kpuzzle.defaultPattern().applyAlg("R L U D F B"),
    );
    expect(analysis.total).toBe(20);
    expect(buildStickeringMask(analysis)).toBe(
      "EDGES:------------,CORNERS:--------,CENTERS:------",
    );
  });

  it("K4: segments have the right lengths and orbit names", () => {
    const mask = buildStickeringMask(analyzePattern(kpuzzle.defaultPattern()));
    const segments = mask.split(",");
    expect(segments).toHaveLength(3);
    const byName = Object.fromEntries(segments.map((s) => s.split(":")));
    expect(byName["EDGES"]).toHaveLength(12);
    expect(byName["CORNERS"]).toHaveLength(8);
    expect(byName["CENTERS"]).toHaveLength(6);
  });

  it("exports an all-regular mask matching the format", () => {
    expect(ALL_REGULAR_MASK).toBe(
      "EDGES:------------,CORNERS:--------,CENTERS:------",
    );
  });
});
