import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isLeft } from "fp-ts/lib/Either";
import { User } from "@backend/domain/models/user";
import { SearchObjectDomain } from "@backend/domain/models/userItem";
import { apiGetSearchObjects, apiGetUser } from "../lib/apiClient";

export type UserState = {
  details?: User;
  searchObjects: SearchObjectDomain[];
  fetchStatus: "idle" | "loading";
};

export const getUserDetails = createAsyncThunk(
  "get:user",
  async (_, { rejectWithValue }) => {
    const res = await apiGetUser();
    if (isLeft(res)) {
      return rejectWithValue(res.left);
    }
    return res.right;
  }
);
export const getUserSearchObjects = createAsyncThunk(
  "get:searchObjects",
  async (_, { rejectWithValue }) => {
    const res = await apiGetSearchObjects();
    if (isLeft(res)) {
      return rejectWithValue(res.left);
    }
    return res.right;
  }
);

const initialState: UserState = {
  searchObjects: [],
  fetchStatus: "idle",
};
const userStateSlice = createSlice({
  name: "userState",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // TODO: add `.addCase(xxxxxx.rejected, ...)
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.details = action.payload;
      })
      .addCase(getUserSearchObjects.fulfilled, (state, action) => {
        state.searchObjects = action.payload.items;
      });
  },
});

//export const {  getUser } = userStateSlice.actions;
export const reducer = userStateSlice.reducer;
