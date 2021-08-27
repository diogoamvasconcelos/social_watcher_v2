/* eslint-disable @typescript-eslint/no-explicit-any */
import { lambdaHandler } from "@src/handlers/searchers/searchTwitterHandler";

// scripts/with_env.js yarn ts-node scripts/run_handlers/searchTwitter.ts
const main = async () => {
  try {
    const result = await lambdaHandler(
      {
        Records: [
          {
            messageId: "918fbc9c-ba87-44ef-8c90-351630ce4526",
            body: '{"socialMedia":"twitter","keyword":"diogo vasconcelos"}',
          },
        ],
      } as any,
      {} as any,
      {} as any
    );
    console.log("Successfully executed Lambda Handler, response:", result);
  } catch (e) {
    console.log("Error executing Lambda Handler:", e);
  }
};

void main();
