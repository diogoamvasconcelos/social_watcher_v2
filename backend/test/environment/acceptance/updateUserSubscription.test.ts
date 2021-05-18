import { newPositiveInteger } from "@shared/lib/src//lib/iots";
import { Awaited } from "../../../src/lib/types";
import { uuid } from "../../../src/lib/uuid";
import {
  checkKeyword,
  createTestUser,
  deleteKeyword,
  deleteUser,
  getIdToken,
  updateKeyword,
  updateUserSubscription,
} from "./steps";

describe("changes to user subscription", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let userToken: string;

  const firstKeyword = uuid();
  const secondKeyword = uuid();

  beforeAll(async () => {
    jest.setTimeout(45000);

    testUser = await createTestUser({
      nofSearchObjects: newPositiveInteger(2),
    });

    userToken = await getIdToken({
      username: testUser.email,
      password: testUser.password,
    });
  });

  afterAll(async () => {
    await deleteUser(testUser);
    await deleteKeyword(firstKeyword);
    await deleteKeyword(secondKeyword);
  });

  it("changing nofSearchObjects", async () => {
    // Intial state: keywords doesn't exist
    await checkKeyword({
      keyword: firstKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: false,
    });
    await checkKeyword({
      keyword: secondKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: false,
    });

    // user adds keywords
    await updateKeyword({
      token: userToken,
      keyword: firstKeyword,
      index: 0,
      twitterStatus: "ENABLED",
    });
    await updateKeyword({
      token: userToken,
      keyword: secondKeyword,
      index: 1,
      twitterStatus: "ENABLED",
    });

    await checkKeyword({
      keyword: firstKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: true,
    });
    await checkKeyword({
      keyword: secondKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: true,
    });

    // Reduced nofSearchObjects
    await updateUserSubscription({
      userId: testUser.id,
      updatedData: { nofSearchObjects: newPositiveInteger(1) },
    });

    await checkKeyword({
      keyword: firstKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: true,
    });
    await checkKeyword({
      keyword: secondKeyword,
      socialMedia: "twitter",
      status: "INACTIVE",
      exists: true,
    });

    // Increase nofSearchObjects
    await updateUserSubscription({
      userId: testUser.id,
      updatedData: { nofSearchObjects: newPositiveInteger(5) },
    });

    await checkKeyword({
      keyword: firstKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: true,
    });
    await checkKeyword({
      keyword: secondKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: true,
    });
  });
});
