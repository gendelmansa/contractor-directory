declare global {
  interface Window {
    adsbygoogle: any[];
    loadContractors: () => Promise<void>;
    displayContractors: (contractors: any[]) => void;
    searchContractors: () => Promise<void>;
    filterCategory: (cat: string) => void;
    submitLead: (e: Event) => Promise<void>;
  }
}

export {};