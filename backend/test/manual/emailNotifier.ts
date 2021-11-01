import {
  fromEither,
  newDateISOString,
  newLowerCase,
} from "@diogovasconcelos/lib/iots";
import SES from "aws-sdk/clients/ses";
import { getLogger } from "@src/lib/logger";
import { getClient, sendEmail } from "@src/lib/ses";
import {
  buildInstagramSearchResult,
  buildTwitterSearchResult,
  buildRedditSearchResult,
  buildHackernewsSearchResult,
  buildYoutubeSearchResult,
} from "@test/lib/builders";
import { formatEmailReport } from "@src/domain/controllers/formatEmailReport";

const logger = getLogger();

const generateHtml = async () => {
  const keyword = newLowerCase("somekeyword");
  const searchResult0 = buildTwitterSearchResult({
    keyword,
    data: {
      text: "Example of some text in English, no need to translate",
      translatedText: "Example of some text in English, no need to translate",
      lang: "en",
    },
    link: "https://twitter.com",
    happenedAt: newDateISOString("2021-01-01T08:00:00"),
  });
  const searchResult1 = buildTwitterSearchResult({
    keyword,
    data: {
      text: "Exemplo do texto em Portugues, que vai ser repito.".repeat(10),
      translatedText:
        "Nice translation, everything good, we can read, life's".repeat(10),
      lang: "pt",
    },
    link: "https://twitter.com",
    happenedAt: newDateISOString("2021-01-01T07:00:00"),
  });
  const searchResult2 = buildInstagramSearchResult({
    keyword,
    data: {
      caption: "Outro exemplo do texto em Portugues, e preciso traduzir",
      translatedText:
        "Another nice translation, everything good, we can read, life's nice",
      lang: "pt",
    },
    link: "https://instagram.com",
    happenedAt: newDateISOString("2021-01-01T06:00:00"),
  });
  const searchResult3 = buildRedditSearchResult();
  const searchResult4 = buildHackernewsSearchResult();
  const searchResult5 = buildYoutubeSearchResult();

  return formatEmailReport({
    keyword,
    searchFrequency: "DAILY",
    searchStart: newDateISOString("2021-01-01T06:00:00"),
    searchResults: [
      searchResult0,
      searchResult1,
      searchResult2,
      searchResult3,
      searchResult4,
      searchResult5,
    ],
    reportMedium: "email",
    config: {
      status: "DAILY",
    },
  });
};

const sendTestEmail = async () => {
  const client = getClient();

  const params: SES.Types.SendEmailRequest = {
    Source: "notifier@thesocialwatcher.com",
    Destination: { ToAddresses: ["deon09@gmail.com"] },
    Message: {
      Subject: { Data: "Social Watcher test" },
      Body: {
        Html: { Data: await generateHtml() },
      },
    },
  };

  const res = fromEither(await sendEmail({ client, logger }, params));
  console.log(res);
};

export const main = async () => {
  await sendTestEmail();
};

// void main();
