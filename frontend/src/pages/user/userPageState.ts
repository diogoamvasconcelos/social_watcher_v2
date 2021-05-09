import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isLeft } from "fp-ts/lib/Either";
import { CreatePaymentsPortalResponse } from "../../../../backend/src/handlers/api/models/createPaymentsPortal";
import { apiCreatePaymentsPortal } from "../../shared/lib/apiClient";

export const createPaymentPortal = createAsyncThunk(
  "post:user/payments/create-portal",
  async (...args: Parameters<typeof apiCreatePaymentsPortal>) => {
    return await apiCreatePaymentsPortal(...args);
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
