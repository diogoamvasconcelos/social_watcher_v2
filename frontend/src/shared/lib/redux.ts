/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Either, isLeft } from "fp-ts/lib/Either";

// TODO: have a single createApiAction fn
// I tried this but I failed because of the createAsyncThunk "ThunkArg" type needing to be void
export const createApiActionWithArgs = <L, R>(
  apiFnName: string,
  apiFn: (...args: any) => Promise<Either<L, R>>
) =>
  createAsyncThunk<R, Parameters<typeof apiFn>, { rejectValue: L }>(
    apiFnName,
    async (args, { rejectWithValue }) => {
      const res = await apiFn(...args);
      if (isLeft(res)) {
        return rejectWithValue(res.left);
      }
      return res.right;
    }
  );

export const createApiAction = <L, R>(
  apiFnName: string,
  apiFn: () => Promise<Either<L, R>>
) =>
  createAsyncThunk<R, void, { rejectValue: L }>(
    apiFnName,
    async (_, { rejectWithValue }) => {
      const res = await apiFn();
      if (isLeft(res)) {
        return rejectWithValue(res.left);
      }
      return res.right;
    }
  );
