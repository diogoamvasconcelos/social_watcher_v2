import Button from "antd/lib/button";
import Typography from "antd/lib/typography";
import React from "react";
import { gotoCognitoSignup } from "../../shared/components/Navbar";

const { Title } = Typography;

export const SignupPage: React.FC = () => {
  const handleSignupClicked = () => {
    gotoCognitoSignup();
  };

  return (
    <>
      <Title>Create a free 10-day trial</Title>
      <Button type="primary" onClick={handleSignupClicked}>
        Sign up
      </Button>
    </>
  );
};
