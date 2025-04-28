"use client";
import { createContext, useContext } from "react";

type RefetchAccountsContextType = {
  refetchAccounts: () => void;
};

export const RefetchAccountsContext =
  createContext<RefetchAccountsContextType | null>(null);

export const useRefetchAccounts = () => {
  const context = useContext(RefetchAccountsContext);
  if (!context) {
    throw new Error(
      "useRefetchAccounts must be used within a RefetchAccountsProvider"
    );
  }
  return context;
};
