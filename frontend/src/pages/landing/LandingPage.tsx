import React from "react";
import styled from "styled-components";
import Text from "antd/lib/typography/Text";
import logo from "../../../assets/logo-og.jpg";
import Button from "antd/lib/button";
import { SIGNUP_PATH } from "@src/shared/data/paths";
import { useHistory } from "react-router-dom";
import { socialMedias } from "@backend/domain/models/socialMedia";
import { capitalizeWord } from "@src/shared/lib/text";
import {
  getNotificationMediumIcon,
  getReportMediumIcon,
  getSocialMediaIcon,
} from "@src/shared/components/Icons";
import { notificationMediums } from "@backend/domain/models/notificationMedium";
import { reportMediums } from "@backend/domain/models/reportMedium";
import { useRef } from "react";
import { useLocationChanged } from "@src/shared/lib/react";
import { useEffect } from "react";
import Collapse from "antd/lib/collapse/Collapse";

const { Panel } = Collapse;

// ++++++++++
// + Banner +
// ++++++++++

const BannerContainer = styled.div`
  // https://cssgradient.io/
  background: rgb(2, 0, 36);
  background: linear-gradient(
    90deg,
    rgba(2, 0, 36, 1) 0%,
    rgba(9, 121, 113, 1) 22%,
    rgba(184, 238, 233, 1) 100%
  );
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 32px;
`;

const BannerDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
`;

const Banner: React.FC = () => {
  const history = useHistory();

  const handleFreeTrialClicked = () => {
    history.push(SIGNUP_PATH);
  };

  return (
    <BannerContainer>
      <img src={logo} alt="Logo" style={{ maxWidth: "400px" }} />
      <BannerDetailsContainer>
        <Text style={{ maxWidth: "400px" }}>
          Track keywords in the most popular social media platforms.
          <br /> Get real-time notifications when new content is published.
        </Text>
        <Button
          type="primary"
          onClick={handleFreeTrialClicked}
          style={{ width: "200px" }}
        >
          Start free trial
        </Button>
      </BannerDetailsContainer>
    </BannerContainer>
  );
};

// ++++++++++++++++
// + HiW = How it Works +
// ++++++++++++++++

const HiWContainer = styled.div`
  background: aliceblue;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 10px;
`;

const HiWBoxContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 100px;
  justify-content: center;
`;

const HiWBox = styled.div`
  border-radius: 8px;
  border-style: solid;
  border-width: 1px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  align-items: center;
  width: 200px;
`;

const HiW: React.FC = () => {
  return (
    <HiWContainer>
      <Text> How it works</Text>
      <HiWBoxContainer>
        <HiWBox>
          <Text>Social Media Platforms</Text>
          {socialMedias.map((socialMedia) => (
            <HiWListItem
              text={capitalizeWord(socialMedia)}
              Icon={getSocialMediaIcon(socialMedia)}
              key={socialMedia}
            />
          ))}
        </HiWBox>
        <HiWBox>
          <Text>Notification Platforms</Text>
          {notificationMediums.map((notificationMedium) => (
            <HiWListItem
              text={capitalizeWord(notificationMedium)}
              Icon={getNotificationMediumIcon(notificationMedium)}
              key={notificationMedium}
            />
          ))}
          {reportMediums.map((reportMedium) => (
            <HiWListItem
              text={capitalizeWord(reportMedium)}
              Icon={getReportMediumIcon(reportMedium)}
              key={reportMedium}
            />
          ))}
        </HiWBox>
      </HiWBoxContainer>
    </HiWContainer>
  );
};

const HiWListItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
`;

const HiWListItem: React.FC<{ text: string; Icon: React.ReactNode }> = ({
  text,
  Icon,
}) => {
  return (
    <HiWListItemContainer>
      {Icon}
      <Text>{text}</Text>
    </HiWListItemContainer>
  );
};

// +++++++++++
// + Pricing +
// +++++++++++

const PricingContainer = styled.div`
  background: rgb(84, 58, 3);
  background: linear-gradient(
    90deg,
    rgba(84, 58, 3, 1) 0%,
    rgba(190, 146, 19, 1) 29%,
    rgba(244, 242, 211, 1) 100%
  );
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 10px;
`;

const PricingBoxesContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 100px;
  justify-content: center;
`;

const PricingBoxContainer = styled.div`
  border-radius: 8px;
  border-style: solid;
  border-width: 1px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  align-items: center;
  width: 200px;
`;

const Pricing: React.FC = () => {
  return (
    <PricingContainer>
      <Text>Pricing</Text>
      <PricingBoxesContainer>
        <PricingBoxContainer>
          <Text>Free Trial</Text>
          <Text>1 keyword</Text>
          <Text>30 days</Text>
          <Text>No credit card</Text>
        </PricingBoxContainer>
        <PricingBoxContainer>
          <Text>Monthly</Text>
          <Text>3$ per keyword</Text>
        </PricingBoxContainer>
      </PricingBoxesContainer>
    </PricingContainer>
  );
};

// +++++++
// + FAQ +
// +++++++

const FAQContainer = styled.div`
  background: aliceblue;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 10px;
`;

const FAQListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

type FAQQuestion = {
  question: string;
  answer: string;
};

const FAQ: React.FC<{ questions: FAQQuestion[] }> = ({ questions }) => {
  const handleContactUsButtonClicked = () => {
    console.log("handleContactUsButtonClicked");
  };
  return (
    <FAQContainer>
      <Text>FAQ - Frequenlty asked Questions</Text>
      <FAQListContainer>
        <Collapse ghost style={{ textAlign: "center" }}>
          {questions.map((question) => (
            <Panel header={question.question} key={question.question}>
              <Text>{question.answer}</Text>
            </Panel>
          ))}
        </Collapse>
      </FAQListContainer>
      <Text>Have more questions?</Text>
      <Button onClick={handleContactUsButtonClicked}> Contact us</Button>
    </FAQContainer>
  );
};

// ++++++++
// + PAGE +
// ++++++++

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const LandingPage: React.FC = () => {
  const history = useHistory();

  const howItWorksRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const scrollToHash = (hash: string) => {
    const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
      if (ref.current) {
        ref.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    switch (hash) {
      case "#how-it-works": {
        scrollToRef(howItWorksRef);
        break;
      }
      case "#pricing": {
        scrollToRef(pricingRef);
        break;
      }
      case "#faq": {
        scrollToRef(faqRef);
        break;
      }
    }
  };

  useLocationChanged((location) => scrollToHash(location.hash));
  useEffect(() => {
    // Hacky way to scroll on page reload, but need to wait for the browser scroll restoration to finish
    setTimeout(() => scrollToHash(history.location.hash), 300);
  });

  return (
    <MainContainer>
      <Banner />
      <div ref={howItWorksRef}>
        <HiW />
      </div>
      <div ref={pricingRef}>
        <Pricing />
      </div>
      <div ref={faqRef}>
        <FAQ
          questions={[
            {
              question: "How often are the keywords search?",
              answer:
                "It depends on the social media platform, but usually every minute.",
            },
          ]}
        />
      </div>
    </MainContainer>
  );
};
