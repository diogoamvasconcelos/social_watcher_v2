import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserAuthStateDetails = {
  id: string;
  email: string;
  status: "NOT_VERIFIED" | "VERIFIED";
};

export type UserAuthState =
  | UserAuthStateDetails
  | {
      status: "NULL";
    };

const initialState: UserAuthState = { status: "NULL" } as UserAuthState; // force the more generic UserAuthState type
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
