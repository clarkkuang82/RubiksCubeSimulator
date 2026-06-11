import type { AppState } from "../core/store";

/** Renders the changed-pieces stats panel into `container`. */
export function renderStats(container: HTMLElement, state: AppState): void {
  const { analysis, moveCount } = state;
  container.innerHTML = `
    <p class="total-line">
      <span class="total-number" data-testid="changed-total">${analysis.total}</span>
      <span class="total-label">of 20 pieces changed</span>
    </p>
    <dl class="breakdown">
      <div><dt>Corners moved</dt><dd data-testid="corners-moved">${analysis.cornersMoved}</dd></div>
      <div><dt>Corners twisted in place</dt><dd data-testid="corners-twisted">${analysis.cornersTwisted}</dd></div>
      <div><dt>Edges moved</dt><dd data-testid="edges-moved">${analysis.edgesMoved}</dd></div>
      <div><dt>Edges flipped in place</dt><dd data-testid="edges-flipped">${analysis.edgesFlipped}</dd></div>
      <div><dt>Moves applied</dt><dd data-testid="move-count">${moveCount}</dd></div>
    </dl>
  `;
}
