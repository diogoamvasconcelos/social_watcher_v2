// Required as this package has no types...
declare module "instagram-scraping" {
  export type ScrapeResponse = {
    total: number;
    medias: { node: ScrapeMediaNode }[];
  };

  export type ScrapeMediaNode = {
    __typename: "GraphImage" | "GraphSidecar" | "GraphVideo";
    id: string;
    owner: {
      id: string;
      username?: string;
      full_name?: string;
      profile_pic_url?: string;
      is_private?: boolean;
      edge_followed_by?: { count: number };
    };
    shortcode: string;
    comments_disabled: boolean;
    taken_at_timestamp: number;
    display_url: string;
    edge_liked_by: { count: number };
    edge_media_to_comment: { count: number };
    edge_media_to_caption: {
      edges: {
        node: {
          text: string;
        };
      }[];
    };
    is_video: boolean;
    video_view_count?: number;
  };

  export const scrapeTag: (text: string) => Promise<ScrapeResponse>;

  export const deepScrapeTagPage: (text: string) => Promise<ScrapeResponse>;

  export const scrapeComment: (shortcode: string) => Promise<ScrapeResponse>;

  export const scrapeUserPage: (username: string) => Promise<ScrapeResponse>;
}
