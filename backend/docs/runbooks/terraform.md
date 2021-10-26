## Remove resource manually (surgery)

in a `tf/` folder, run `terrafrom state list` to see the name of the resource and `terrafrom state rm <resource_name>` to remove it

## For multiple envs, use terraform workspaces

- https://learn.hashicorp.com/tutorials/terraform/organize-configuration

```
#create 'dev' workspace
terraform workspace new dev

#change to 'dev' workspace
terraform workspace select dev
```

### Current workspaces

`default` - prod
`non-prod` - dev
