import React, { useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { useLocationChanged } from "@src/shared/lib/react";
import { BannerSection } from "./sections/BannerSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { PricingSection } from "./sections/PricingSection";
import { FaqSection } from "./sections/FAQSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { colors } from "@src/shared/style/colors";

// ++++++++
// + PAGE +
// ++++++++

const MainContainer = styled.div`
  background-color: ${colors.neutral.light3};
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const LandingPage: React.FC = () => {
  const history = useHistory();

  const howItWorksRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
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
      case "#features": {
        scrollToRef(featuresRef);
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
      <BannerSection />
      <div ref={howItWorksRef}>
        <HowItWorksSection />
      </div>
      <div ref={featuresRef}>
        <FeaturesSection />
      </div>
      <div ref={pricingRef}>
        <PricingSection />
      </div>
      <div ref={faqRef}>
        <FaqSection
          questions={[
            {
              question: "How often are the keywords search?",
              answer:
                "It depends on the social media platform, but for most, it’s every 5 minutes.",
            },
          ]}
        />
      </div>
    </MainContainer>
  );
};
