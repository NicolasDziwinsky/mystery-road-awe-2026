import type { ButtonHTMLAttributes } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./buttonClasses.ts";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  label,
  variant = "secondary",
  size = "medium",
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...props}>
      {label}
    </button>
  );
}
