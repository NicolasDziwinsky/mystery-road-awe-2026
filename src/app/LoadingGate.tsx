import type { ReactNode } from "react";
import { useCaseData } from "../data/useCaseData.ts";
import { Panel } from "../components/index.ts";

export interface LoadingGateProps {
  children: ReactNode;
}

// Renders its children only once the case data is in memory. Uses early
// returns for the loading and error states.
export function LoadingGate({ children }: LoadingGateProps) {
  const { loading, error } = useCaseData();

  if (loading) {
    return (
      <Panel title="Loading case data">
        <p>Loading investigation files…</p>
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel title="Unable to load data">
        <p>{error}</p>
      </Panel>
    );
  }

  return <>{children}</>;
}
