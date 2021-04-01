export type PickRequired<T, K extends keyof T> = Required<Pick<T, K>>[K];

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
