import { newDateISOString } from "@diogovasconcelos/lib/iots";
import { parse } from "tinyduration";

export const getNow = () => newDateISOString(new Date().toISOString());

export const getHoursAgo = (
  hours: number = 0,
  refDate: Date = new Date(Date.now())
) => getMinutesAgo(hours * 60, refDate);
export const getMinutesAgo = (
  minutes: number = 0,
  refDate: Date = new Date(Date.now())
) => getSecondsAgo(minutes * 60, refDate);
export const getSecondsAgo = (
  seconds: number = 0,
  refDate: Date = new Date(Date.now())
) =>
  newDateISOString(new Date(refDate.getTime() - seconds * 1000).toISOString());

export const getSecondsAfter = (seconds: number = 0) =>
  newDateISOString(new Date(Date.now() + seconds * 1000).toISOString());

export const toUnixTimstamp = (date: Date) => Math.round(date.getTime() / 1000);

export const fromUnix = (unixTimestamp: number) =>
  newDateISOString(new Date(unixTimestamp * 1000).toISOString());

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + 1000 * 60 * 60 * 24 * days);

export const iso8061DurationToSeconds = (duration: string) => {
  let parsedDuration: ReturnType<typeof parse> | undefined = undefined;
  try {
    parsedDuration = parse(duration);
  } catch (_e) {
    // do nothing
    return 0;
  }

  const secondsInMinute = 60;
  const secondsInHour = secondsInMinute * 60;
  const secondsInDay = secondsInHour * 24;
  const secondsInWeeks = secondsInDay * 7;
  const secondsInMonth = secondsInWeeks * 4;
  const secondsInYear = secondsInMonth * 12;

  return (
    ((parsedDuration.years ?? 0) * secondsInYear +
      (parsedDuration.months ?? 0) * secondsInMonth +
      (parsedDuration.weeks ?? 0) * secondsInWeeks +
      (parsedDuration.days ?? 0) * secondsInDay +
      (parsedDuration.hours ?? 0) * secondsInHour +
      (parsedDuration.minutes ?? 0) * secondsInMinute +
      (parsedDuration.seconds ?? 0)) *
    (parsedDuration.negative ? -1 : 1)
  );
};
