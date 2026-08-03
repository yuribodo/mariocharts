import {
  getInitialPhase,
  reduceMorphEvent,
  type MorphEvent,
} from "./morph-phase";
import type { MorphPhase } from "./types";

describe("getInitialPhase", () => {
  it("returns settled when session already completed", () => {
    expect(getInitialPhase(true)).toBe("settled");
  });

  it("returns idle when session not completed", () => {
    expect(getInitialPhase(false)).toBe("idle");
  });
});

describe("reduceMorphEvent", () => {
  const cases: Array<[MorphPhase, MorphEvent, MorphPhase]> = [
    ["idle", "ENTER_VIEW", "morphing"],
    ["idle", "MORPH_DONE", "idle"],
    ["morphing", "MORPH_DONE", "settled"],
    ["morphing", "ENTER_VIEW", "morphing"],
    ["settled", "ENTER_VIEW", "settled"],
    ["settled", "MORPH_DONE", "settled"],
    ["morphing", "ABORT_SETTLE", "settled"],
  ];

  it.each(cases)("%s + %s → %s", (phase, event, next) => {
    expect(reduceMorphEvent(phase, event)).toBe(next);
  });
});
