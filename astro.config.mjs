// @ts-check

import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://vaishnavsm.com',
	output: 'static',
	integrations: [sitemap()],
	markdown: {
		syntaxHighlight: 'prism',
	},
});
