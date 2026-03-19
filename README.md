# vaishnavsm.com

Static Astro site for `vaishnavsm.com`.

## Local development

```sh
bun install
bun dev
```

Other useful commands:

- `bun run build` builds the production site into `dist/`
- `bun run preview` serves the built output locally
- `bun run verify:posts` checks that every legacy post in `../posts` exists in `src/content/posts` and in the built site

## GitHub Pages

This repo includes [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the site on pushes to `main` and deploys it with GitHub Pages.

Repository setup still required on GitHub:

1. Open `Settings -> Pages`
2. Under `Build and deployment`, set `Source` to `GitHub Actions`
3. If you want the site to publish at `https://vaishnavsm.com`, set `Custom domain` to `vaishnavsm.com` and configure the matching DNS records with your domain provider

The current Astro config is already set for the custom domain:

- `site: 'https://vaishnavsm.com'`
- no `base`, which is correct for a root-domain Pages deployment
