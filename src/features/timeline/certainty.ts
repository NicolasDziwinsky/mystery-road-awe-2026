import type { BadgeVariant } from "../../components/index.ts";

// Lookup instead of an if/else chain (same mapping as certaintyBadgeClass()
// in the vanilla views/timeline.ts).
const CERTAINTY_VARIANTS: Record<string, BadgeVariant> = {
  confirmed: "reviewed",
  contradictory: "critical",
  reported: "flagged",
};

export function certaintyBadgeVariant(certainty: string): BadgeVariant {
  return CERTAINTY_VARIANTS[certainty] ?? "unreviewed";
}
