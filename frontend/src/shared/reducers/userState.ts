import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isLeft } from "fp-ts/lib/Either";
import { User } from "../../../../backend/src/domain/models/user";
import { newPositiveInteger } from "../../../../backend/src/lib/iots";
import { apiGetUser } from "../lib/apiClient";

export type UserState = User;

export const getUser = createAsyncThunk("get:user", async () => {
  return await apiGetUser();
});

const initialState: UserState = {
  id: "",
  email: "",
  subscriptionStatus: "INACTIVE",
  subscriptionType: "NORMAL",
  nofSearchObjects: newPositiveInteger(0),
};
const userStateSlice = createSlice({
  name: "userState",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getUser.fulfilled, (_state, action) => {
      console.log(action);
      if (isLeft(action.payload)) {
        // TODO: show error?
        return initialState;
      }

      return action.payload.right;
    });
  },
});

//export const {  getUser } = userStateSlice.actions;
export const reducer = userStateSlice.reducer;
