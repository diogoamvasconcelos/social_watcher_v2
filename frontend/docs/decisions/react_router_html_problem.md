# Problem

- urls that differ from the root, get a 403 error when the url is manually editted or page refreshed

# Solutions

- https://stackoverflow.com/questions/27928372/react-router-urls-dont-work-when-refreshing-or-writing-manually?rq=1

- Optimal solution: Isomorphic (good for SEO)
- current solution: Catch-all (send `/*` to index.html), not good for SEO but easy and can be improved
  - https://stackoverflow.com/questions/16267339/s3-static-website-hosting-route-all-paths-to-index-html
  - add a `custom_error_response` to `aws_cloudfront_distribution`
