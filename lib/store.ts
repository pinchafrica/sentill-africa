import { create } from 'zustand';

interface AIStore {
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  toggleChat: () => void;
  
  isAssetModalOpen: boolean;
  setAssetModalOpen: (open: boolean) => void;
  
  prefilledAsset?: string;
  setPrefilledAsset: (asset?: string) => void;
  
  isTaxOptimizerOpen: boolean;
  setTaxOptimizerOpen: (open: boolean) => void;
  
  isSupportOpen: boolean;
  setSupportOpen: (open: boolean) => void;
  
  isPremiumModalOpen: boolean;
  setPremiumModalOpen: (open: boolean) => void;

  // Watchlist & Portfolio Global State
  watchlist: string[];
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  toggleWatchlist: (id: string) => void;

  portfolio: string[];
  addToPortfolio: (id: string) => void;
  removeFromPortfolio: (id: string) => void;
}

export const useAIStore = create<AIStore>((set) => ({
  isChatOpen: false,
  setChatOpen: (open) => set({ isChatOpen: open }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  
  isAssetModalOpen: false,
  setAssetModalOpen: (open) => set({ isAssetModalOpen: open }),
  
  prefilledAsset: undefined,
  setPrefilledAsset: (asset) => set({ prefilledAsset: asset }),
  
  isTaxOptimizerOpen: false,
  setTaxOptimizerOpen: (open) => set({ isTaxOptimizerOpen: open }),
  
  isSupportOpen: false,
  setSupportOpen: (open) => set({ isSupportOpen: open }),

  isPremiumModalOpen: false,
  setPremiumModalOpen: (open) => set({ isPremiumModalOpen: open }),

  // Watchlist & Portfolio Actions
  watchlist: [],
  addToWatchlist: (id) => set((state) => ({ watchlist: [...new Set([...state.watchlist, id])] })),
  removeFromWatchlist: (id) => set((state) => ({ watchlist: state.watchlist.filter((w) => w !== id) })),
  toggleWatchlist: (id) => set((state) => ({
    watchlist: state.watchlist.includes(id) 
      ? state.watchlist.filter((w) => w !== id) 
      : [...state.watchlist, id]
  })),

  portfolio: [],
  addToPortfolio: (id) => set((state) => ({ portfolio: [...new Set([...state.portfolio, id])] })),
  removeFromPortfolio: (id) => set((state) => ({ portfolio: state.portfolio.filter((p) => p !== id) })),
}));
