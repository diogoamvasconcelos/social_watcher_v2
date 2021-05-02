import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { JSONViewer } from "./JSONViewer";

describe("JSONViewer", () => {
  it("can handle empty object", () => {
    render(
      <div data-testid="test">
        {/*data-testid needs to be here beuse JSONViewer doesn't propagate it*/}
        <JSONViewer />
      </div>
    );
    expect(screen.getByTestId("test")).toContainHTML(`class="react-json-view"`);
  });

  it("can render a JSON object", () => {
    const jsonObject = { strange_key: "nice data" };

    render(
      <div data-testid="test">
        <JSONViewer json={jsonObject} />
      </div>
    );
    expect(screen.getByTestId("test")).toHaveTextContent(
      `"strange_key":"nice data`
    );
  });
});
