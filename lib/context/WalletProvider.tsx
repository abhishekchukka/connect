"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface WalletContextType {
  isWalletOpen: boolean;
  openWallet: () => void;
  closeWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const openWallet = () => setIsWalletOpen(true);
  const closeWallet = () => setIsWalletOpen(false);

  return (
    <WalletContext.Provider value={{ isWalletOpen, openWallet, closeWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
