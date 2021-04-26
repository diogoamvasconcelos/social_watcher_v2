import React, { useEffect } from "react";
import { getUser } from "../../shared/reducers/userState";
import { useAppDispatch, useAppSelector } from "../../shared/store";
import { Button } from "antd";

export const UserPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    void dispatch(getUser());
  }, []);

  return (
    <div>
      <Button type="default" onClick={() => dispatch(getUser())}>
        get user
      </Button>
      <p> ${`User: ${JSON.stringify(user)}`} </p>);
    </div>
  );
};
