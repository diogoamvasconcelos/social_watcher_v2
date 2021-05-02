import React, { useEffect } from "react";
import { getUserDetails } from "../../shared/reducers/userState";
import { useAppDispatch, useAppSelector } from "../../shared/store";
import { JSONViewer } from "../../shared/components/JSONViewer";
import { Typography } from "antd";

const { Title } = Typography;

export const UserPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.details);

  useEffect(() => {
    void dispatch(getUserDetails());
  }, []);

  return (
    <div>
      <Title level={4}>User</Title>
      {<JSONViewer name="user" json={user} />}
    </div>
  );
};
