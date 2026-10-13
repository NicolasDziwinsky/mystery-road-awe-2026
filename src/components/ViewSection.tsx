import type { ReactNode } from "react";
import { H2Text } from "./Typography.tsx";

export interface ViewSectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

// The outer frame every page shares (section + page heading).
export function ViewSection({ id, title, children }: ViewSectionProps) {
  return (
    <section id={`view-${id}`} className="view active">
      <H2Text>{title}</H2Text>
      {children}
    </section>
  );
}
