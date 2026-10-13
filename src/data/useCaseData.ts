import { useEffect, useState } from "react";
import { isCaseDataLoaded, loadCaseData } from "./loadCaseData.ts";

export interface CaseDataStatus {
  loading: boolean;
  error: string;
}

// The only state here is "is the data there yet?", which is needed to
// render the initial view at all.
export function useCaseData(): CaseDataStatus {
  const [status, setStatus] = useState<CaseDataStatus>(() => ({
    loading: !isCaseDataLoaded(),
    error: "",
  }));

  useEffect(() => {
    if (isCaseDataLoaded()) return;
    let isMounted = true;

    loadCaseData()
      .then(() => {
        if (isMounted) setStatus({ loading: false, error: "" });
      })
      .catch((err: unknown) => {
        console.error("Case data load failed", err);
        if (isMounted) {
          setStatus({ loading: false, error: "The case data could not be loaded." });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return status;
}
