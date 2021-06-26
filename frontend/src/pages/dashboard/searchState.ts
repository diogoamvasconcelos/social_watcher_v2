import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isLeft } from "fp-ts/lib/Either";
import { SearchResponse } from "@backend/handlers/api/models/search";
import { newPositiveInteger } from "@diogovasconcelos/lib";
import { apiSearch } from "../../shared/lib/apiClient";

export const searchKeyword = createAsyncThunk(
  "search",
  async (args: Parameters<typeof apiSearch>, { rejectWithValue }) => {
    const res = await apiSearch(...args);
    if (isLeft(res)) {
      return rejectWithValue(res.left);
    }
    return res.right;
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
      state = action.payload;
      return state; //need to do this not sure why...
    });
  },
});

export const reducer = searchStateSlice.reducer;
