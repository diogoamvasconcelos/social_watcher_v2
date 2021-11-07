import { capitalizeWord, clampText } from "@src/lib/text";
import _ from "lodash";
import mjml2html from "mjml";
import { minify } from "html-minifier-terser";
import { EmailReportJob } from "../models/reportJob";
import qs from "qs";
import { SocialMedia } from "../models/socialMedia";
import { SearchResult } from "../models/searchResult";
import { throwUnexpectedCase } from "@src/lib/runtime";
import { getSearchResultText } from "../utils/searchResultUtils";

// TODO:
// - host all necessary images (social media, accordion arrows, main icon/title, cool header section bg image)

type EmailReportOptions = {
  maxNumberResults: number;
};

export const formatEmailReport = async (
  reportJob: EmailReportJob,
  { maxNumberResults }: EmailReportOptions = { maxNumberResults: 15 }
) => {
  const resultsUrl = `https://thesocialwatcher.com/user/dashboard/archives?${qs.stringify(
    {
      keyword: reportJob.keyword,
      timeStart: reportJob.searchStart,
      timeEnd: reportJob.searchEnd,
    }
  )}`;

  const rawMjml = `
	<mjml>
		${head}
		<mj-body>
			${buildHeaderSection(reportJob)}
			${buildSummarySection(reportJob, resultsUrl)}
			${buildResultsSection(reportJob, resultsUrl, maxNumberResults)}
		</mj-body>
	</mjml>
`;

  // console.log(rawMjml); // handy for tests to get the raw mjml at https://mjml.io/try-it-live/6mr_9TfdyiQ
  const minified = await minify(rawMjml);
  return mjml2html(minified, {}).html;
};

const colors = {
  strongBg: "#243B53",
  lightBg: "#F0F4F8",
  lightMediumBg: "#D9E2EC",
  lightText: "#F0F4F8",
  darkText: "#102A43",
  actionBg: "#0A6C74",
  linkText: "#4C63B6",
};

const textClasses = {
  title: "title",
  header: "header",
  subheader: "subheader",
};

const divider = (color: string) => `
<mj-section padding="0px 0px">
	<mj-column>
		<mj-divider border-width="1px" border-color="${color}" padding="0px" />
	</mj-column>
</mj-section>
`;

const head = `
<mj-head>
	<mj-title>
		Social Watcher Report
	</mj-title>
	<mj-attributes>
		<mj-text padding="8px" font-size="13px" color="${colors.darkText}" />
		<mj-class name="${textClasses.title}" font-size="24px" />
		<mj-class name="${textClasses.header}" font-size="20px" font-style="italic" />
		<mj-class name="${textClasses.subheader}" font-size="14px" />
		<mj-all font-family="Roboto, Open Sans, Helvetica, Arial, sans-serif" />
		<mj-accordion border="none" padding="0px" />
		<mj-accordion-element icon-wrapped-url="https://i.imgur.com/Xvw0vjq.png" icon-unwrapped-url="https://i.imgur.com/KKHenWa.png" icon-height="16px" icon-width="16px" />
		<mj-accordion-title font-size="12px" color="${colors.linkText}" padding="8px" />
		<mj-accordion-text color="${colors.darkText}" padding="8px" />
	</mj-attributes>
</mj-head>
`;

const buildHeaderSection = ({
  keyword,
  searchFrequency,
  searchStart,
}: EmailReportJob) => {
  return `
<mj-section background-color="${colors.strongBg}">
	<mj-column width="400px">
		<mj-text mj-class="${textClasses.title}" color="${
    colors.lightText
  }">The Social Watcher</mj-text>
		<mj-text color="${colors.lightText}">${capitalizeWord(
    searchFrequency
  )} report - ${searchStart}</mj-text>
		<mj-text color="${colors.lightText}">Keyword: ${keyword}</mj-text>
	</mj-column>
</mj-section>
	`;
};

