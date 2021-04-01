# Design Doc

- arch diagram: https://app.diagrams.net/?src=about#G1YHbgpcvR9pP_tzMrNsFfxIuAGx8_yU4c

## Tables: Data Model

### KeywordsTable

- pk: keyword (lowercase enforced) & sk: socialMedia

  - Allow activating/deactivating a socialMedia search on a keyword (triggered by event from UsersTable1)

- gsi1pk: socialMedia|active (sparse index) & gsi1sk: keyword

  - Allow query for active keywords of a certain social media (done by the dispatchSearchJobs lambda)

### UsersTable

- pk: userId & sk: custom

  - two types of objects in the "sk":
    - "data"|type : used to store data like
      - cognito data (token, etc)
      - subscription data (paid|trial|special, nofKeywordsAllowed|unlimited)
      - profile data (name, email, payment config)
      - query: by FE for obvious reasons
    - "keyword"|keyword|socialmedia: metadata about a keyword social media combo
      - slack/discord/teams integration data
      - some custom metadata about search result (include translation, nof followers, etc)
      - queries:
        - by search endpoint to check if user is allowed to search for certain keyword

- gsi1pk: "keyword"|keyword|socialmedia & gsi1sk: userId (flipped primary key)
  - get all users metadata about a certain keyword/socialmedia (done by dispatchNotifySocialMediaJobs lambda)

### SearchResultsTable

- pk: socialMedia|resultId & sk: index

  - index can be used to add more aggregated data from some post-processing (not sure what yet)

- gsi1pk: keyword & sk: happened_at
  - could be useful for getting all results for a certain keyword (no use case yet``ß)
