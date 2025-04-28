import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

/**
 * Calls the provided refetch functions whenever a transaction/account/card
 * mutation dispatches the `refetchAccountsTransactionsCards` action.
 */
export function useRefetchOnAccountsChange(...refetches: (() => void)[]) {
  const trigger = useSelector(
    (state: RootState) => state.refetch.accountsTransactionsCardsTrigger
  );

  useEffect(() => {
    if (trigger !== 0) refetches.forEach((fn) => fn());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
}

/**
 * Calls the provided refetch functions whenever a payment dispatches the
 * `refetchTransactionsBudgets` action.
 */
export function useRefetchOnTransactionsChange(...refetches: (() => void)[]) {
  const trigger = useSelector(
    (state: RootState) => state.refetch.transactionsBudgetsTrigger
  );

  useEffect(() => {
    if (trigger !== 0) refetches.forEach((fn) => fn());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
}
