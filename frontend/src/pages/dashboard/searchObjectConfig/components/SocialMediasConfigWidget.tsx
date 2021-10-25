import React, { useEffect } from "react";
import { ConfigWidgetProps } from "../SearchObjectConfigPage";
import Text from "antd/lib/typography/Text";
import { SocialMedia, socialMedias } from "@backend/domain/models/socialMedia";
import styled from "styled-components";
import { capitalizeWord } from "../../../../shared/lib/text";
import Switch from "antd/lib/switch";
import { useAppDispatch } from "../../../../shared/store";
import { updateSearchData } from "../searchObjectConfigState";
import { SearchObjectUserDataDomain } from "@backend/domain/models/userItem";
import { deepmergeSafe } from "@diogovasconcelos/lib";
import _some from "lodash/some";
import Tooltip from "antd/lib/tooltip";
import InfoCircleOutlined from "@ant-design/icons/lib/icons/InfoCircleOutlined";

// ++++++++++
// + WIDGET +
// ++++++++++

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 8px;
`;

const SocialMediasContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-style: solid;
  border-width: 1px;
  border-radius: 4px;
  padding: 8px 16px;
  max-width: 200px;
`;

const SocialMediaContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const RowDiv = styled.div`
  display: grid;
  grid-template-columns: 1fr 40px;
`;

const LabelDiv = styled.div`
  grid-column-start: 1;
  display: flex;
  gap: 4px;
  align-items: center;
`;

export const SocialMediasConfigWidget: React.FC<ConfigWidgetProps> = ({
  searchObject,
  setStepState,
}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const hasAtLeastOneSocialMedia = _some(
      socialMedias.map(
        (socialMedia) =>
          searchObject.searchData[socialMedia].enabledStatus === "ENABLED"
      )
    );

    if (hasAtLeastOneSocialMedia) {
      setStepState({ status: "finish", errorMessage: undefined });
    } else {
      setStepState({ status: "error", errorMessage: "nothing to search" });
    }
  }, [searchObject.searchData]);

  const handleEnabledStatusChanged = (
    socialMedia: SocialMedia,
    val: boolean
  ) => {
    dispatch(
      updateSearchData(
        deepmergeSafe(searchObject.searchData, {
          [socialMedia]: { enabledStatus: val ? "ENABLED" : "DISABLED" },
        })
      )
    );
  };

  return (
    <MainContainer>
      <Text>Select the Social Medias the keyword will be searched:</Text>
      <SocialMediasContainer>
        {socialMedias.map((socialMedia) => {
          return (
            <SocialMediaContainer key={socialMedia}>
              {/* common */}
              <SocialMediaEnabledSwitch
                socialMedia={socialMedia}
                searchData={searchObject.searchData}
                onChange={(val) => handleEnabledStatusChanged(socialMedia, val)}
              />
              {/* reddit */}
              {socialMedia === "reddit" ? (
                <RedditCustomOptions
                  redditSearchData={searchObject.searchData.reddit}
                  onOver18Change={(val) => {
                    dispatch(
                      updateSearchData(
                        deepmergeSafe(searchObject.searchData, {
                          reddit: { over18: val },
                        })
                      )
                    );
                  }}
                />
              ) : null}
              {/* hackernews */}
              {socialMedia === "hackernews" ? (
                <HackernewsCustomOptions
                  hackernewsSearchData={searchObject.searchData.hackernews}
                  onFuzzyMatchChange={(val) => {
                    dispatch(
                      updateSearchData(
                        deepmergeSafe(searchObject.searchData, {
                          hackernews: { fuzzyMatch: val },
                        })
                      )
                    );
                  }}
                />
              ) : null}
            </SocialMediaContainer>
          );
        })}
      </SocialMediasContainer>
    </MainContainer>
  );
};

// ++++++++++++++++
// + SOCIAL MEDIA +
// ++++++++++++++++

type SocialMediaEnabledSwitchProps = {
  socialMedia: SocialMedia;
  searchData: SearchObjectUserDataDomain["searchData"];
  onChange: (val: boolean) => void;
};

const SocialMediaEnabledSwitch: React.FC<SocialMediaEnabledSwitchProps> = ({
  socialMedia,
  searchData,
  onChange,
}) => {
  const getTooltip = (socialMedia: SocialMedia) => {
    switch (socialMedia) {
      case "twitter":
        return "Searches hashtags and text in tweets";
      case "reddit":
        return "Searches text in threads and posts";
      case "hackernews":
        return "Searches text posts and comments";
      case "instagram":
        return "Searches for hashtags in comments";
      case "youtube":
        return "Searches for text in video title and descriptions";
    }
  };

  return (
    <RowDiv>
      <LabelDiv>
        <Text>{capitalizeWord(socialMedia)}</Text>
        <Tooltip title={getTooltip(socialMedia)}>
          <InfoCircleOutlined />
        </Tooltip>
      </LabelDiv>
      <Switch
        style={{ gridColumnStart: "2", justifySelf: "end" }}
        checked={searchData[socialMedia].enabledStatus === "ENABLED"}
        onChange={onChange}
      />
    </RowDiv>
  );
};

// ++++++++++
// + Reddit +
// ++++++++++

type RedditCustomOptionsProps = {
  redditSearchData: SearchObjectUserDataDomain["searchData"]["reddit"];
  onOver18Change: (val: boolean) => void;
};

const RedditCustomOptions: React.FC<RedditCustomOptionsProps> = ({
  redditSearchData,
  onOver18Change,
}) => {
  return (
    <RowDiv key="reddit over18" style={{ paddingLeft: "10px" }}>
      <Text style={{ gridColumnStart: "1" }}>Over 18?</Text>
      <Switch
        style={{ gridColumnStart: "2", justifySelf: "end" }}
        checked={redditSearchData.over18}
        onChange={onOver18Change}
        disabled={redditSearchData.enabledStatus === "DISABLED"}
      />
    </RowDiv>
  );
};

// ++++++++++++++
// + Hackernews +
// ++++++++++++++

type HackernewsCustomOptionsProps = {
  hackernewsSearchData: SearchObjectUserDataDomain["searchData"]["hackernews"];
  onFuzzyMatchChange: (val: boolean) => void;
};

const HackernewsCustomOptions: React.FC<HackernewsCustomOptionsProps> = ({
  hackernewsSearchData,
  onFuzzyMatchChange,
}) => {
  return (
    <RowDiv key="hackernews fuzzyMaych" style={{ paddingLeft: "10px" }}>
      <LabelDiv>
        <Text>Fuzzy Match?</Text>
        <Tooltip title="beta version">
          <InfoCircleOutlined />
        </Tooltip>
      </LabelDiv>
      <Switch
        style={{ gridColumnStart: "2", justifySelf: "end" }}
        checked={hackernewsSearchData.fuzzyMatch}
        onChange={onFuzzyMatchChange}
        disabled={hackernewsSearchData.enabledStatus === "DISABLED"}
      />
    </RowDiv>
  );
};
