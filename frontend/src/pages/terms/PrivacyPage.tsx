import React from "react";
import privacyRaw from "../../../assets/privacy_policy.html";
import { HTMLComponent } from "./shared";

export const PrivacyPage: React.FC = () => {
  return <HTMLComponent rawHtml={privacyRaw} />;
};
