import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/lib/features/user/userSlice";
import loaderReducer from "@/lib/features/loader/loaderSlice";
import refetchReducer from "@/lib/features/helper/refetchHelperSlice";
import profileReducer from "@/lib/features/profileDialog/profileDialogSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      loader: loaderReducer,
      refetch: refetchReducer,
      profileDialog: profileReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
