import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserState = {
  id: string;
  email: string;
  verified: boolean;
};

const initialState: UserState = { id: "", email: "", verified: false };
const userStateSlice = createSlice({
  name: "userState",
  initialState,
  reducers: {
    onLogin(_state, action: PayloadAction<UserState>) {
      return action.payload;
    },
    onLogout(_state) {
      return initialState;
    },
  },
});

export const { onLogin, onLogout } = userStateSlice.actions;
export const reducer = userStateSlice.reducer;
