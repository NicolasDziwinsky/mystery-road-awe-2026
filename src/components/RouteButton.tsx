import { Link } from "react-router-dom";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./buttonClasses.ts";

export interface RouteButtonProps {
  label: string;
  targetLocation: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

// A real <Link> styled as a button: navigation becomes a normal anchor
// (middle-click, "open in new tab" and the back button all work).
export function RouteButton({
  label,
  targetLocation,
  variant = "secondary",
  size = "medium",
  className = "",
}: RouteButtonProps) {
  return (
    <Link to={targetLocation} className={buttonClasses(variant, size, className)}>
      {label}
    </Link>
  );
}
