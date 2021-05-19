import * as t from "io-ts";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import { decode, fromEither, positiveInteger } from "@shared/lib/src/iots";

export const subscriptionConfigCodec = t.type({
  trial: t.type({
    nofSearchWords: positiveInteger,
    durationInDays: positiveInteger,
  }),
});
export type SubscriptionConfig = t.TypeOf<typeof subscriptionConfigCodec>;

export const getSubscriptionConfig = (
  configFile: string = "../../../config/subscription.yaml"
): SubscriptionConfig => {
  return fromEither(
    decode(
      subscriptionConfigCodec,
      yaml.load(fs.readFileSync(path.join(__dirname, configFile)).toString())
    )
  );
};
