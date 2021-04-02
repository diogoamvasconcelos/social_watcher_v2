import { fromEither } from "../../../src/lib/iots";
import { Awaited } from "../../../src/lib/types";
import { createTestUser, deleteUser, getUser } from "./steps";

describe("signup e2e test", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeAll(async () => {
    testUser = await createTestUser();
  });

  it("created user in users table", async () => {
    const userData = fromEither(await getUser(testUser.id));
    expect(userData).toEqual(expect.objectContaining(testUser));
  });

  it("token can be used to access API", async () => {
    // TODO!
    expect(true).toBeTrue;
  });

  afterAll(async () => {
    await deleteUser(testUser);
  });
});
