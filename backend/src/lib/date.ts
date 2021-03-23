export const getNow = () => new Date().toISOString();

export const getMinutesAgo = (minutes: number = 0) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();
