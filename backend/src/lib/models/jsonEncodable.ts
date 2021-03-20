export type JsonObjectEncodable = {
  [x: string]: JsonEncodable;
};

export type JsonArrayEncodable = Array<JsonEncodable>;

export type JsonEncodable =
  | string
  | number
  | boolean
  | Date
  | JsonObjectEncodable
  | JsonArrayEncodable
  | null
  | undefined;
