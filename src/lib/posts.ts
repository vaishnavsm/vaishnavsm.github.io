import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export type TagInfo = {
	name: string;
	slug: string;
	posts: Post[];
};

const POST_ID_PATTERN = /^(\d{4})-(\d{2})-(\d{2})-/;

export async function getAllPosts(): Promise<Post[]> {
	return sortPosts(await getCollection('posts'));
}

export function sortPosts(posts: Post[]): Post[] {
	return [...posts].sort((left, right) => getPostDate(right).valueOf() - getPostDate(left).valueOf());
}

export function getPostDate(post: Post): Date {
	const match = post.id.match(POST_ID_PATTERN);

	if (!match) {
		throw new Error(`Post ID "${post.id}" does not begin with a date prefix.`);
	}

	const [, year, month, day] = match;
	return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

export function formatLongDate(date: Date): string {
	return new Intl.DateTimeFormat('en-GB', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(date);
}

export function formatShortDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

export function getPostUrl(post: Post): string {
	return `/${post.id}/`;
}

export function slugifyTag(tag: string): string {
	return tag
		.toLowerCase()
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function getAllTags(posts: Post[]): TagInfo[] {
	const groupedTags = new Map<string, Post[]>();

	for (const post of posts) {
		for (const tag of post.data.tags) {
			const taggedPosts = groupedTags.get(tag) ?? [];
			taggedPosts.push(post);
			groupedTags.set(tag, taggedPosts);
		}
	}

	return Array.from(groupedTags.entries())
		.map(([name, taggedPosts]) => ({
			name,
			slug: slugifyTag(name),
			posts: sortPosts(taggedPosts),
		}))
		.sort((left, right) => left.name.localeCompare(right.name));
}

export function getPostDescription(post: Post): string {
	return post.data.subtitle ?? getMarkdownExcerpt(post.body);
}

function getMarkdownExcerpt(body: string): string {
	const normalized = body.replace(/\r\n/g, '\n').replace(/```[\s\S]*?```/g, '\n');
	const blocks = normalized.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);

	for (const block of blocks) {
		if (/^({%|{{|!\[|<img\b|#)/.test(block)) {
			continue;
		}

		const text = block
			.replace(/\\\n/g, ' ')
			.replace(/\n/g, ' ')
			.replace(/!\[[^\]]*]\([^)]+\)/g, '')
			.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
			.replace(/<[^>]+>/g, '')
			.replace(/[`*_>#]/g, '')
			.replace(/\s+/g, ' ')
			.trim();

		if (text) {
			return text;
		}
	}

	return '';
}
