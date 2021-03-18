const handler = async (event: unknown) => {
  console.log(event);
};

export const lambdaHandler = async (event: any, context: any) => {
  handler(event);
};
