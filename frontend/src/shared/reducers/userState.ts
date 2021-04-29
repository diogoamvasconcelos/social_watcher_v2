import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isLeft } from "fp-ts/lib/Either";
import { User } from "../../../../backend/src/domain/models/user";
import { SearchObject } from "../../../../backend/src/domain/models/userItem";
import {
  apiGetSearchObjects,
  apiGetUser,
  apiUpdateSearchObject,
} from "../lib/apiClient";

export type UserState = {
  details?: User;
  searchObjects: SearchObject[];
};

export const getUserDetails = createAsyncThunk("get:user", async () => {
  return await apiGetUser();
});
export const getUserSearchObjects = createAsyncThunk(
  "get:searchObjects",
  async () => {
    return await apiGetSearchObjects();
  }
);
export const updateUserSearchObjects = createAsyncThunk(
  "put:searchObject",
  async (args: Parameters<typeof apiUpdateSearchObject>) => {
    return await apiUpdateSearchObject(...args);
  }
);

const initialState: UserState = {
  searchObjects: [],
};
const userStateSlice = createSlice({
  name: "userState",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserDetails.fulfilled, (state, action) => {
        if (isLeft(action.payload)) {
          state.details = undefined;
          return;
        }

        state.details = action.payload.right;
      })
      .addCase(getUserSearchObjects.fulfilled, (state, action) => {
        if (isLeft(action.payload)) {
          state.searchObjects = [];
          return;
        }

        state.searchObjects = action.payload.right.items;
      })
      .addCase(updateUserSearchObjects.fulfilled, (state, action) => {
        if (isLeft(action.payload)) {
          state.searchObjects = [];
          return;
        }

        const updatedSearchObject: SearchObject = action.payload.right;
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
