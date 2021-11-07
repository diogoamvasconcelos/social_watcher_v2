export const capitalizeWord = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

export const clampText = (text: string, maxLength: number) => {
  return text.length > maxLength
    ? text.substring(0, maxLength - 3) + "..."
    : text;
};
