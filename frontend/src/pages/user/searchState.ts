import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isLeft } from "fp-ts/lib/Either";
import { SearchResponse } from "../../../../backend/src/handlers/api/models/search";
import { newPositiveInteger } from "../../../../backend/src/lib/iots";
import { apiSearch } from "../../shared/lib/apiClient";

export const searchKeyword = createAsyncThunk(
  "search",
  async (...args: Parameters<typeof apiSearch>) => {
    return await apiSearch(...args);
  }
);

export type SearchState = SearchResponse;

const initialState: SearchState = {
  items: [],
  pagination: {
    limit: newPositiveInteger(50),
    offset: newPositiveInteger(0),
    total: newPositiveInteger(0),
    count: newPositiveInteger(0),
  },
};
const searchStateSlice = createSlice({
  name: "searchState",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(searchKeyword.fulfilled, (state, action) => {
      if (isLeft(action.payload)) {
        state = initialState;
        return;
      }
      state = action.payload.right;
      return state; //need to do this not sure why...
    });
  },
});

export const reducer = searchStateSlice.reducer;
