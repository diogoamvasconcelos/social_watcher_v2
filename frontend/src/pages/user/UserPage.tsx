import React from "react";
import { getUser } from "../../shared/reducers/userState";
import { useAppDispatch, useAppSelector } from "../../shared/store";

export const UserPage: React.FC = () => {
  const dispatch = useAppDispatch();

  dispatch(getUser);
  const user = useAppSelector((state) => state.user);

  console.log(user);

  return <p> ${`User: ${JSON.stringify(user)}`} </p>;
};
