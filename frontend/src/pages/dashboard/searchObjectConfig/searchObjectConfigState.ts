import { SearchObjectDomain } from "@backend/domain/models/userItem";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isLeft } from "fp-ts/lib/Either";
import { ActionStatus } from "../../../shared/lib/reduxThunk";
import {
  apiCreateSearchObject,
  apiDeleteSearchObject,
  apiGetSearchObject,
  apiUpdateSearchObject,
  apiGetDefaultSearchObject,
} from "../../../shared/lib/apiClient";
import { newLowerCase } from "@diogovasconcelos/lib/iots";

export const getUserSearchObject = createAsyncThunk(
  "get:searchObject",
  async (args: Parameters<typeof apiGetSearchObject>, { rejectWithValue }) => {
    const res = await apiGetSearchObject(...args);
    if (isLeft(res)) {
      return rejectWithValue(res.left);
    }
    return res.right;
  }
);

export const createUserSearchObject = createAsyncThunk(
  "post:searchObject",
  async (
    args: Parameters<typeof apiCreateSearchObject>,
    { rejectWithValue }
  ) => {
    const res = await apiCreateSearchObject(...args);
    if (isLeft(res)) {
      return rejectWithValue(res.left);
    }
    return res.right;
  }
);

export const updateUserSearchObject = createAsyncThunk(
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

export const deleteUserSearchObject = createAsyncThunk(
  "delete:searchObject",
  async (
    args: Parameters<typeof apiDeleteSearchObject>,
    { rejectWithValue }
  ) => {
    const res = await apiDeleteSearchObject(...args);
    if (isLeft(res)) {
      return rejectWithValue(res.left);
    }
    return res.right;
  }
);

export const getDefaultSearchObject = createAsyncThunk(
  "get:defaultSearchObject",
  async (_, { rejectWithValue }) => {
    const res = await apiGetDefaultSearchObject();
    if (isLeft(res)) {
      return rejectWithValue(res.left);
    }
    return res.right;
  }
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
      .addCase(getUserSearchObject.rejected, (state, _action) => {
        state.getStatus = "REJECTED";
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
      .addCase(getDefaultSearchObject.rejected, (state, _action) => {
        state.getStatus = "REJECTED";
      })
      .addCase(createUserSearchObject.pending, (state, _action) => {
        state.writeStatus = "PENDING";
      })
      .addCase(createUserSearchObject.fulfilled, (state, action) => {
        state.searchObject = state.fetchedSearchObject = action.payload;
        state.writeStatus = "FULFILLED";
      })
      .addCase(createUserSearchObject.rejected, (state, _action) => {
        state.writeStatus = "REJECTED";
      })
      .addCase(updateUserSearchObject.pending, (state, _action) => {
        state.writeStatus = "PENDING";
      })
      .addCase(updateUserSearchObject.fulfilled, (state, action) => {
        state.searchObject = state.fetchedSearchObject = action.payload;
        state.writeStatus = "FULFILLED";
      })
      .addCase(updateUserSearchObject.rejected, (state, _action) => {
        state.writeStatus = "REJECTED";
      })
      .addCase(deleteUserSearchObject.pending, (state, _action) => {
        state.writeStatus = "PENDING";
      })
      .addCase(deleteUserSearchObject.fulfilled, (state, _action) => {
        state.searchObject = state.fetchedSearchObject =
          initialState.searchObject;
        state.writeStatus = "FULFILLED";
      })
      .addCase(deleteUserSearchObject.rejected, (state, _action) => {
        state.writeStatus = "REJECTED";
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
