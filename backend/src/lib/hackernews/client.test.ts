import { fromEither, newDateISOString } from "@diogovasconcelos/lib/iots";
import { getLogger } from "../logger";
import { Client, search } from "./client";
import {
  GetItemHackernewsResponse,
  SearchHackernewsResponse,
  SearchHackernewsResponseItem,
} from "./models";

const logger = getLogger();

const hackernewsClient: Client = {
  request: jest.fn(),
} as unknown as Client;
const requestMock = hackernewsClient.request as jest.MockedFunction<
  Client["request"]
>;

describe("hackernews", () => {
  beforeEach(() => {
    requestMock.mockReset();
  });

  describe("search", () => {
    it("filters out `unrelated` search results that algolia sometimes return", async () => {
      // based on results algolia returned for the keyword `pureref` that were very off
      const responseData: SearchHackernewsResponse = {
        hits: [
          buildHackernewsResponseItem({
            created_at: newDateISOString("2021-03-08T11:58:43.000Z"),
            title: null,
            comment_text:
              "Yeah, once you start talking about \u0026quot;not pure ref counting\u0026quot; (that is, ad din cycle checkers and what have you), the cost of ref-counting goes up dramatically.\u003cp\u003eI was trying to differentiate between \u0026quot;garbage collection\u0026quot; (the memory management family of techniques) and \u0026quot;specific species of algorithms for GC\u0026quot; (where I would class \u0026quot;pure reference counting\u0026quot; as one, and various augmentations of ref-counting as several more, as well as stop-and-copy, o the easier side).",
            objectID: "0",
          }),
          buildHackernewsResponseItem({
            created_at: newDateISOString("2021-02-27T17:42:41.000Z"),
            title: null,
            comment_text:
              "I\u0026#x27;m developing a mobile game in Godot that would require thousands of nodes. The lowest hanging fruit optimization is simply ditching GDScript and nodes altogether for a C++ module or GDNative. ECS imo is a requirement for non-trivial games, and I don\u0026#x27;t think any game editor has it together here because of the tendency to prioritize accessible fast iteration in early stages over performance and scalability. So they stay in the comfort zone of scene tree hierarchical representation. I\u0026#x27;m planning to move to Jai or build a PureRef-like visual ecs editor with libclang ast reflection and hot reloading so I can escape.",
            objectID: "1",
          }),
          buildHackernewsResponseItem({
            created_at: newDateISOString("2021-02-27T17:42:41.000Z"),
            title: "what do you  use for ios? PureRef?",
            comment_text: null,
            objectID: "2",
          }),
          buildHackernewsResponseItem({
            // should be filtered out
            created_at: newDateISOString("2021-02-27T17:42:41.000Z"),
            title: null,
            comment_text:
              "What I&#x27;m saying is when the largest trial and the one with probably the most leverage in the meta-analysis included turns out to be completely fraudulent, it doesn&#x27;t bode well for that not being the case for other included trials. This one was &#x27;preregistered&#x27; after data was collected among other major red flags and shouldn&#x27;t have passed QC. That is the type of bias&#x2F;error that can&#x27;t be accounted for in the analysis itself",
            objectID: "3",
          }),
          buildHackernewsResponseItem({
            // should be filtered out
            created_at: newDateISOString("2021-02-27T17:42:41.000Z"),
            title: null,
            comment_text: "No because you have to preregister all of them.",
            objectID: "4",
          }),
          buildHackernewsResponseItem({
            // should be filtered out
            created_at: newDateISOString("2021-02-27T17:42:41.000Z"),
            title: null,
            comment_text:
              "Nordic countries are kinda special in this regard. Historically, you were very unlikely to survive in northern climate on your own. Being part of community was necessary prerequisite for survival. I have been on couple trips to northern Norway/Sweden. People there did not even have locks in their houses, it wasn't even necessary. I wonder if it changed now with advent of migrations from eastern Europe and Middle East.",
            objectID: "5",
          }),
          buildHackernewsResponseItem({
            // should be filtered out
            created_at: newDateISOString("2021-02-27T17:42:41.000Z"),
            title: null,
            comment_text:
              "That chemistry is a prerequisite for structural batteries. Replacing a structural battery is obviously not economical, vizref",
            objectID: "6",
          }),
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
        { ...responseData.hits[0], num_comments: 0, fuzzy_match: true },
        { ...responseData.hits[1], num_comments: 0, fuzzy_match: false },
        { ...responseData.hits[2], num_comments: 0, fuzzy_match: false },
      ]);
    });

    it("can count nof comments", async () => {
      const responseData: SearchHackernewsResponse = {
        hits: [
          buildHackernewsResponseItem({
            created_at: newDateISOString("2021-03-08T11:58:43.000Z"),
            title: null,
            comment_text: "keyword",
            objectID: "0",
          }),
        ],
        page: 0,
        nbPages: 1,
      };

      requestMock.mockResolvedValueOnce({
        status: 200,
        data: responseData,
      });

      const getItemData: GetItemHackernewsResponse = {
        id: parseInt(responseData.hits[0].objectID),
        created_at: responseData.hits[0].created_at,
        points: 0,
        children: [
          {
            children: [
              {
                children: [{}],
              },
              {},
            ],
          },
        ],
      };
      requestMock.mockResolvedValueOnce({
        status: 200,
        data: getItemData,
      });

      const searchResult = fromEither(
        await search({ client: hackernewsClient, logger }, "keyword")
      );

      expect(searchResult).toEqual([
        { ...responseData.hits[0], num_comments: 4, fuzzy_match: false },
      ]);
    });

    it("can paginate", async () => {
      const responseData0: SearchHackernewsResponse = {
        hits: [
          buildHackernewsResponseItem({
            created_at: newDateISOString("2021-03-08T11:58:43.000Z"),
            title: null,
            comment_text: "keyword",
            objectID: "0",
          }),
        ],
        page: 0,
        nbPages: 2,
      };
      const responseData1: SearchHackernewsResponse = {
        hits: [
          buildHackernewsResponseItem({
            created_at: newDateISOString("2021-04-08T11:58:43.000Z"),
            title: null,
            comment_text: "keyword too",
            objectID: "1",
          }),
        ],
        page: 1,
        nbPages: 2,
      };

      const getItemData: GetItemHackernewsResponse = {
        id: 0,
        created_at: newDateISOString("2021-04-08T11:58:43.000Z"),
        points: 0,
      };

      requestMock
        .mockResolvedValueOnce({
          status: 200,
          data: responseData0,
        })
        .mockResolvedValueOnce({
          status: 200,
          data: getItemData,
        })
        .mockResolvedValueOnce({
          status: 200,
          data: responseData1,
        })
        .mockResolvedValueOnce({
          status: 200,
          data: getItemData,
        });

      const searchResult = fromEither(
        await search({ client: hackernewsClient, logger }, "keyword")
      );

      expect(searchResult).toEqual([
        { ...responseData0.hits[0], num_comments: 0, fuzzy_match: false },
        { ...responseData1.hits[0], num_comments: 0, fuzzy_match: false },
      ]);
    });
  });
});

const buildHackernewsResponseItem = ({
  created_at,
  title,
  comment_text,
  objectID,
}: Pick<
  SearchHackernewsResponseItem,
  "created_at" | "title" | "comment_text" | "objectID"
>): SearchHackernewsResponseItem => ({
  created_at,
  title,
  author: "author#0",
  points: null,
  story_text: null,
  comment_text,
  num_comments: null,
  story_id: null,
  story_title: "title",
  parent_id: null,
  objectID,
});
