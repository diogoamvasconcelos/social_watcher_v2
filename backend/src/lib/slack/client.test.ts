import { postMessage, Client } from "./client";
import { getLogger } from "@src/lib/logger";
import { isRight, left } from "fp-ts/lib/Either";

const logger = getLogger();

describe("postSlackMessage", () => {
  it("sends message to test channel", async () => {
    const slackClient = {
      chat: {
        postMessage: jest.fn().mockResolvedValue({ ok: true }),
      },
    } as unknown as Client;

    const args = {
      channel: "cbpf-errands-boa-test",
      text: "This is a unit test!",
    };

    const res = await postMessage({ logger, client: slackClient }, args);

    expect(isRight(res)).toBeTruthy();
    expect(slackClient.chat.postMessage).toHaveBeenCalledWith(args);
  });

  it("throws error when the API returns ok = false", async () => {
    const slackClient = {
      chat: {
        postMessage: jest.fn().mockResolvedValue({ ok: undefined }),
      },
    } as unknown as Client;

    const args = {
      channel: "cbpf-errands-boa-test",
      text: "This is a unit test!",
    };

    const res = await postMessage({ logger, client: slackClient }, args);

    expect(res).toEqual(left("ERROR"));
  });

  it("throws SlackPostMessageError when the API returns an error value", async () => {
    const slackClient = {
      chat: {
        postMessage: jest
          .fn()
          .mockResolvedValue({ ok: true, error: jest.fn() }),
      },
    } as unknown as Client;

    const args = {
      channel: "cbpf-errands-boa-test",
      text: "This is a unit test!",
    };

    const res = await postMessage({ logger, client: slackClient }, args);

    expect(res).toEqual(left("ERROR"));
  });

  it("catches rejected promises", async () => {
    const slackClient = {
      chat: {
        postMessage: jest.fn().mockRejectedValue("error"),
      },
    } as unknown as Client;

    const args = {
      channel: "cbpf-errands-boa-test",
      text: "This is a unit test!",
    };

    const res = await postMessage({ logger, client: slackClient }, args);

    expect(res).toEqual(left("ERROR"));
  });
});
