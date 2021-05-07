import { newPositiveInteger } from "../../src/lib/iots";
import { getLogger } from "../../src/lib/logger";
import { createTestUser } from "../environment/acceptance/steps";

const logger = getLogger();

const createUser = async () => {
  const user = await createTestUser({
    nofSearchObjects: newPositiveInteger(1),
  });

  logger.info("User created", { user });
};

export const main = async () => {
  await createUser();
};

//void main();
