import { createSlice } from "@reduxjs/toolkit";
import { User } from "@backend/domain/models/user";
import { SearchObjectDomain } from "@backend/domain/models/userItem";
import { apiGetSearchObjects, apiGetUser } from "../lib/apiClient";
import { createApiAction, logRejected } from "../lib/redux";

export type UserState = {
  details?: User;
  searchObjects: SearchObjectDomain[];
  fetchStatus: "idle" | "loading";
};

export const getUserDetails = createApiAction("get:user", apiGetUser);

export const getUserSearchObjects = createApiAction(
  "get:searchObjects",
  apiGetSearchObjects
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
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.details = action.payload;
      })
      .addCase(getUserDetails.rejected, (_state, action) => {
        logRejected("getUserDetails request", action);
      })
      .addCase(getUserSearchObjects.fulfilled, (state, action) => {
        state.searchObjects = action.payload.items;
      })
      .addCase(getUserSearchObjects.rejected, (_state, action) => {
        logRejected("getUserSearchObjects request", action);
      });
  },
});

//export const {  getUser } = userStateSlice.actions;
export const reducer = userStateSlice.reducer;
