import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface RefetchState {
  accountsTransactionsCardsTrigger: number;
  transactionsBudgetsTrigger: number;
}

const initialState: RefetchState = {
  accountsTransactionsCardsTrigger: 0,
  transactionsBudgetsTrigger: 0,
};
export const refetchHelperSlice = createSlice({
  name: "refetchHelper",
  initialState,
  reducers: {
    refetchAccountsTransactionsCards: (state) => {
      state.accountsTransactionsCardsTrigger =
        state.accountsTransactionsCardsTrigger + 1;
    },
    refetchTransactionsBudgets: (state) => {
      state.transactionsBudgetsTrigger = state.transactionsBudgetsTrigger + 1;
    },
  },
});

export const { refetchAccountsTransactionsCards, refetchTransactionsBudgets } =
  refetchHelperSlice.actions;

export default refetchHelperSlice.reducer;
