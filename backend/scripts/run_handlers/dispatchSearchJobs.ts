import { lambdaHandler } from "../../src/handlers/dispatchSearchJobs";

const main = async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await lambdaHandler({} as any, {} as any, {} as any);
    console.log("Successfully executed Lambda Handler, response:", result);
  } catch (e) {
    console.log("Error executing Lambda Handler:", e);
  }
};

void main();
