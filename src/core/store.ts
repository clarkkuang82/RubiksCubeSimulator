import { Alg } from "cubing/alg";
import type { KPattern, KPuzzle } from "cubing/kpuzzle";
import { analyzePattern, loadKPuzzle, type PatternAnalysis } from "./analysis";
import { buildStickeringMask } from "./mask";
import { randomScramble } from "./scramble";

export interface AppState {
  readonly setupAlgString: string;
  readonly algString: string;
  readonly moveCount: number;
  readonly highlightOn: boolean;
  readonly analysis: PatternAnalysis;
  /** Highlight mask for the twisty-player, or null when highlight is off. */
  readonly maskString: string | null;
}

type Listener = (state: AppState) => void;

export class CubeStore {
  #kpuzzle: KPuzzle;
  #rng: () => number;
  #setupMoves: string[] = [];
  #userMoves: string[] = [];
  #highlightOn = false;
  #state: AppState;
  #listeners = new Set<Listener>();

  private constructor(kpuzzle: KPuzzle, rng: () => number) {
    this.#kpuzzle = kpuzzle;
    this.#rng = rng;
    this.#state = this.#deriveState();
  }

  static async create(rng: () => number = Math.random): Promise<CubeStore> {
    return new CubeStore(await loadKPuzzle(), rng);
  }

  get state(): AppState {
    return this.#state;
  }

  subscribe(listener: Listener): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  applyMove(move: string): void {
    this.#applyMoves([move]);
  }

  /** Applies every move of an alg in standard notation. Throws on
   * invalid input, leaving the state untouched. */
  applyAlgText(text: string): void {
    const moves = [...Alg.fromString(text).experimentalExpand()].map((node) =>
      node.toString(),
    );
    this.#applyMoves(moves);
  }

  undo(): void {
    if (this.#userMoves.length === 0) return;
    this.#userMoves.pop();
    this.#commit();
  }

  reset(): void {
    this.#setupMoves = [];
    this.#userMoves = [];
    this.#commit();
  }

  scramble(): void {
    this.#setupMoves = randomScramble(this.#rng);
    this.#userMoves = [];
    this.#commit();
  }

  toggleHighlight(): void {
    this.#highlightOn = !this.#highlightOn;
    this.#commit();
  }

  #applyMoves(moves: string[]): void {
    const next = [...this.#userMoves, ...moves];
    this.#pattern(next); // validates: throws before any state change
    this.#userMoves = next;
    this.#commit();
  }

  #pattern(userMoves: readonly string[]): KPattern {
    let pattern = this.#kpuzzle.defaultPattern();
    for (const move of [...this.#setupMoves, ...userMoves]) {
      pattern = pattern.applyMove(move);
    }
    return pattern;
  }

  #deriveState(): AppState {
    const analysis = analyzePattern(this.#pattern(this.#userMoves));
    return {
      setupAlgString: this.#setupMoves.join(" "),
      algString: this.#userMoves.join(" "),
      moveCount: this.#userMoves.length,
      highlightOn: this.#highlightOn,
      analysis,
      maskString: this.#highlightOn ? buildStickeringMask(analysis) : null,
    };
  }

  #commit(): void {
    this.#state = this.#deriveState();
    for (const listener of this.#listeners) {
      listener(this.#state);
    }
  }
}
