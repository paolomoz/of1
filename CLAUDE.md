# Project Structure

- `stardust/` — Design artifacts (not deployed). Brand and design defined with the paolomoz/stardust skills.
- `deploy/` — Static resources to be deployed to the site root.

# Deployment

- Hosted on Cloudflare Pages. Config in `wrangler.toml`.
- Publish directory: `deploy/` (set via `pages_build_output_dir`).
- Deploy with `npx wrangler pages deploy` or push to main (if CI is connected).
