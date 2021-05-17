export const ensure = (name: string): string => {
  const value = process.env[name];
  if (value == null) {
    throw new Error(`Missing environment variable ${name}`);
  }

  return value;
};

export const ensureString = (value?: string): string => {
  if (value == undefined) {
    throw new Error(`Not a string, instead: ${value}`);
  }
  return value;
};
