import { User } from "../models/user";

export const isTestEmail = (email: User["email"]): boolean => {
  const testEmalRegex = /^.*@simulator.amazonses.com$/;

  return testEmalRegex.test(email);
};
