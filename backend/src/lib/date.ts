import { newDateISOString } from "@diogovasconcelos/lib/iots";

export const getNow = () => newDateISOString(new Date().toISOString());

export const getHoursAgo = (hours: number = 0) => getMinutesAgo(hours * 60);
export const getMinutesAgo = (minutes: number = 0) =>
  getSecondsAgo(minutes * 60);
export const getSecondsAgo = (seconds: number = 0) =>
  newDateISOString(new Date(Date.now() - seconds * 1000).toISOString());

export const getSecondsAfter = (seconds: number = 0) =>
  newDateISOString(new Date(Date.now() + seconds * 1000).toISOString());

export const toUnixTimstamp = (date: Date) => Math.round(date.getTime() / 1000);

export const fromUnix = (unixTimestamp: number) =>
  newDateISOString(new Date(unixTimestamp * 1000).toISOString());

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + 1000 * 60 * 60 * 24 * days);
