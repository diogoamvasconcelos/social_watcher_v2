import * as t from "io-ts";
import {
  decode,
  fromEither,
  positiveInteger,
} from "@diogovasconcelos/lib/iots";
import subscriptionConfig from "@config/subscription";

export const subscriptionConfigCodec = t.type({
  trial: t.type({
    nofSearchWords: positiveInteger,
    durationInDays: positiveInteger,
  }),
});
export type SubscriptionConfig = t.TypeOf<typeof subscriptionConfigCodec>;

export const getSubscriptionConfig = (): SubscriptionConfig => {
  return fromEither(decode(subscriptionConfigCodec, subscriptionConfig));
};
