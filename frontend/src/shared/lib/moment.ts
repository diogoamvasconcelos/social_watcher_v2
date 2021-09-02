import moment from "moment";

export const momentOrNull = (input: moment.MomentInput) =>
  input ? moment(input) : null;
