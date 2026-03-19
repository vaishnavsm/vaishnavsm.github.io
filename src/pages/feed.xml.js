import { buildFeed } from '../lib/feed';

export async function GET(context) {
	return buildFeed(context);
}
