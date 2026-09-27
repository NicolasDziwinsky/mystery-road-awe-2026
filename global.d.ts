declare global {
  interface Window {
    navigateTo: (viewName: string) => void;
    handleHashChange: () => void;
    switchPeopleTab: (tab: "people" | "locations") => void;
    saveHypothesis: () => void;
    saveCurrentNote: () => void;
    closeEvidenceDetail: () => void;
  }
}

export {};
