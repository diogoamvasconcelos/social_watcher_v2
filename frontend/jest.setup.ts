// add all jest-extended matchers
// @ts-expect-error
import * as jestExtendedMatchers from "jest-extended";
expect.extend(jestExtendedMatchers);

import "@testing-library/jest-dom";
// import * as jestDomExtendedMatchers from "@testing-library/jest-dom/extend-expect";
// expect.extend(jestDomExtendedMatchers);
