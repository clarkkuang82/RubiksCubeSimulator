const FACES = ["U", "D", "L", "R", "F", "B"] as const;
const MODIFIERS = ["", "'", "2"] as const;

/** Random-move scramble: `length` outer face turns, never the same face
 * twice in a row. The RNG is injectable for deterministic tests. */
export function randomScramble(
  rng: () => number = Math.random,
  length = 25,
): string[] {
  const moves: string[] = [];
  let previousFace: string | undefined;
  while (moves.length < length) {
    const face = FACES[Math.floor(rng() * FACES.length)]!;
    if (face === previousFace) continue;
    const modifier = MODIFIERS[Math.floor(rng() * MODIFIERS.length)]!;
    moves.push(face + modifier);
    previousFace = face;
  }
  return moves;
}
