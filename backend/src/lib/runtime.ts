export class UnexpectedCaseError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export const throwUnexpectedCase = (theCase: never, origin: string): never => {
  throw new UnexpectedCaseError(
    `Error in ${origin}! Unexpected case:\n${JSON.stringify(theCase)}`
  );
};
