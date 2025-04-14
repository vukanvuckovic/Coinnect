import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface LoaderState {
  loading: boolean;
}

const initialState: LoaderState = {
  loading: true,
};

export const loaderSlice = createSlice({
  name: "loader",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setLoading } = loaderSlice.actions;

export default loaderSlice.reducer;
