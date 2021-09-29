import {
  newPositiveInteger,
  PositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { Awaited } from "@src/lib/types";
import { uuid } from "@src/lib/uuid";
import {
  checkKeyword,
  createTestUser,
  createUserSearchObject,
  deleteKeyword,
  deleteUser,
  getIdToken,
  updateUserSearchObject,
} from "./steps";

jest.setTimeout(45000);

describe("keyword interaction between multiple users", () => {
  let testUserA: Awaited<ReturnType<typeof createTestUser>>;
  let testUserB: Awaited<ReturnType<typeof createTestUser>>;
  let userAToken: string;
  let userBToken: string;
  let indexUserA: PositiveInteger;
  let indexUserB: PositiveInteger;

  const theKeyword = uuid();
  const anotherKeyword = uuid();

  beforeAll(async () => {
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
    indexUserA = (
      await createUserSearchObject({
        token: userAToken,
        keyword: theKeyword,
        twitterStatus: "DISABLED",
      })
    ).index;

    await checkKeyword({
      keyword: theKeyword,
      socialMedia: "twitter",
      status: "INACTIVE",
      exists: false,
    });

    // userB adds enabled keyword
    indexUserB = (
      await createUserSearchObject({
        token: userBToken,
        keyword: theKeyword,
        twitterStatus: "ENABLED",
      })
    ).index;

    await checkKeyword({
      keyword: theKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: true,
    });
  });

  it("activate and deactivate that keyword", async () => {
    // Initial state: userA and userB enabled keyword
    await updateUserSearchObject({
      token: userAToken,
      keyword: theKeyword,
      index: indexUserA,
      twitterStatus: "ENABLED",
    });
    await updateUserSearchObject({
      token: userBToken,
      keyword: theKeyword,
      index: indexUserB,
      twitterStatus: "ENABLED",
    });

    await checkKeyword({
      keyword: theKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: true,
    });

    // userA disables
    await updateUserSearchObject({
      token: userAToken,
      keyword: theKeyword,
      index: indexUserA,
      twitterStatus: "DISABLED",
    });

    await checkKeyword({
      keyword: theKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: true,
    });

    // userB disables
    await updateUserSearchObject({
      token: userBToken,
      keyword: theKeyword,
      index: indexUserB,
      twitterStatus: "DISABLED",
    });

    await checkKeyword({
      keyword: theKeyword,
      socialMedia: "twitter",
      status: "INACTIVE",
      exists: true,
    });

    // userA enables
    await updateUserSearchObject({
      token: userAToken,
      keyword: theKeyword,
      index: indexUserA,
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
    await updateUserSearchObject({
      token: userAToken,
      keyword: theKeyword,
      index: indexUserA,
      twitterStatus: "ENABLED",
    });
    await updateUserSearchObject({
      token: userBToken,
      keyword: theKeyword,
      index: indexUserB,
      twitterStatus: "ENABLED",
    });

    // userA changes to another keyword (still enabled)
    await updateUserSearchObject({
      token: userAToken,
      keyword: anotherKeyword,
      index: indexUserA,
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
    await updateUserSearchObject({
      token: userBToken,
      keyword: anotherKeyword,
      index: indexUserB,
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
