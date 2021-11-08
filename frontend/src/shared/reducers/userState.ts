import { createSlice } from "@reduxjs/toolkit";
import { User } from "@backend/domain/models/user";
import { SearchObjectDomain } from "@backend/domain/models/userItem";
import { apiGetSearchObjects, apiGetUser } from "../lib/apiClient";
import { createApiAction, logRejected } from "../lib/redux";
import { ActionStatus } from "../lib/reduxThunk";

export type UserState = {
  details?: User;
  searchObjects: SearchObjectDomain[];
  status: ActionStatus;
};

export const getUserDetails = createApiAction("get:user", apiGetUser);

export const getUserSearchObjects = createApiAction(
  "get:searchObjects",
  apiGetSearchObjects
);

const initialState: UserState = {
  searchObjects: [],
  status: "INITAL",
};
const userStateSlice = createSlice({
  name: "userState",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserDetails.pending, (state, _action) => {
        state.status = "PENDING";
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.details = action.payload;
        state.status = "FULFILLED";
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.status = "REJECTED";
        logRejected("getUserDetails request", action);
      })
      .addCase(getUserSearchObjects.pending, (state, _action) => {
        state.status = "PENDING";
      })
      .addCase(getUserSearchObjects.fulfilled, (state, action) => {
        state.searchObjects = action.payload.items;
        state.status = "FULFILLED";
      })
      .addCase(getUserSearchObjects.rejected, (state, action) => {
        logRejected("getUserSearchObjects request", action);
        state.status = "REJECTED";
      });
  },
});

//export const {  getUser } = userStateSlice.actions;
export const reducer = userStateSlice.reducer;
