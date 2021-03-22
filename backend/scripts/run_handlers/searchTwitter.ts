/* eslint-disable @typescript-eslint/no-explicit-any */
import { lambdaHandler } from "../../src/handlers/searchTwitter";

// scripts/with_env_vars.sh npx ts-node scripts/run_handlers/searchTwitter.ts
const main = async () => {
  try {
    const result = await lambdaHandler(
      { Records: [1] } as any,
      {} as any,
      {} as any
    );
    console.log("Successfully executed Lambda Handler, response:", result);
  } catch (e) {
    console.log("Error executing Lambda Handler:", e);
  }
};

void main();
