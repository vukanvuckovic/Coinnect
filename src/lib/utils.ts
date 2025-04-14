import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function totalBalance(accounts: Account[]): number {
  return accounts.reduce((total, account) => {
    const balance = Number(account.balance) || 0;
    return total + balance;
  }, 0);
}
