## Mock just a function from a module

```
import { apiGetUser } from "./shared";

jest.mock("./shared", () => ({
  ...jest.requireActual("./shared"), // imports all actual implmentations (useful to only mock one export of a module)
  apiGetUser: jest.fn(),
}));
const apiGetUserdMock = apiGetUser as jest.MockedFunction<typeof apiGetUser>;

describe("something", () => {
  beforeEach(() => {
    apiGetUserdMock.mockReset();
  });

  it("tests", () => {
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));
  })
```

Or a simpler

```
import * as stripeClient from "../../lib/stripe/client";

describe("something", () => {
 beforeEach(() => {
   apiGetUserdMock.mockReset();
 });

 it("tests", () => {
   jest
     .spyOn(stripeClient, "verifyWebhookEvent")
     .mockReturnValueOnce(right(JSON.parse(eventBody)));
```

## Mock logger and check logged messages

```
import * as logger from "../../lib/logger";
import { loggerMock } from "../../../test/lib/mocks";

jest.spyOn(logger, "getLogger").mockReturnValue(loggerMock)

describe("something", () => {
  it("tests", () => {

    expect(loggerMock.error).toHaveBeenCalledWith(
        "stripe::customers.retrieve retrieved a deleted user",
        expect.anything()
      );
```
