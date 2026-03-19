import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: '**/*.md' }),
	schema: () =>
		z.object({
			title: z.string(),
			subtitle: z.string().optional(),
			tags: z.array(z.string()),
		}),
});

export const collections = { posts };
