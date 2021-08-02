// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handler(event) {
  return {
    statusCode: 301, //https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections
    statusDescription: "Moved Permanently",
    headers: {
      location: { value: `https://thesocialwatcher.com${event.request.uri}` },
    },
  };
}
