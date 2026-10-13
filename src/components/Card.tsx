import type { ReactNode } from "react";

export type CardKind = "person" | "location";

export interface CardProps {
  kind: CardKind;
  children: ReactNode;
}

// Shared card shell for People and Locations. The vanilla app wrote this
// frame out by hand in renderPeople() and renderLocations().
export function Card({ kind, children }: CardProps) {
  return <div className={`${kind}-card`}>{children}</div>;
}
