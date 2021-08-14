import React from "react";
import { ConfigWidgetProps } from "../SearchObjectConfigPage";
import Text from "antd/lib/typography/Text";
import { SocialMedia, socialMedias } from "@backend/domain/models/socialMedia";
import styled from "styled-components";
import { capitalizeWord } from "../../../../shared/lib/text";
import Switch from "antd/lib/switch";
import { useAppDispatch } from "../../../../shared/store";
import { updateSearchData } from "../searchObjectConfigState";
import { SearchObjectUserDataDomain } from "@backend/domain/models/userItem";

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

// TODO: add reddit custom widget (over_18?)

export const SocialMediasConfigWidget: React.FC<ConfigWidgetProps> = ({
  searchObject,
}) => {
  const dispatch = useAppDispatch();

  const handleEnabledStatusChanged = (
    socialMedia: SocialMedia,
    val: boolean
  ) => {
    dispatch(
      updateSearchData({
        ...searchObject.searchData,
        [socialMedia]: {
          ...searchObject.searchData[socialMedia],
          enabledStatus: val ? "ENABLED" : "DISABLED",
        },
      })
    );
  };

  return (
    <MainContainer>
      <Text>Select the Social Medias the keyword will be searched:</Text>
      <SocialMediasContainer>
        {socialMedias.map((socialMedia) => {
          return (
            <SocialMediaContainer key={socialMedia}>
              <SocialMediaEnabledSwitch
                socialMedia={socialMedia}
                searchData={searchObject.searchData}
                onChange={(val) => handleEnabledStatusChanged(socialMedia, val)}
              />
              {socialMedia === "reddit" ? (
                <RedditCustomOptions
                  redditSearchData={searchObject.searchData.reddit}
                  onOver18Change={(val) => {
                    dispatch(
                      updateSearchData({
                        ...searchObject.searchData,
                        reddit: {
                          ...searchObject.searchData.reddit,
                          over18: val,
                        },
                      })
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
  return (
    <RowDiv>
      <Text style={{ gridColumnStart: "1" }}>
        {capitalizeWord(socialMedia)}
      </Text>
      <Switch
        style={{ gridColumnStart: "2", justifySelf: "end" }}
        defaultChecked
        checked={searchData[socialMedia].enabledStatus === "ENABLED"}
        onChange={onChange}
      />
    </RowDiv>
  );
};

// ++++++++++
// + REDDIT +
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
        defaultChecked
        checked={redditSearchData.over18}
        onChange={onOver18Change}
      />
    </RowDiv>
  );
};
