import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface ProfileState {
  open: boolean;
}

const initialState: ProfileState = {
  open: false,
};

export const profileDialogSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setOpen: (state, action: PayloadAction<boolean>) => {
      state.open = action.payload;
    },
  },
});

export const { setOpen } = profileDialogSlice.actions;

export default profileDialogSlice.reducer;
