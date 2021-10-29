import { createSlice } from "@reduxjs/toolkit";
import { CreatePaymentsPortalResponse } from "@backend/handlers/api/models/createPaymentsPortal";
import { apiCreatePaymentsPortal } from "../../shared/lib/apiClient";
import { createApiActionWithArgs } from "@src/shared/lib/redux";

export const createPaymentPortal = createApiActionWithArgs(
  "post:user/payments/create-portal",
  apiCreatePaymentsPortal
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
