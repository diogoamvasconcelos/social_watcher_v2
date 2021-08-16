export const getKeys = <T>(obj: T) => Object.keys(obj) as Array<keyof T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapRecord = <K extends keyof any, V, R>(
  record: Record<K, V>,
  mapFn: (k: K, v: V) => R
): R[] => {
  return getKeys(record).map((key) => mapFn(key, record[key]));
};
