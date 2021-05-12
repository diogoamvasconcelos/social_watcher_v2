import { SQSEvent } from "aws-lambda";
import {
  discordNotificationJobCodec,
  DiscordNotificatonJob,
} from "../../domain/models/notificationJob";
import { decode, fromEither } from "../../lib/iots";
import { getLogger } from "../../lib/logger";
import { defaultMiddlewareStack } from "../middlewares/common";

//const config = getConfig();
const logger = getLogger();

const handler = async (event: SQSEvent) => {
  const discordNotifyJobs: DiscordNotificatonJob[] = event.Records.map(
    (record) => {
      return fromEither(
        decode(discordNotificationJobCodec, JSON.parse(record.body))
      );
    }
  );

  logger.info("got discordNotifyJobs", { discordNotifyJobs });
};
export const lambdaHandler = defaultMiddlewareStack(handler);
