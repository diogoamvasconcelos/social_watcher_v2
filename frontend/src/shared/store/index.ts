import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { reducer as userAuthStateReducer } from "../reducers/userAuthState";
import { reducer as userStateReducer } from "../reducers/userState";
import { reducer as searchStateReducer } from "../../pages/dashboard/searchState";

// refs
// - https://redux.js.org/recipes/usage-with-typescript
// - https://redux-toolkit.js.org/usage/usage-guide
// - async: https://redux-toolkit.js.org/api/createAsyncThunk

export const store = configureStore({
  reducer: {
    userAuth: userAuthStateReducer,
    user: userStateReducer,
    search: searchStateReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
