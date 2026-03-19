import rss from '@astrojs/rss';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';

import { SITE_AUTHOR, SITE_DESCRIPTION, SITE_EMAIL, SITE_TITLE } from '../consts';
import { getAllPosts, getPostDate, getPostDescription, getPostUrl } from './posts';

const markdownProcessor = createMarkdownProcessor({
	syntaxHighlight: 'prism',
});

export async function buildFeed(context: { site?: URL }) {
	const posts = await getAllPosts();
	const processor = await markdownProcessor;
	const site = context.site;

	const items = await Promise.all(
		posts.map(async (post) => {
			const result = await processor.render(post.body, {
				frontmatter: post.data,
			});
			const content = site ? absolutizeUrls(result.code, site) : result.code;

			return {
				title: post.data.title,
				description: getPostDescription(post),
				link: getPostUrl(post),
				pubDate: getPostDate(post),
				categories: post.data.tags,
				author: `${SITE_EMAIL} (${SITE_AUTHOR})`,
				content,
			};
		}),
	);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items,
	});
}

function absolutizeUrls(html: string, site: URL): string {
	return html.replace(/(src|href)="\/([^"]*)"/g, (_, attribute, path) => {
		const absolute = new URL(`/${path}`, site);
		return `${attribute}="${absolute.href}"`;
	});
}
