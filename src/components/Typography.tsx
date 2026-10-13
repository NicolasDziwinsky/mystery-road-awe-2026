import type { ReactNode } from "react";

export interface TextProps {
  children: ReactNode;
  className?: string;
}

export function H2Text({ children }: TextProps) {
  return <h2>{children}</h2>;
}

export function NormalText({ children, className = "" }: TextProps) {
  return <p className={className}>{children}</p>;
}
