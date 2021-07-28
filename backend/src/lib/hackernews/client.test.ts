import { fromEither, newDateISOString } from "@diogovasconcelos/lib/iots";
import { getLogger } from "../logger";
import { Client, search } from "./client";
import { GetItemHackernewsResponse, SearchHackernewsResponse } from "./models";

const logger = getLogger();

const hackernewsClient: Client = {
  request: jest.fn(),
} as unknown as Client;
const requestMock = hackernewsClient.request as jest.MockedFunction<
  Client["request"]
>;

// TODO: write test for counting comments
// TOOD: write test for pagination
describe("hackernews", () => {
  beforeEach(() => {
    requestMock.mockReset();
  });

  describe("search", () => {
    it("filters out `unrelated` search results that algolia sometimes return", async () => {
      // based on results algolia returned for the keyword `pureref` that were very off

      const responseData: SearchHackernewsResponse = {
        hits: [
          {
            created_at: newDateISOString("2021-03-08T11:58:43.000Z"),
            title: null,
            author: "author#0",
            points: null,
            story_text: null,
            comment_text:
              "Yeah, once you start talking about \u0026quot;not pure ref counting\u0026quot; (that is, ad din cycle checkers and what have you), the cost of ref-counting goes up dramatically.\u003cp\u003eI was trying to differentiate between \u0026quot;garbage collection\u0026quot; (the memory management family of techniques) and \u0026quot;specific species of algorithms for GC\u0026quot; (where I would class \u0026quot;pure reference counting\u0026quot; as one, and various augmentations of ref-counting as several more, as well as stop-and-copy, o the easier side).",
            num_comments: null,
            story_id: null,
            story_title:
              "Why I rewrote my Rust keyboard firmware in Zig: consistency, mastery, and fun",
            parent_id: null,
            objectID: "0",
          },
          {
            created_at: newDateISOString("2021-02-27T17:42:41.000Z"),
            title: null,
            author: "author#1",
            points: null,
            story_text: null,
            comment_text:
              "I\u0026#x27;m developing a mobile game in Godot that would require thousands of nodes. The lowest hanging fruit optimization is simply ditching GDScript and nodes altogether for a C++ module or GDNative. ECS imo is a requirement for non-trivial games, and I don\u0026#x27;t think any game editor has it together here because of the tendency to prioritize accessible fast iteration in early stages over performance and scalability. So they stay in the comfort zone of scene tree hierarchical representation. I\u0026#x27;m planning to move to Jai or build a PureRef-like visual ecs editor with libclang ast reflection and hot reloading so I can escape.",
            num_comments: null,
            story_id: null,
            story_title: "Why isn't Godot an ECS-based game engine?",
            parent_id: null,
            objectID: "1",
          },
          {
            // should be filtered out
            created_at: newDateISOString("2021-02-27T17:42:41.000Z"),
            title: null,
            author: "author#2",
            points: null,
            story_text: null,
            comment_text:
              "What I&#x27;m saying is when the largest trial and the one with probably the most leverage in the meta-analysis included turns out to be completely fraudulent, it doesn&#x27;t bode well for that not being the case for other included trials. This one was &#x27;preregistered&#x27; after data was collected among other major red flags and shouldn&#x27;t have passed QC. That is the type of bias&#x2F;error that can&#x27;t be accounted for in the analysis itself",
            num_comments: null,
            story_id: null,
            story_title: "some title",
            parent_id: null,
            objectID: "2",
          },
          {
            // should be filtered out
            created_at: newDateISOString("2021-02-27T17:42:41.000Z"),
            title: null,
            author: "author#3",
            points: null,
            story_text: null,
            comment_text: "No because you have to preregister all of them.",
            num_comments: null,
            story_id: null,
            story_title: "some title",
            parent_id: null,
            objectID: "3",
          },
          {
            // should be filtered out
            created_at: newDateISOString("2021-02-27T17:42:41.000Z"),
            title: null,
            author: "author#4",
            points: null,
            story_text: null,
            comment_text:
              "Nordic countries are kinda special in this regard. Historically, you were very unlikely to survive in northern climate on your own. Being part of community was necessary prerequisite for survival. I have been on couple trips to northern Norway/Sweden. People there did not even have locks in their houses, it wasn't even necessary. I wonder if it changed now with advent of migrations from eastern Europe and Middle East.",
            num_comments: null,
            story_id: null,
            story_title: "some title",
            parent_id: null,
            objectID: "4",
          },
        ],
        page: 0,
        nbPages: 1,
      };

      requestMock.mockResolvedValueOnce({
        status: 200,
        data: responseData,
      });

      for (const responseItem of responseData.hits) {
        const getItemData: GetItemHackernewsResponse = {
          id: parseInt(responseItem.objectID),
          created_at: responseItem.created_at,
          points: 0,
        };
        requestMock.mockResolvedValueOnce({
          status: 200,
          data: getItemData,
        });
      }

      const searchResult = fromEither(
        await search({ client: hackernewsClient, logger }, "pureref")
      );

      expect(searchResult).toEqual([
        { ...responseData.hits[0], num_comments: 0 },
        { ...responseData.hits[1], num_comments: 0 },
      ]);
    });
  });
});
