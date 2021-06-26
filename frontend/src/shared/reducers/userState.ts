import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isLeft } from "fp-ts/lib/Either";
import { User } from "@backend/domain/models/user";
import { SearchObjectDomain } from "@backend/domain/models/userItem";
import {
  apiGetSearchObjects,
  apiGetUser,
  apiUpdateSearchObject,
} from "../lib/apiClient";

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
export const updateUserSearchObjects = createAsyncThunk(
  "put:searchObject",
  async (
    args: Parameters<typeof apiUpdateSearchObject>,
    { rejectWithValue }
  ) => {
    const res = await apiUpdateSearchObject(...args);
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
      })
      .addCase(updateUserSearchObjects.pending, (state, _action) => {
        state.fetchStatus = "loading";
      })
      .addCase(updateUserSearchObjects.fulfilled, (state, action) => {
        state.fetchStatus = "idle";

        const updatedSearchObject: SearchObjectDomain = action.payload;
        state.searchObjects = state.searchObjects.map((searchObject) =>
          searchObject.index == updatedSearchObject.index
            ? updatedSearchObject
            : searchObject
        );
      });
  },
});

//export const {  getUser } = userStateSlice.actions;
export const reducer = userStateSlice.reducer;
