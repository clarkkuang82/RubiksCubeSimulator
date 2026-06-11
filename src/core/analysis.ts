import type { KPattern, KPuzzle } from "cubing/kpuzzle";
import { cube3x3x3 } from "cubing/puzzles";

export interface PatternAnalysis {
  cornersMoved: number;
  cornersTwisted: number;
  edgesMoved: number;
  edgesFlipped: number;
  total: number;
  /** Per-slot changed flags. Unchanged pieces sit at home, so slot
   * indices and piece indices describe the same set. */
  changedCorners: boolean[];
  changedEdges: boolean[];
}

let kpuzzlePromise: Promise<KPuzzle> | undefined;

export function loadKPuzzle(): Promise<KPuzzle> {
  kpuzzlePromise ??= cube3x3x3.kpuzzle();
  return kpuzzlePromise;
}

// The 24 cube orientations: choose where U goes (identity, x powers, z
// turns), then spin around U with y powers.
const ROTATION_ALGS: readonly string[] = ["", "x", "x2", "x'", "z", "z'"]
  .flatMap((a) => ["", "y", "y2", "y'"].map((b) => [a, b].filter(Boolean).join(" ")));

function centersAreSolved(pattern: KPattern): boolean {
  return pattern.patternData["CENTERS"]!.pieces.every((piece, slot) => piece === slot);
}

/** Re-orient the whole cube so the centers are in their solved spots,
 * making the analysis ignore x/y/z rotations and the center movement of
 * slice moves. Center orientation is ignored (it has no visible effect
 * on a standard color scheme). */
function normalize(pattern: KPattern): KPattern {
  for (const rotation of ROTATION_ALGS) {
    const candidate = rotation === "" ? pattern : pattern.applyAlg(rotation);
    if (centersAreSolved(candidate)) {
      return candidate;
    }
  }
  throw new Error("Invalid pattern: no whole-cube rotation restores the centers");
}

interface OrbitDiff {
  moved: number;
  orientedInPlace: number;
  changed: boolean[];
}

function diffOrbit(pattern: KPattern, orbitName: string): OrbitDiff {
  const { pieces, orientation } = pattern.patternData[orbitName]!;
  const diff: OrbitDiff = { moved: 0, orientedInPlace: 0, changed: [] };
  pieces.forEach((piece, slot) => {
    const moved = piece !== slot;
    const orientedInPlace = !moved && orientation[slot] !== 0;
    if (moved) diff.moved++;
    if (orientedInPlace) diff.orientedInPlace++;
    diff.changed.push(moved || orientedInPlace);
  });
  return diff;
}

export function analyzePattern(pattern: KPattern): PatternAnalysis {
  const normalized = normalize(pattern);
  const corners = diffOrbit(normalized, "CORNERS");
  const edges = diffOrbit(normalized, "EDGES");
  return {
    cornersMoved: corners.moved,
    cornersTwisted: corners.orientedInPlace,
    edgesMoved: edges.moved,
    edgesFlipped: edges.orientedInPlace,
    total: corners.moved + corners.orientedInPlace + edges.moved + edges.orientedInPlace,
    changedCorners: corners.changed,
    changedEdges: edges.changed,
  };
}
