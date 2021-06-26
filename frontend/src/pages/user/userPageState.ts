import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isLeft } from "fp-ts/lib/Either";
import { CreatePaymentsPortalResponse } from "@backend/handlers/api/models/createPaymentsPortal";
import { apiCreatePaymentsPortal } from "../../shared/lib/apiClient";

export const createPaymentPortal = createAsyncThunk(
  "post:user/payments/create-portal",
  async (
    args: Parameters<typeof apiCreatePaymentsPortal>,
    { rejectWithValue }
  ) => {
    const res = await apiCreatePaymentsPortal(...args);
    if (isLeft(res)) {
      return rejectWithValue(res.left);
    }
    return res.right;
  }
);

export type UserPageState = CreatePaymentsPortalResponse;

const initialState: UserPageState = {
  sessionUrl: "",
};
const searchStateSlice = createSlice({
  name: "searchState",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(createPaymentPortal.fulfilled, (state, action) => {
      state = action.payload;
      return state; //need to do this not sure why...
    });
  },
});

export const reducer = searchStateSlice.reducer;
