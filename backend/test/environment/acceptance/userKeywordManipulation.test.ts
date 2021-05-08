import { newPositiveInteger } from "../../../src/lib/iots";
import { Awaited } from "../../../src/lib/types";
import { uuid } from "../../../src/lib/uuid";
import {
  checkKeyword,
  createTestUser,
  deleteKeyword,
  deleteUser,
  getIdToken,
  updateKeyword,
} from "./steps";

describe("keyword interaction between multiple users", () => {
  let testUserA: Awaited<ReturnType<typeof createTestUser>>;
  let testUserB: Awaited<ReturnType<typeof createTestUser>>;
  let userAToken: string;
  let userBToken: string;

  const theKeyword = uuid();
  const anotherKeyword = uuid();

  beforeAll(async () => {
    jest.setTimeout(45000);

    testUserA = await createTestUser({
      nofSearchObjects: newPositiveInteger(1),
    });
    testUserB = await createTestUser({
      nofSearchObjects: newPositiveInteger(1),
    });

    userAToken = await getIdToken({
      username: testUserA.email,
      password: testUserA.password,
    });
    userBToken = await getIdToken({
      username: testUserB.email,
      password: testUserB.password,
    });
  });

  afterAll(async () => {
    await deleteUser(testUserA);
    await deleteUser(testUserB);
    await deleteKeyword(theKeyword);
    await deleteKeyword(anotherKeyword);
  });

  it("both users add the same keyword", async () => {
    // Intial state: keyword doesn't exist
    await checkKeyword({
      keyword: theKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: false,
    });

    // userA adds disabled keyword
    await updateKeyword({
      token: userAToken,
      keyword: theKeyword,
      index: 0,
      twitterStatus: "DISABLED",
    });

    await checkKeyword({
      keyword: theKeyword,
      socialMedia: "twitter",
      status: "INACTIVE",
      exists: false,
    });

    // userB adds enabled keyword
    await updateKeyword({
      token: userBToken,
      keyword: theKeyword,
      index: 0,
      twitterStatus: "ENABLED",
    });

    await checkKeyword({
      keyword: theKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: true,
    });
  });

  it("activate and deactivate that keyword", async () => {
    // Initial state: userA and userB enabled keyword
    await updateKeyword({
      token: userAToken,
      keyword: theKeyword,
      index: 0,
      twitterStatus: "ENABLED",
    });
    await updateKeyword({
      token: userBToken,
      keyword: theKeyword,
      index: 0,
      twitterStatus: "ENABLED",
    });

    await checkKeyword({
      keyword: theKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: true,
    });

    // userA disables
    await updateKeyword({
      token: userAToken,
      keyword: theKeyword,
      index: 0,
      twitterStatus: "DISABLED",
    });

    await checkKeyword({
      keyword: theKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: true,
    });

    // userB disables
    await updateKeyword({
      token: userBToken,
      keyword: theKeyword,
      index: 0,
      twitterStatus: "DISABLED",
    });

    await checkKeyword({
      keyword: theKeyword,
      socialMedia: "twitter",
      status: "INACTIVE",
      exists: true,
    });

    // userA enables
    await updateKeyword({
      token: userAToken,
      keyword: theKeyword,
      index: 0,
      twitterStatus: "ENABLED",
    });

    await checkKeyword({
      keyword: theKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: true,
    });
  });

  it("one user changes keyword", async () => {
    // Initial state: both users enable keyword
    await updateKeyword({
      token: userAToken,
      keyword: theKeyword,
      index: 0,
      twitterStatus: "ENABLED",
    });
    await updateKeyword({
      token: userBToken,
      keyword: theKeyword,
      index: 0,
      twitterStatus: "ENABLED",
    });

    // userA changes to another keyword (still enabled)
    await updateKeyword({
      token: userAToken,
      keyword: anotherKeyword,
      index: 0,
      twitterStatus: "ENABLED",
    });

    await checkKeyword({
      keyword: theKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: true,
    });
    await checkKeyword({
      keyword: anotherKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: true,
    });

    // userB changes to another keyword too
    await updateKeyword({
      token: userBToken,
      keyword: anotherKeyword,
      index: 0,
      twitterStatus: "ENABLED",
    });

    await checkKeyword({
      keyword: theKeyword,
      socialMedia: "twitter",
      status: "INACTIVE",
      exists: true,
    });
    await checkKeyword({
      keyword: anotherKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: true,
    });
  });

  it("one user is deleted", async () => {
    // Initial state:  another keyword is active
    await checkKeyword({
      keyword: anotherKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: true,
    });

    // Delete userA
    await deleteUser(testUserA);

    await checkKeyword({
      keyword: anotherKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: true,
    });

    // Delete userB
    await deleteUser(testUserB);

    await checkKeyword({
      keyword: anotherKeyword,
      socialMedia: "twitter",
      status: "INACTIVE",
      exists: true,
    });
  });
});
