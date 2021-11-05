import { SearchObjectDomain } from "@backend/domain/models/userItem";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ActionStatus } from "../../../shared/lib/reduxThunk";
import {
  apiCreateSearchObject,
  apiDeleteSearchObject,
  apiGetSearchObject,
  apiUpdateSearchObject,
  apiGetDefaultSearchObject,
} from "../../../shared/lib/apiClient";
import { newLowerCase } from "@diogovasconcelos/lib/iots";
import {
  createApiAction,
  createApiActionWithArgs,
  logRejected,
} from "@src/shared/lib/redux";

export const getUserSearchObject = createApiActionWithArgs(
  "get:searchObject",
  apiGetSearchObject
);

export const createUserSearchObject = createApiActionWithArgs(
  "post:searchObject",
  apiCreateSearchObject
);

export const updateUserSearchObject = createApiActionWithArgs(
  "put:searchObject",
  apiUpdateSearchObject
);

export const deleteUserSearchObject = createApiActionWithArgs(
  "delete:searchObject",
  apiDeleteSearchObject
);

export const getDefaultSearchObject = createApiAction(
  "get:defaultSearchObject",
  apiGetDefaultSearchObject
);

export type SearchObjectConfigState = {
  searchObject: SearchObjectDomain | null;
  fetchedSearchObject: SearchObjectDomain | null;
  getStatus: ActionStatus;
  writeStatus: ActionStatus;
};

const initialState: SearchObjectConfigState = {
  searchObject: null,
  fetchedSearchObject: null,
  getStatus: "INITAL",
  writeStatus: "INITAL",
};

const searchObjectConfigStateSlice = createSlice({
  name: "searchObjectConfigState",
  initialState: initialState,
  reducers: {
    resetConfigState() {
      return initialState;
    },
    updateKeyword(state, action: PayloadAction<SearchObjectDomain["keyword"]>) {
      if (state.searchObject) {
        state.searchObject.keyword = action.payload;
      }
    },
    updateSearchData(
      state,
      action: PayloadAction<SearchObjectDomain["searchData"]>
    ) {
      if (state.searchObject) {
        state.searchObject.searchData = action.payload;
      }
    },
    updateNotificationData(
      state,
      action: PayloadAction<SearchObjectDomain["notificationData"]>
    ) {
      if (state.searchObject) {
        state.searchObject.notificationData = action.payload;
      }
    },
    updateReportData(
      state,
      action: PayloadAction<SearchObjectDomain["reportData"]>
    ) {
      if (state.searchObject) {
        state.searchObject.reportData = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserSearchObject.pending, (state, _action) => {
        state.getStatus = "PENDING";
      })
      .addCase(getUserSearchObject.fulfilled, (state, action) => {
        state.searchObject = state.fetchedSearchObject = action.payload;
        state.getStatus = "FULFILLED";
      })
      .addCase(getUserSearchObject.rejected, (state, action) => {
        state.getStatus = "REJECTED";
        logRejected("getUserSearchObject request", action);
      })
      .addCase(getDefaultSearchObject.pending, (state, _action) => {
        state.getStatus = "PENDING";
      })
      .addCase(getDefaultSearchObject.fulfilled, (state, action) => {
        state.searchObject = state.fetchedSearchObject = {
          ...action.payload,
          keyword: newLowerCase(""), // clear the keyword
        };
        state.getStatus = "FULFILLED";
      })
      .addCase(getDefaultSearchObject.rejected, (state, action) => {
        state.getStatus = "REJECTED";
        logRejected("getDefaultSearchObject request", action);
      })
      .addCase(createUserSearchObject.pending, (state, _action) => {
        state.writeStatus = "PENDING";
      })
      .addCase(createUserSearchObject.fulfilled, (state, action) => {
        state.searchObject = state.fetchedSearchObject = action.payload;
        state.writeStatus = "FULFILLED";
      })
      .addCase(createUserSearchObject.rejected, (state, action) => {
        state.writeStatus = "REJECTED";
        logRejected("createUserSearchObject request", action);
      })
      .addCase(updateUserSearchObject.pending, (state, _action) => {
        state.writeStatus = "PENDING";
      })
      .addCase(updateUserSearchObject.fulfilled, (state, action) => {
        state.searchObject = state.fetchedSearchObject = action.payload;
        state.writeStatus = "FULFILLED";
      })
      .addCase(updateUserSearchObject.rejected, (state, action) => {
        state.writeStatus = "REJECTED";
        logRejected("updateUserSearchObject request", action);
      })
      .addCase(deleteUserSearchObject.pending, (state, _action) => {
        state.writeStatus = "PENDING";
      })
      .addCase(deleteUserSearchObject.fulfilled, (state, _action) => {
        state.searchObject = state.fetchedSearchObject =
          initialState.searchObject;
        state.writeStatus = "FULFILLED";
      })
      .addCase(deleteUserSearchObject.rejected, (state, action) => {
        state.writeStatus = "REJECTED";
        logRejected("deleteUserSearchObject request", action);
      });
  },
});

export const {
  updateKeyword,
  updateSearchData,
  updateNotificationData,
  updateReportData,
  resetConfigState,
} = searchObjectConfigStateSlice.actions;
export const reducer = searchObjectConfigStateSlice.reducer;
