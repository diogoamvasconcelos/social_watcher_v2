import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isLeft } from "fp-ts/lib/Either";
import { User } from "../../../../backend/src/domain/models/user";
import {
  decode,
  fromEither,
  positiveInteger,
} from "../../../../backend/src/lib/iots";
import { apiGetUser } from "../lib/apiClient";

export type UserState = User;

export const getUser = createAsyncThunk("get:user", async (_thunkAPI) => {
  return Promise.resolve({}); // await apiGetUser();
});

const initialState: UserState = {
  id: "",
  email: "",
  subscriptionStatus: "INACTIVE",
  subscriptionType: "NORMAL",
  nofSearchObjects: fromEither(decode(positiveInteger, 0)),
};
const userStateSlice = createSlice({
  name: "userState",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getUser.fulfilled, (state, action) => {
      if (isLeft(action.payload)) {
        // TODO: show error?
        return initialState;
      }

      return state;
    });
  },
});

//export const {  getUser } = userStateSlice.actions;
export const reducer = userStateSlice.reducer;
