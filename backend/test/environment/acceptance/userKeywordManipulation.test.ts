import { decode, fromEither, positiveInteger } from "../../../src/lib/iots";
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
      nofSearchObjects: fromEither(decode(positiveInteger, 1)),
    });
    testUserB = await createTestUser({
      nofSearchObjects: fromEither(decode(positiveInteger, 1)),
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

  it("both users add the same keyword", async () => {
    await checkKeyword({
      keyword: theKeyword,
      socialMedia: "twitter",
      status: "ACTIVE",
      exists: false,
    });

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
  it.todo("activate and deactivate that keyword");
  it.todo("one user changes keyword");
  it.todo("one user is deleted");

  afterAll(async () => {
    await deleteUser(testUserA);
    await deleteUser(testUserB);
    await deleteKeyword(theKeyword);
    await deleteKeyword(anotherKeyword);
  });
});
