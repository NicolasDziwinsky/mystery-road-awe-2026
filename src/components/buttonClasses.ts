export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "small" | "medium";

export function buttonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  className = "",
): string {
  return ["btn", `btn-${variant}`, size === "small" ? "btn-small" : "", className]
    .filter(Boolean)
    .join(" ");
}
