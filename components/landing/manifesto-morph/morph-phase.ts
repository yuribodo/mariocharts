import type { MorphPhase } from "./types";

export type MorphEvent = "ENTER_VIEW" | "MORPH_DONE" | "ABORT_SETTLE";

export function getInitialPhase(hasSettledInSession: boolean): MorphPhase {
  return hasSettledInSession ? "settled" : "idle";
}

export function reduceMorphEvent(
  phase: MorphPhase,
  event: MorphEvent
): MorphPhase {
  if (phase === "settled") return "settled";

  if (event === "ABORT_SETTLE") return "settled";

  if (phase === "idle" && event === "ENTER_VIEW") return "morphing";
  if (phase === "morphing" && event === "MORPH_DONE") return "settled";

  return phase;
}
