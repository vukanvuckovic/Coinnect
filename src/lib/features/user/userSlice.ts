import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  address?: string;
  state?: string;
  postalCode?: string;
  dateOfBirth?: string;
  ssn?: string;
  email: string;
  accounts?: Account[];
  cards?: Card[];
  templates?: Template[];
  budgets: {
    entertainment?: number;
    food?: number;
    travel?: number;
    general?: number;
    debt?: number;
  };
}

export interface UserState {
  userInfo: UserInfo | undefined;
  loading: boolean;
}

const initialState: UserState = {
  userInfo: undefined,
  loading: true,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserInfo | undefined>) => {
      state.userInfo = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateCardDisabled: (
      state,
      action: PayloadAction<{ cardId: string; disabled: boolean }>
    ) => {
      if (
        state.userInfo &&
        state.userInfo.cards &&
        state.userInfo.cards.length > 0
      ) {
        state.userInfo.cards = state.userInfo.cards.map((item) =>
          item.id === action.payload.cardId
            ? { ...item, disabled: action.payload.disabled }
            : item
        );
      }
    },
    updateAccountDisabled: (
      state,
      action: PayloadAction<{ accountId: string; disabled: boolean }>
    ) => {
      if (
        state.userInfo &&
        state.userInfo.accounts &&
        state.userInfo.accounts.length > 0
      ) {
        state.userInfo.accounts = state.userInfo.accounts.map((item) =>
          item.id === action.payload.accountId
            ? { ...item, disabled: action.payload.disabled }
            : item
        );
      }
    },
    setAccounts: (state, action: PayloadAction<{ accounts: Account[] }>) => {
      if (state.userInfo) state.userInfo.accounts = action.payload.accounts;
    },
    addAccount: (state, action: PayloadAction<{ account: Account }>) => {
      state.userInfo?.accounts?.push(action.payload.account);
    },
    removeAccount: (state, action: PayloadAction<{ accountId: string }>) => {
      if (state.userInfo?.accounts) {
        state.userInfo.accounts = state.userInfo.accounts.filter(
          (item) => item.id !== action.payload.accountId
        );
      }
    },
    addTemplate: (state, action: PayloadAction<{ template: Template }>) => {
      state.userInfo?.templates?.push(action.payload.template);
    },
    updateTemplate: (state, action: PayloadAction<{ template: Template }>) => {
      const updatedTemplate = action.payload.template;

      if (state.userInfo?.templates) {
        state.userInfo.templates = state.userInfo.templates.map((item) =>
          item.id === updatedTemplate.id ? updatedTemplate : item
        );
      }
    },
    removeTemplate: (state, action: PayloadAction<{ templateId: string }>) => {
      if (state.userInfo?.templates) {
        state.userInfo.templates = state.userInfo.templates.filter(
          (item) => item.id !== action.payload.templateId
        );
      }
    },
    updateBudget: (
      state,
      action: PayloadAction<{ name: string; budget: number | undefined }>
    ) => {
      if (state.userInfo) {
        state.userInfo.budgets[action.payload.name as Category] =
          action.payload.budget;
      }
    },
    addCard: (state, action: PayloadAction<{ card: Card }>) => {
      state.userInfo?.cards?.push(action.payload.card);
    },
    removeCard: (state, action: PayloadAction<{ cardId: string }>) => {
      if (state.userInfo?.cards) {
        state.userInfo.cards = state.userInfo.cards.filter(
          (item) => item.id !== action.payload.cardId
        );
      }
    },
  },
});

export const {
  setUser,
  setLoading,
  updateCardDisabled,
  updateAccountDisabled,
  setAccounts,
  updateBudget,
  updateTemplate,
  addAccount,
  removeAccount,
  addTemplate,
  removeTemplate,
  addCard,
  removeCard,
} = userSlice.actions;

export default userSlice.reducer;
