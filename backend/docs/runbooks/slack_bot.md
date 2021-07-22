## Refs:

- https://api.slack.com/authentication/basics

## Step-by-step:

1. create new app: https://api.slack.com/apps
2. add bot functionality:
   - Basic Information -> Add features and functionality -> Bots
   - add scopes:
     - chat:write
3. install in your workspace (OAuth & Permissions tab)
   - you will get a bot token :)
4. add bot to channel
   - do a "@botname"
5. get the channel id or the name (also works and easier):
   - right click -> copy link -> extract from url the id
6. Use the token and the channel id/name in the notification config!
