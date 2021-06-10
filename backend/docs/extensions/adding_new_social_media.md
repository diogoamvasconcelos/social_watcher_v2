## Phase 0:

- test new social media so that you have a good idea of:

  - how the data will look like (search result)
  - how the client will be

- add a client and it's types to the `src/lib`

## Phase 1:

- Add new social media to: `src/domain/models/socialMedia.ts`
- propagate all types fixes required for this

- add `build<newSocialMedia>SearchResult` to `test/lib/builders`
- use this to builder on some tests

  - TODO: extend this part to be more specific

- deploy

## Phase 2:

- Allow the FE to enable this socialMedia on a keyword
-
