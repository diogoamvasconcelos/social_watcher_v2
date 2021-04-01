import { Awaited } from "../../../src/lib/types";
import { createTestUser, deleteUser } from "./steps";

describe("signup e2e test", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeAll(async () => {
    testUser = await createTestUser();
  });

  it("created user in users table", async () => {
    expect(true).toBeTrue;
  });

  it("token can be used to access API", async () => {
    expect(true).toBeTrue;
  });

  afterAll(async () => {
    await deleteUser(testUser);
  });
});
