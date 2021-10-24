/* eslint-disable @typescript-eslint/no-explicit-any */
import { lambdaHandler } from "@src/handlers/searchers/dispatchSearchJobsHandler";

// scripts/with_env.js yarn ts-node scripts/run_handlers/dispatchSearchJobs.ts
export const main = async () => {
  try {
    const result = await lambdaHandler({} as any, {} as any, {} as any);
    console.log("Successfully executed Lambda Handler, response:", result);
  } catch (e) {
    console.log("Error executing Lambda Handler:", e);
  }
};

// void main();
