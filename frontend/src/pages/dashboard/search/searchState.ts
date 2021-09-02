import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isLeft } from "fp-ts/lib/Either";
import { SearchResponse } from "@backend/handlers/api/models/search";
import { newPositiveInteger } from "@diogovasconcelos/lib";
import { apiSearch } from "../../../shared/lib/apiClient";
import { ActionStatus } from "@src/shared/lib/reduxThunk";

export type SearchRequestData = Parameters<typeof apiSearch>[0];

export const searchKeyword = createAsyncThunk(
  "search",
  async (arg: SearchRequestData, { rejectWithValue }) => {
    const res = await apiSearch(arg);
    if (isLeft(res)) {
      return rejectWithValue(res.left);
    }
    return res.right;
  }
);

export type SearchState = SearchResponse & { status: ActionStatus };

const initialState: SearchState = {
  items: [],
  pagination: {
    limit: newPositiveInteger(0),
    offset: newPositiveInteger(0),
    total: newPositiveInteger(0),
    count: newPositiveInteger(0),
  },
  status: "INITAL",
};
const searchStateSlice = createSlice({
  name: "searchState",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(searchKeyword.fulfilled, (state, action) => {
        return { ...state, ...action.payload, status: "FULFILLED" };
      })
      .addCase(searchKeyword.rejected, (state, action) => {
        state.status = "REJECTED";
        console.log(
          `Rejected searchKeyword request: ${JSON.stringify(action)}`
        );
      })
      .addCase(searchKeyword.pending, (state, _action) => {
        state.status = "PENDING";
      });
  },
});

export const reducer = searchStateSlice.reducer;
