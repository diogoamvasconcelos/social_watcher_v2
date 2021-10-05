import { newDateISOString, newLowerCase } from "@diogovasconcelos/lib";
import {
  buildInstagramSearchResult,
  buildTwitterSearchResult,
} from "@test/lib/builders";
import { formatEmailReport } from "./formatEmailReport";
import mjml2html from "mjml";

describe("controllers/formatEmailReport.ts", () => {
  it("can format to the expected mjml", () => {
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
        text: "Exemplo do texto em Portugues, e preciso traduzir",
        translatedText:
          "Nice translation, everything good, we can read, life's nice",
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

    const result = formatEmailReport({
      keyword,
      searchFrequency: "DAILY",
      searchStart: newDateISOString("2021-01-01T06:00:00"),
      searchResults: [searchResult0, searchResult1, searchResult2],
      reportMedium: "email",
      config: {
        status: "DAILY",
      },
    });

    expect(result).toEqual(mjml2html(expectedMjMl));
  });
});

// expected mjml built using https://mjml.io/try-it-live/templates/basic
const expectedMjMl = `
		<mjml>
  <mj-head>
    <mj-title>
      Social Watcher Report
    </mj-title>
    <mj-attributes>
      <mj-text padding="8px" font-size="13px" />
      <mj-class name="header" font-size="20px" font-style="italic" />
      <mj-class name="subheader" font-size="14px" />
      <mj-all font-family="Roboto" />
    </mj-attributes>
  </mj-head>
  <mj-body>
    <mj-section background-color="#243B53">
      <mj-column width="400px">
        <mj-text font-size="20px" color="#F0F4F8">The Social Watcher</mj-text>
        <mj-text color="#F0F4F8">Daily report - 12.06.20</mj-text>
        <mj-text color="#F0F4F8">Keyword: pureref</mj-text>
      </mj-column>
    </mj-section>
    <mj-raw>
      <!-- Summary -->
    </mj-raw>
    <mj-section background-color="#F0F4F8" padding="8px 0px 0px 0px">
      <mj-column>
        <mj-text mj-class="header" color="#102A43">Summary:</mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#F0F4F8" padding="0px">
      <mj-column>
        <mj-text color="#102A43">Found 2 twitter, 1 instagram posts for 'somekeyword'</mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#F0F4F8" padding="0px">
      <mj-column>
        <mj-button background-color="#0A6C74" href="#todo">See all Posts</mj-button>
      </mj-column>
    </mj-section>
    <mj-section padding="0px 0px">
      <mj-column>
        <mj-divider border-width="1px" border-color="#000000" padding="0px" />
      </mj-column>
    </mj-section>
    <mj-raw>
      <!-- Results: -->
    </mj-raw>
    <mj-section background-color="#F0F4F8" padding="12px 0px 2px 0px">
      <mj-column>
        <mj-text mj-class="header" color="#102A43">Latest 'somekeyword' posts:</mj-text>
      </mj-column>
    </mj-section>
    <mj-raw>
      <!-- Result #0 -->
    </mj-raw>
    <mj-section background-color="#F0F4F8" padding="0px">
      <mj-column>
        <mj-text mj-class="subheader" color="#102A43">2021-01-01, 08:00:00</mj-text>
      </mj-column>
      <mj-column>
        <!-- https://www.flaticon.com/search?word=twitter&type=icon -->
        <mj-image width="32px" src="https://cdn-icons-png.flaticon.com/512/145/145812.png"></mj-image>
      </mj-column>
      <mj-column></mj-column>
      <mj-column></mj-column>
    </mj-section>
    <mj-section background-color="#F0F4F8" padding="0px">
      <mj-column>
        <mj-text color="#102A43">Text: Example of some text in English, no need to translate</mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="0px 0px">
      <mj-column>
        <mj-divider border-width="1px" border-color="lightgrey" padding="0px" />
      </mj-column>
    </mj-section>
    <mj-raw>
      <!-- Result #1 -->
    </mj-raw>
    <mj-section background-color="#D9E2EC" padding="0px">
      <mj-column>
        <mj-text mj-class="subheader" color="#102A43">2021-01-02, 07:00:00</mj-text>
      </mj-column>
      <mj-column>
        <!-- https://www.flaticon.com/search?word=twitter&type=icon -->
        <mj-image width="32px" src="https://cdn-icons-png.flaticon.com/512/145/145812.png"></mj-image>
      </mj-column>
      <mj-column></mj-column>
      <mj-column></mj-column>
    </mj-section>
    <mj-section background-color="#D9E2EC" padding="0px">
      <mj-column>
				<mj-text color="#102A43">Text(pt): Exemplo do texto em Portugues, e preciso traduzir</mj-text>
				<mj-text color="#102A43">Translated: Nice translation, everything good, we can read, life's nice</mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="0px 0px">
      <mj-column>
        <mj-divider border-width="1px" border-color="lightgrey" padding="0px" />
      </mj-column>
    </mj-section>
    <mj-raw>
      <!-- Result #2 -->
    </mj-raw>
    <mj-section background-color="#F0F4F8" padding="0px">
      <mj-column>
        <mj-text mj-class="subheader" color="#102A43">2021-01-03, 06:00:00</mj-text>
      </mj-column>
      <mj-column>
        <!-- https://www.flaticon.com/search?word=twitter&type=icon -->
        <mj-image width="32px" src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"></mj-image>
      </mj-column>
      <mj-column></mj-column>
      <mj-column></mj-column>
    </mj-section>
    <mj-section background-color="#F0F4F8" padding="0px">
      <mj-column>
				<mj-text color="#102A43">Text(pt): Outro exemplo do texto em Portugues, e preciso traduzir</mj-text>
				<mj-text color="#102A43">Translated: Another nice translation, everything good, we can read, life's nice</mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="0px 0px">
      <mj-column>
        <mj-divider border-width="1px" border-color="lightgrey" padding="0px" />
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
		`;
