import { JsonObjectEncodable } from "@diogovasconcelos/lib/models/jsonEncodable";
import React from "react";
import ReactJson from "react-json-view";
import { gruvBoxDarkHardBase16, gruvBoxLightHardBase16 } from "./base16Themes";

type JSONViewerProps = {
  json?: JsonObjectEncodable;
  [x: string]: unknown; //rest
};

export const JSONViewer: React.FC<JSONViewerProps> = ({ json, ...rest }) => {
  const { darkMode } = { darkMode: true }; // TODO
  return (
    <ReactJson
      style={{
        fontSize: "0.8em",
        borderRadius: "5px",
        border: "1px solid",
        borderColor: "grey",
        padding: "15px",
      }}
      src={json ?? {}}
      name="JSON"
      theme={darkMode ? gruvBoxDarkHardBase16 : gruvBoxLightHardBase16}
      sortKeys={true}
      indentWidth={4}
      displayObjectSize={false}
      displayDataTypes={false}
      {...rest}
    />
  );
};
