import { getAllActiveKeywords } from "@src/domain/controllers/getAllActiveKeywords";
import { getConfig } from "@src/lib/config";
import { getLogger, Logger } from "@src/lib/logger";
import { defaultMiddlewareStack } from "@src/handlers/middlewares/common";
import { getClient as getKeywordStoreClient } from "@src/adapters/keywordStore/client";
import { getClient as getUserStoreClient } from "@src/adapters/userStore/client";
import { makeGetActiveKeywords } from "@src/adapters/keywordStore/getActiveKeywords";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { Keyword } from "@src/domain/models/keyword";
import { GetSearchObjectsForKeywordFn } from "@src/domain/ports/userStore/getSearchObjectsForKeyword";
import _ from "lodash";
import { makeGetSearchObjectsForKeyword } from "@src/adapters/userStore/getSearchObjectsForKeyword";
import {
  ReportFrequency,
  ReportJob,
  ReportJobBase,
} from "@src/domain/models/reportJob";
import {
  SearchSearchResultsFn,
  SearchSearchResultsParams,
} from "@src/domain/ports/searchResultsSearchEngine/searchSearchResults";
import { getClient as getSearchEngineClient } from "@src/adapters/searchResultsSearchEngine/client";
import { makeSearchSearchResults } from "@src/adapters/searchResultsSearchEngine/searchSearchResults";
import {
  fromEither,
  newPositiveInteger,
  PositiveInteger,
  toSingleEither,
} from "@diogovasconcelos/lib/iots";
import { getHoursAgo, getNow } from "@src/lib/date";
import { throwUnexpectedCase } from "@src/lib/runtime";
import { ReportMedium, reportMediums } from "@src/domain/models/reportMedium";
import { SearchObjectDomain } from "@src/domain/models/userItem";
import { getClient as getReportJobsQueueClient } from "@src/adapters/reportJobsQueue/client";
import { makeQueueReportJobs } from "@src/adapters/reportJobsQueue/queueReportJobs";
import { QueueReportJobsFn } from "@src/domain/ports/reportJobsQueue/queueReportJobs";
import { eitherListToDefaultOk } from "@src/domain/ports/shared";

const config = getConfig();
const logger = getLogger();

// TODO: write tests
// - don't dispatch if no results are found (which is kind of assured by the type anyway)

const handler = async () => {
  // deps
  const keywordStoreClient = getKeywordStoreClient();
  const getActiveKeywordsFn = makeGetActiveKeywords(
    keywordStoreClient,
    config.keywordsTableName
  );

  const userStoreClient = getUserStoreClient();
  const getSearchObjectsForKeywordFn = makeGetSearchObjectsForKeyword(
    userStoreClient,
    config.usersTableName
  );

  const searchEngineClient = getSearchEngineClient(config.mainElasticSearchUrl);
  const searchSearchResultsFn = makeSearchSearchResults(searchEngineClient);

  const reportJobQueueClient = getReportJobsQueueClient();
  const queueReportJobsFn = makeQueueReportJobs(
    reportJobQueueClient,
    config.reportJobsQueueTemplateName
  );

  // get all active keywords, filter if no reports are required by any user
  const allActiveKeywordsEither = await getAllActiveKeywords({
    logger,
    getActiveKeywordsFn,
  });
  if (isLeft(allActiveKeywordsEither)) {
    return allActiveKeywordsEither;
  }

  const filteredKeywordsEither = await filterKeywordsWithoutRequestedReports(
    { logger, getSearchObjectsForKeywordFn },
    allActiveKeywordsEither.right
  );
  if (isLeft(filteredKeywordsEither)) {
    return filteredKeywordsEither;
  }

  // search daily and search weekly (if friday) and cache results - cap at most recent (because of SQS size limt)
  const searchResultsForDailyReportsEither = await searchForReport(
    { logger, searchSearchResultsFn },
    filteredKeywordsEither.right,
    "DAILY",
    newPositiveInteger(20)
  );
  if (isLeft(searchResultsForDailyReportsEither)) {
    return left("ERROR");
  }
  let reportsCache = searchResultsForDailyReportsEither.right;

  if (isFriday()) {
    // we are assuming we only dispatch reports once a day,
    // so checking for Friday is enough to do the weekly search once a week
    const searchResultsForWeeklyReportsEither = await searchForReport(
      { logger, searchSearchResultsFn },
      filteredKeywordsEither.right,
      "WEEKLY",
      newPositiveInteger(20)
    );
    if (isLeft(searchResultsForWeeklyReportsEither)) {
      return left("ERROR");
    }

    reportsCache = [
      ...reportsCache,
      ...searchResultsForWeeklyReportsEither.right,
    ];
  }

  // filter reports without any search results
  reportsCache.filter((report) => report.searchResults.length > 0);

  // dispatch reports per user that requested
  const dispatchReportJobsEither = toSingleEither(
    await Promise.all(
      reportsCache.map(
        async (report) =>
          await dispatchReportJobsForKeyword(
            { logger, getSearchObjectsForKeywordFn, queueReportJobsFn },
            report
          )
      )
    )
  );

  fromEither(dispatchReportJobsEither);
};
export const lambdaHandler = defaultMiddlewareStack(handler);

