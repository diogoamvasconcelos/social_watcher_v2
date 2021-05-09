import { newDateISOString } from "./iots";

export const getNow = () => newDateISOString(new Date().toISOString());

export const getMinutesAgo = (minutes: number = 0) =>
  newDateISOString(new Date(Date.now() - minutes * 60 * 1000).toISOString());

export const toUnixTimstamp = (date: Date) => Math.round(date.getTime() / 1000);

export const fromUnix = (unixTimestamp: number) =>
  new Date(unixTimestamp * 1000).toISOString();

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + 1000 * 60 * 60 * 24 * days);