const buildSummarySection = (
  { keyword, searchResults }: EmailReportJob,
  resultsUrl: string
) => {
  const resultGroups = _.groupBy(searchResults, "socialMedia");
  const resultsString = Object.entries(resultGroups)
    .map(([socialMedia, results]) => `${results.length} ${socialMedia}`)
    .join(", ");

  const summary = `Found ${resultsString} posts for '${keyword}'`;

  return `
<mj-section background-color="${colors.lightBg}" padding="8px 0px 0px 0px">
	<mj-column>
		<mj-text mj-class="${textClasses.header}" color="${
    colors.darkText
  }">Summary:</mj-text>
	</mj-column>
</mj-section>
<mj-section background-color="${colors.lightBg}" padding="0px">
	<mj-column>
		<mj-text color="#102A43">${summary}</mj-text>
	</mj-column>
</mj-section>
<mj-section background-color="${colors.lightBg}" padding="0px">
	<mj-column>
		<mj-button background-color="${
      colors.actionBg
    }" href="${resultsUrl}">See all Posts</mj-button>
	</mj-column>
</mj-section>
${divider(colors.strongBg)}
`;
};

const buildResultsSection = (
  { keyword, searchResults }: EmailReportJob,
  resultsUrl: string,
  maxNumberResults: EmailReportOptions["maxNumberResults"]
) => {
  const numberOfResultsToDisplay = Math.min(
    maxNumberResults,
    searchResults.length
  );

  const header = `
<mj-section background-color="#F0F4F8" padding="12px 0px 2px 0px">
	<mj-column>
		<mj-text mj-class="${textClasses.header}" color="#102A43">Latest ${numberOfResultsToDisplay} '${keyword}' posts:</mj-text>
	</mj-column>
</mj-section>
`;

  const latestSearchResults = [...searchResults]
    .sort((a, b) => (a.happenedAt > b.happenedAt ? 1 : -1))
    .slice(0, maxNumberResults); // sort olders first

  const body = latestSearchResults
    .map((result, i) => buildResultItem(result, i % 2 == 0))
    .join(divider(colors.strongBg));

  const seeMoreSecton =
    numberOfResultsToDisplay < searchResults.length
      ? `
    <mj-section background-color="${colors.lightBg}" padding="0px">
	<mj-column>
		<mj-button background-color="${colors.actionBg}" href="${resultsUrl}">See more Posts</mj-button>
	</mj-column>
</mj-section>`
      : "";

  return `
	${header}
	${body}
  ${seeMoreSecton}
	`;
};

const buildResultItem = (result: SearchResult, isEvenItem: boolean) => {
  const getSocialMediaIcon = (socialMedia: SocialMedia) => {
    // sources: https://www.flaticon.com/search?word=twitter&type=icon
    // TODO: add own images from our own S3 bucket
    switch (socialMedia) {
      case "twitter":
        return "https://cdn-icons-png.flaticon.com/512/145/145812.png";
      case "reddit":
        return "https://cdn-icons-png.flaticon.com/512/2111/2111589.png";
      case "hackernews":
        return "https://cdn-icons-png.flaticon.com/512/52/52068.png";
      case "instagram":
        return "https://cdn-icons-png.flaticon.com/512/2111/2111463.png";
      case "youtube":
        return "https://cdn-icons-png.flaticon.com/512/1384/1384060.png";
      default:
        return throwUnexpectedCase(
          socialMedia,
          "buildResultItem.getSocialMediaIcon"
        );
    }
  };

  const bgColor = isEvenItem ? colors.lightBg : colors.lightMediumBg;

  const title = `${result.happenedAt} @ ${capitalizeWord(result.socialMedia)}`;

  const isEnglish = result.data.lang === "en";
  const rawText = clampText(getSearchResultText(result), 300);
  const text = isEnglish
    ? `Text: ${rawText}`
    : `Text(${result.data.lang}): ${rawText}`;

  const translatedTextAccordian = `
<mj-accordion>
	<mj-accordion-element>
		<mj-accordion-title>Translation</mj-accordion-title>
		<mj-accordion-text>
		${clampText(result.data.translatedText ?? "", 300)}
		</mj-accordion-text>
	</mj-accordion-element>
</mj-accordion>
	`;

  return `
<mj-section background-color="${bgColor}" padding="0px">
	<mj-column>
		<mj-text mj-class="${textClasses.subheader}" color="${
    colors.darkText
  }"><a href="${result.link}">${title}</a></mj-text>
	</mj-column>
	<mj-column>
		<mj-image width="32px" src="${getSocialMediaIcon(
      result.socialMedia
    )}"></mj-image>
	</mj-column>
</mj-section>
<mj-section background-color="${bgColor}" padding="0px">
	<mj-column>
		<mj-text color="${colors.darkText}">${text}</mj-text>
		${isEnglish ? "" : translatedTextAccordian}
	</mj-column>
</mj-section>
	`;
};
