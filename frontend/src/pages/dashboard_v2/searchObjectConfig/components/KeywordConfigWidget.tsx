import React from "react";
import { ConfigWidgetProps } from "../SearchObjectConfigPage";
import Text from "antd/lib/typography/Text";

export const KeywordConfigWidget: React.FC<ConfigWidgetProps> = ({
  setStepState,
}) => {
  const keyword = "lala";

  const handleKeywordChanged = (val: string) => {
    if (val.length > 0) {
      setStepState({ status: "finish", errorMessage: undefined });
    } else {
      setStepState({ status: "error", errorMessage: "keyword must be valid" });
    }
  };

  return (
    <Text strong={true} editable={{ onChange: handleKeywordChanged }}>
      {keyword}
    </Text>
  );
};
