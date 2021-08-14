import { SearchObjectDomain } from "@backend/domain/models/userItem";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isLeft } from "fp-ts/lib/Either";
import { ActionStatus } from "src/shared/lib/reduxThunk";
import {
  apiGetSearchObject,
  apiUpdateSearchObject,
} from "../../../shared/lib/apiClient";

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

export type SearchObjectConfigState = {
  searchObject: SearchObjectDomain | null;
  getStatus: ActionStatus;
  putStatus: ActionStatus;
};

const initialState: SearchObjectConfigState = {
  searchObject: null,
  getStatus: "FULFILLED",
  putStatus: "FULFILLED",
};

const searchObjectConfigStateSlice = createSlice({
  name: "searchObjectConfigState",
  initialState: initialState,
  reducers: {
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserSearchObject.pending, (state, _action) => {
        state.getStatus = "PENDING";
      })
      .addCase(getUserSearchObject.fulfilled, (state, action) => {
        state.searchObject = action.payload;
        state.getStatus = "FULFILLED";
      })
      .addCase(updateUserSearchObject.pending, (state, _action) => {
        state.putStatus = "PENDING";
      })
      .addCase(updateUserSearchObject.fulfilled, (state, action) => {
        state.searchObject = action.payload;
        state.putStatus = "FULFILLED";
      });
  },
});

export const { updateKeyword, updateSearchData } =
  searchObjectConfigStateSlice.actions;
export const reducer = searchObjectConfigStateSlice.reducer;
