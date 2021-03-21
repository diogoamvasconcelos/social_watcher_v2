import { SQSEvent, SQSHandler } from "aws-lambda";

const handler = async (event: SQSEvent) => {
  console.log(`Recieved ${event.Records.length} twitter search jobs`);
};

export const lambdaHandler: SQSHandler = async (event: SQSEvent) => {
  await handler(event);
};
