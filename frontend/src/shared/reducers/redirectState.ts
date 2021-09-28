import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type RedirectState = {
  loginRedirectUrl?: string;
};

const redirectStateSlice = createSlice({
  name: "redirectState",
  initialState: {} as RedirectState,
  reducers: {
    setLoginRedirectUrl(
      state,
      action: PayloadAction<RedirectState["loginRedirectUrl"]>
    ) {
      state.loginRedirectUrl = action.payload;
    },
  },
});

export const { setLoginRedirectUrl } = redirectStateSlice.actions;
export const reducer = redirectStateSlice.reducer;