const filterKeywordsWithoutRequestedReports = async (
  {
    logger,
    getSearchObjectsForKeywordFn,
  }: {
    logger: Logger;
    getSearchObjectsForKeywordFn: GetSearchObjectsForKeywordFn;
  },
  keywords: Keyword[]
): Promise<Either<"ERROR", Keyword[]>> => {
  const keywordHasReportsEither = toSingleEither(
    await Promise.all(
      keywords.map(async (keyword) => {
        const allSearchObjectsForKeywordEither =
          await getSearchObjectsForKeywordFn(logger, keyword);
        if (isLeft(allSearchObjectsForKeywordEither)) {
          logger.error("Failed to find requested report", { keyword });
          return allSearchObjectsForKeywordEither;
        }

        return right({
          keyword,
          hasRequestedReport: _.some(
            allSearchObjectsForKeywordEither.right,
            (searchObject) =>
              searchObject.reportData.email.status !== "DISABLED"
          ),
        });
      })
    )
  );

  if (isLeft(keywordHasReportsEither)) {
    return left("ERROR");
  }

  return right(
    keywordHasReportsEither.right
      .filter((keywordReport) => keywordReport.hasRequestedReport)
      .map((keywordReport) => keywordReport.keyword)
  );
};

const searchForReport = async (
  {
    logger,
    searchSearchResultsFn,
  }: { logger: Logger; searchSearchResultsFn: SearchSearchResultsFn },
  keywords: Keyword[],
  frequency: ReportFrequency,
  maxItems: PositiveInteger
): Promise<Either<"ERROR"[], ReportJobBase[]>> => {
  const searchStart = calcSearchStartDate(frequency);

  const baseParams: Omit<SearchSearchResultsParams, "keywords"> = {
    pagination: {
      limit: maxItems,
      offset: newPositiveInteger(0),
    },
    timeQuery: {
      happenedAtStart: searchStart,
    },
  };

  return toSingleEither(
    await Promise.all(
      keywords.map(async (keyword) => {
        const searchEither = await searchSearchResultsFn(logger, {
          ...baseParams,
          keywords: [keyword],
        });
        if (isLeft(searchEither)) {
          return searchEither;
        }

        return right({
          keyword,
          searchFrequency: frequency,
          searchResults: searchEither.right.items,
          searchStart: searchStart,
          searchEnd: getNow(),
        });
      })
    )
  );
};

const dispatchReportJobsForKeyword = async (
  {
    logger,
    getSearchObjectsForKeywordFn,
    queueReportJobsFn,
  }: {
    logger: Logger;
    getSearchObjectsForKeywordFn: GetSearchObjectsForKeywordFn;
    queueReportJobsFn: QueueReportJobsFn;
  },
  report: ReportJobBase
) => {
  const allSearchObjectsForKeywordEither = await getSearchObjectsForKeywordFn(
    logger,
    report.keyword
  );
  if (isLeft(allSearchObjectsForKeywordEither)) {
    logger.error("Failed to find search objects for report", {
      keyword: report.keyword,
      frequency: report.searchFrequency,
    });
    return allSearchObjectsForKeywordEither;
  }

  const queueReportJobsEither = await Promise.all(
    // iterate all reportMediums
    reportMediums.map(
      async (reportMedium) =>
        await queueReportJobs(
          { logger, queueReportJobsFn },
          allSearchObjectsForKeywordEither.right,
          report,
          reportMedium
        )
    )
  );

  return eitherListToDefaultOk(queueReportJobsEither);
};

const queueReportJobs = async (
  {
    logger,
    queueReportJobsFn,
  }: { logger: Logger; queueReportJobsFn: QueueReportJobsFn },
  searchObjects: SearchObjectDomain[],
  report: ReportJobBase,
  reportMedium: ReportMedium
) => {
  const filteredReportJobs: ReportJob[] = searchObjects
    .filter((searchObject) => {
      return (
        searchObject.reportData[reportMedium].status === report.searchFrequency
      );
    })
    .map((searchObject) => {
      const job: ReportJob = {
        reportMedium,
        ...report,
        config: searchObject.reportData[reportMedium],
      };
      return job;
    });

  return await queueReportJobsFn(logger, reportMedium, filteredReportJobs);
};

const isFriday = () => new Date().getDay() == 6;

const calcSearchStartDate = (frequency: ReportFrequency) => {
  switch (frequency) {
    case "DAILY":
      return getHoursAgo(24);
    case "WEEKLY":
      return getHoursAgo(24 * 7);
    default:
      return throwUnexpectedCase(frequency, "calcSearchStartDate");
  }
};
