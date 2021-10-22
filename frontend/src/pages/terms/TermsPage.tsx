import React from "react";
import termsRaw from "../../../assets/terms_and_conditions.html";
import { HTMLComponent } from "./shared";

export const TermsPage: React.FC = () => {
  return <HTMLComponent rawHtml={termsRaw} />;
};
