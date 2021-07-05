# Phase 0:

- add `notifer client` to `src/lib/<new_notifier>
  - with some flavour of a `sendMessage` method

# Phase 1:

- add "searchObject" data (notificationData) to `src/domain/models/notificationJob.ts`
- add `<new_notifier>NotificatonJob` as well on the same file

# Phase 2:

- add new notifier to `src/domain/models/notificationMedium.ts`

- complete switch cases where `notificationMediums` is used

# Phase 3:

- add `Notify<new_notifier>` lambda handler
