import * as t from "io-ts";

export const discordCredentialsCodec = t.type({
  token: t.string,
});
export type DiscordCredentials = t.TypeOf<typeof discordCredentialsCodec>;
