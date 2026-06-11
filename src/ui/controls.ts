const MOVE_ROWS: readonly (readonly string[])[] = [
  ["U", "U'", "U2", "D", "D'", "D2"],
  ["L", "L'", "L2", "R", "R'", "R2"],
  ["F", "F'", "F2", "B", "B'", "B2"],
  ["M", "M'", "E", "E'", "S", "S'"],
  ["x", "x'", "y", "y'", "z", "z'"],
];

/** Builds the move-button grid; clicking a button applies its move. */
export function renderMoveButtons(
  container: HTMLElement,
  onMove: (move: string) => void,
): void {
  for (const row of MOVE_ROWS) {
    const rowEl = document.createElement("div");
    rowEl.className = "move-row";
    for (const move of row) {
      const button = document.createElement("button");
      button.textContent = move;
      button.dataset["move"] = move;
      button.addEventListener("click", () => onMove(move));
      rowEl.append(button);
    }
    container.append(rowEl);
  }
}
