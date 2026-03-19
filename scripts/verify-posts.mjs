import { readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const legacyDir = path.join(root, '..', 'posts');
const contentDir = path.join(root, 'src', 'content', 'posts');
const distDir = path.join(root, 'dist');

const legacyPosts = await listMarkdownBasenames(legacyDir);
const contentPosts = await listMarkdownBasenames(contentDir);
const builtPosts = await listBuiltPosts(distDir);

assertSame('legacy', legacyPosts, 'content', contentPosts);
assertSame('legacy', legacyPosts, 'dist', builtPosts);

console.log(`Verified ${legacyPosts.length} posts: legacy, content, and dist are in sync.`);

async function listMarkdownBasenames(directory) {
	const entries = await readdir(directory, { withFileTypes: true });

	return entries
		.filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
		.map((entry) => entry.name.slice(0, -3))
		.sort();
}

async function listBuiltPosts(directory) {
	const entries = await readdir(directory, { withFileTypes: true });

	return entries
		.filter(
			(entry) =>
				entry.isDirectory() &&
				/^\d{4}-\d{2}-\d{2}-/.test(entry.name),
		)
		.map((entry) => entry.name)
		.sort();
}

function assertSame(leftLabel, left, rightLabel, right) {
	const onlyLeft = left.filter((item) => !right.includes(item));
	const onlyRight = right.filter((item) => !left.includes(item));

	if (onlyLeft.length === 0 && onlyRight.length === 0) {
		return;
	}

	if (onlyLeft.length > 0) {
		console.error(`Only in ${leftLabel}: ${onlyLeft.join(', ')}`);
	}

	if (onlyRight.length > 0) {
		console.error(`Only in ${rightLabel}: ${onlyRight.join(', ')}`);
	}

	process.exit(1);
}
