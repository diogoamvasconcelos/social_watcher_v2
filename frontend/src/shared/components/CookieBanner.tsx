import React from "react";
import CookieConsent from "react-cookie-consent";
import { TERMS_AND_CONDITIONS_PATH } from "../data/paths";
import { colors } from "../style/colors";
import { fontSize } from "../style/fonts";
import { radius, size } from "../style/sizing";

export const CookieBanner: React.FC = () => {
  return (
    <CookieConsent
      buttonText="Got it!"
      cookieName="ConsentCookie"
      style={{
        background: colors.neutral.dark3,
        fontSize: fontSize.size14px,
      }}
      buttonStyle={{
        background: colors.primary.medium2,
        color: colors.neutral.light3,
        fontSize: fontSize.size18px,
        width: size.size128px,
        borderRadius: radius.size10px,
        padding: `${size.size4px} ${size.size24px}`,
        boxShadow: "0 2px 5px hsla(0, 0%, 0%, .2)",
      }}
      // overlay
    >
      We use cookies to enhance the user experience.{" "}
      <a href={TERMS_AND_CONDITIONS_PATH}>Learn more.</a>
    </CookieConsent>
  );
};
