import type { ReactNode } from "react";

export interface PanelProps {
  title?: string;
  className?: string;
  children: ReactNode;
}

// Composition wrapper: the panel only owns the frame and optional heading,
// whatever goes inside is passed as children.
export function Panel({ title, className = "", children }: PanelProps) {
  return (
    <div className={`dashboard-panel ${className}`.trim()}>
      {title ? <h3>{title}</h3> : null}
      {children}
    </div>
  );
}
