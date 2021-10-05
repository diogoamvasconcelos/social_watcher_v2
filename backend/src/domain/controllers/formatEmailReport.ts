import { capitalizeWord } from "@src/lib/text";
import _ from "lodash";
import mjml2html from "mjml";
import { ReportJob } from "../models/reportJob";
import qs from "qs";

// TODO: clamp text to max size

export const formatEmailReport = (reportJob: ReportJob): string => {
  return mjml2html(
    `
	<mjml>
		${head}
		<mj-body>
			${buildHeader(reportJob)}
			${buildSummary(reportJob)}
		</mj-body>
	</mjml>`,
    {} // TODO options
  ).html;
};

const colors = {
  strongBg: "#243B53",
  lightBg: "#F0F4F8",
  lightText: "#F0F4F8",
  darkText: "#102A43",
  actionBg: "#0A6C74",
};

const head = `
<mj-head>
	<mj-title>
		Social Watcher Report
	</mj-title>
	<mj-attributes>
		<mj-text padding="8px" font-size="13px" color=${colors.darkText}/>
		<mj-class name="title" font-size="24px" />
		<mj-class name="header" font-size="20px" font-style="italic" />
		<mj-class name="subheader" font-size="14px" />
		<mj-all font-family="Roboto" />
	</mj-attributes>
</mj-head>
`;

const buildHeader = (reportJob: ReportJob) => {
  return `
<mj-section background-color="${colors.strongBg}">
	<mj-column width="400px">
		<mj-text font-size="20px" color="${
      colors.lightText
    }">The Social Watcher</mj-text>
		<mj-text color="${colors.lightText}">${capitalizeWord(
    reportJob.searchFrequency
  )} report - ${reportJob.searchStart}</mj-text>
		<mj-text color="${colors.lightText}">Keyword: pureref</mj-text>
	</mj-column>
</mj-section>
	`;
};

const buildSummary = (reportJob: ReportJob) => {
  const resultGroups = _.groupBy(reportJob.searchResults, "socialMedia");
  const resultsString = Object.entries(resultGroups)
    .map(([socialMedia, results]) => `${results.length} ${socialMedia}`)
    .join(", ");

  const summary = `Found ${resultsString} posts for '${reportJob.keyword}'`;

  const resultsUrl = `https://thesocialwatcher.com/user/dashboard/search?${qs.stringify(
    {
      keyword: reportJob.keyword,
      timeStart: reportJob.searchStart,
    }
  )}`;

  return `
<mj-section background-color="${colors.lightBg}" padding="8px 0px 0px 0px">
	<mj-column>
		<mj-text mj-class="header" color="${colors.darkText}">Summary:</mj-text>
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

const divider = (color: string) => `
<mj-section padding="0px 0px">
	<mj-column>
		<mj-divider border-width="1px" border-color="${color}" padding="0px" />
	</mj-column>
</mj-section>
`;
