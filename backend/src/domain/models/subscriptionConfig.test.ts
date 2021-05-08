import { getSubscriptionConfig } from "./subscriptionConfig";

describe("models/subscriptionConfig", () => {
  it("can load the config", () => {
    const configurationConfig = getSubscriptionConfig();
    expect(configurationConfig.trial).toEqual(expect.anything());
  });
});
