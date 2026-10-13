export type BadgeVariant = "critical" | "reviewed" | "flagged" | "relevant" | "unreviewed";

export interface StatusBadgeProps {
  status: string;
  // Callers that know better (e.g. timeline certainty) pass the variant
  // explicitly; otherwise it is derived from the status text.
  variant?: BadgeVariant;
}

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  critical: "critical",
  reviewed: "reviewed",
  flagged: "flagged",
  relevant: "relevant",
};

export function statusToVariant(status: string): BadgeVariant {
  return STATUS_VARIANTS[status.toLowerCase()] ?? "unreviewed";
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const resolved = variant ?? statusToVariant(status);
  return <span className={`badge badge-${resolved}`}>{status}</span>;
}
