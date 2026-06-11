import type { PatternAnalysis } from "./analysis";

// twisty-player stickering mask characters: "-" = regular, "D" = dim.
// Centers always stay regular: they are the reference frame the
// changed-piece analysis is normalized against.

const CENTERS_SEGMENT = "CENTERS:------";

export const ALL_REGULAR_MASK = `EDGES:${"-".repeat(12)},CORNERS:${"-".repeat(8)},${CENTERS_SEGMENT}`;

function segment(changed: readonly boolean[]): string {
  return changed.map((isChanged) => (isChanged ? "-" : "D")).join("");
}

/** Mask that keeps changed pieces regular and dims unchanged ones, for
 * `<twisty-player>.experimentalStickeringMaskOrbits`. */
export function buildStickeringMask(analysis: PatternAnalysis): string {
  return `EDGES:${segment(analysis.changedEdges)},CORNERS:${segment(analysis.changedCorners)},${CENTERS_SEGMENT}`;
}
