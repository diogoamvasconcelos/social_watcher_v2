import { DateISOString } from "@diogovasconcelos/lib";

export const toLocalTimestamp = (
  timestamp: DateISOString,
  removeMs: boolean = true
) => {
  const date = new Date(timestamp);
  if (removeMs) {
    date.setMilliseconds(0);
  }
  return date.toLocaleString();
};
