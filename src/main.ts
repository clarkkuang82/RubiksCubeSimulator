import { TwistyPlayer } from "cubing/twisty";
import { ALL_REGULAR_MASK } from "./core/mask";
import { CubeStore, type AppState } from "./core/store";
import { renderMoveButtons } from "./ui/controls";
import { renderStats } from "./ui/stats";
import "./style.css";

function el<T extends HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`Missing element: ${selector}`);
  return found;
}

async function init(): Promise<void> {
  const store = await CubeStore.create();

  const player = new TwistyPlayer({
    puzzle: "3x3x3",
    controlPanel: "none",
    background: "none",
    hintFacelets: "none",
    tempoScale: 4,
  });
  el("#player-mount").append(player);

  const statsEl = el("#stats");
  const highlightToggle = el<HTMLInputElement>('[data-testid="highlight-toggle"]');
  const algForm = el<HTMLFormElement>("#alg-form");
  const algInput = el<HTMLInputElement>('[data-testid="alg-input"]');
  const algError = el<HTMLParagraphElement>('[data-testid="alg-error"]');

  function render(state: AppState): void {
    player.experimentalSetupAlg = state.setupAlgString;
    player.alg = state.algString;
    // The property getter is write-only, so mirror what we applied for
    // styling and tests.
    const mask = state.maskString ?? ALL_REGULAR_MASK;
    player.experimentalStickeringMaskOrbits = mask;
    player.dataset["stickeringMask"] = state.maskString ?? "";
    renderStats(statsEl, state);
  }

  store.subscribe(render);
  render(store.state);

  renderMoveButtons(el("#move-buttons"), (move) => store.applyMove(move));

  algForm.addEventListener("submit", (event) => {
    event.preventDefault();
    algError.hidden = true;
    try {
      store.applyAlgText(algInput.value);
      algInput.value = "";
    } catch {
      algError.textContent = `Invalid algorithm: ${algInput.value}`;
      algError.hidden = false;
    }
  });

  highlightToggle.addEventListener("change", () => store.toggleHighlight());
  el('[data-testid="scramble"]').addEventListener("click", () => store.scramble());
  el('[data-testid="undo"]').addEventListener("click", () => store.undo());
  el('[data-testid="reset"]').addEventListener("click", () => {
    store.reset();
    algError.hidden = true;
  });

  document.body.dataset["ready"] = "true";
}

init();
