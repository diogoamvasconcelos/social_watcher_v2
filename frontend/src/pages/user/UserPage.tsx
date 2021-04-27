import React, { useEffect } from "react";
import {
  getUserDetails,
  getUserSearchObjects,
} from "../../shared/reducers/userState";
import { useAppDispatch, useAppSelector } from "../../shared/store";
import { JSONViewer } from "../../shared/components/JSONViewer";
import { Typography } from "antd";

const { Title } = Typography;

export const UserPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.details);
  const searchObjects = useAppSelector((state) => state.user.searchObjects);

  useEffect(() => {
    void dispatch(getUserDetails());
    void dispatch(getUserSearchObjects());
  }, []);

  return (
    <div>
      <div>
        <Title level={4}>User</Title>
        <JSONViewer name="user" json={user} />
      </div>
      <div>
        <Title level={4}>Keywords</Title>
        <JSONViewer name="keywords" json={{ items: searchObjects }} />
      </div>
    </div>
  );
};
