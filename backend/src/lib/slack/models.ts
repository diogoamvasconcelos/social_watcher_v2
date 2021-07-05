import * as t from "io-ts";

export const slackCredentialsCodec = t.type({
  token: t.string,
});
export type SlackCredentials = t.TypeOf<typeof slackCredentialsCodec>;
