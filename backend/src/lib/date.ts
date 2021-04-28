import { newDateISOString } from "./iots";

export const getNow = () => newDateISOString(new Date().toISOString());

export const getMinutesAgo = (minutes: number = 0) =>
  newDateISOString(new Date(Date.now() - minutes * 60 * 1000).toISOString());
