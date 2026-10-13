import type { ReactNode } from "react";

export interface IntroCardProps {
  title?: string;
  description?: string;
  children?: ReactNode;
}

export function IntroCard({ title, description, children }: IntroCardProps) {
  return (
    <div className="intro-card">
      {title ? <h3>{title}</h3> : null}
      {description ? <p>{description}</p> : null}
      {children}
    </div>
  );
}
