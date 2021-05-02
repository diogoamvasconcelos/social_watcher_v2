import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Not used atm

export type UserAuthState = {
  id: string;
  email: string;
  verified: boolean;
};

const initialState: UserAuthState = { id: "", email: "", verified: false };
const userAuthStateSlice = createSlice({
  name: "userAuthState",
  initialState,
  reducers: {
    onLogin(_state, action: PayloadAction<UserAuthState>) {
      return action.payload;
    },
    onLogout(_state) {
      return initialState;
    },
  },
});

export const { onLogin, onLogout } = userAuthStateSlice.actions;
export const reducer = userAuthStateSlice.reducer;
