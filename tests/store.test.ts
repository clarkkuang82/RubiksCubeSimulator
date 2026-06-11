import { describe, expect, it, vi } from "vitest";
import { buildStickeringMask } from "../src/core/mask";
import { CubeStore } from "../src/core/store";

function constantRng(value = 0.5): () => number {
  let i = 0;
  // Cycle through a few values so scramble face picks vary.
  const values = [0.1, 0.9, 0.3, 0.7, value];
  return () => values[i++ % values.length]!;
}

describe("CubeStore", () => {
  it("T1: starts solved with highlight off", async () => {
    const store = await CubeStore.create();
    expect(store.state.moveCount).toBe(0);
    expect(store.state.analysis.total).toBe(0);
    expect(store.state.highlightOn).toBe(false);
    expect(store.state.maskString).toBeNull();
  });

  it("T2: applyMove updates analysis, move count, and alg string", async () => {
    const store = await CubeStore.create();
    store.applyMove("R");
    expect(store.state.analysis.total).toBe(8);
    expect(store.state.moveCount).toBe(1);
    expect(store.state.algString).toBe("R");
  });

  it("T3: undo removes the last move; undo on empty is a no-op", async () => {
    const store = await CubeStore.create();
    store.applyMove("R");
    store.undo();
    expect(store.state.moveCount).toBe(0);
    expect(store.state.analysis.total).toBe(0);
    expect(() => store.undo()).not.toThrow();
    expect(store.state.moveCount).toBe(0);
  });

  it("T4: applyAlgText applies each move of the alg", async () => {
    const store = await CubeStore.create();
    store.applyAlgText("R U R' U'");
    expect(store.state.moveCount).toBe(4);
    expect(store.state.algString).toBe("R U R' U'");
    expect(store.state.analysis.total).toBe(7); // matches A11
  });

  it("T5: invalid alg text is rejected and state is unchanged", async () => {
    const store = await CubeStore.create();
    store.applyMove("R");
    expect(() => store.applyAlgText("garbage !!")).toThrow();
    expect(() => store.applyAlgText("T")).toThrow(); // parses, but not a 3x3 move
    expect(store.state.moveCount).toBe(1);
    expect(store.state.analysis.total).toBe(8);
  });

  it("T6: reset clears scramble and moves", async () => {
    const store = await CubeStore.create(constantRng());
    store.scramble();
    store.applyMove("R");
    store.reset();
    expect(store.state.moveCount).toBe(0);
    expect(store.state.setupAlgString).toBe("");
    expect(store.state.analysis.total).toBe(0);
  });

  it("T7: scramble sets a 25-move setup and clears user moves", async () => {
    const store = await CubeStore.create(constantRng());
    store.applyMove("R");
    store.scramble();
    expect(store.state.setupAlgString.split(" ")).toHaveLength(25);
    expect(store.state.moveCount).toBe(0);
    expect(store.state.analysis.total).toBeGreaterThan(0);
  });

  it("T8: highlight toggle derives the mask from the analysis", async () => {
    const store = await CubeStore.create();
    store.applyMove("R");
    store.toggleHighlight();
    expect(store.state.highlightOn).toBe(true);
    expect(store.state.maskString).toBe(buildStickeringMask(store.state.analysis));
    store.toggleHighlight();
    expect(store.state.maskString).toBeNull();
  });

  it("T9: subscribers are notified on every state change", async () => {
    const store = await CubeStore.create(constantRng());
    const listener = vi.fn();
    store.subscribe(listener);
    store.applyMove("R");
    store.applyAlgText("U2");
    store.undo();
    store.scramble();
    store.toggleHighlight();
    store.reset();
    expect(listener).toHaveBeenCalledTimes(6);
  });
});
