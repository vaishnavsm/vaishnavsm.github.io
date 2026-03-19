import type { IconName } from './lib/icons';

export const SITE_TITLE = 'Vaishnav Sreekanth Menon';
export const SITE_DESCRIPTION = 'Personal website of Vaishnav Sreekanth Menon.';
export const SITE_URL = 'https://vaishnavsm.com';
export const SITE_AUTHOR = 'Vaishnav Sreekanth Menon';
export const SITE_EMAIL = 'hey@vaishnavsm.com';
export const TWITTER_HANDLE = '@vaishnavsm_';

export const HOME_LINKS = [
	{ label: 'Tech', href: '/tags/tech/' },
	{ label: 'Thoughts', href: '/tags/thoughts/' },
	{ label: 'Poetry', href: '/tags/poetry/' },
	{ label: 'Schedule A Call', href: 'https://calendly.com/vaishnavsm/catch-up' },
] as const;

export const SOCIAL_LINKS: ReadonlyArray<{ label: string; href: string; icon: IconName }> = [
	{ label: 'Email', href: `mailto:${SITE_EMAIL}`, icon: 'mail' },
	{ label: 'GitHub', href: 'https://github.com/vaishnavsm', icon: 'github' },
	{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/vaishnavsm/', icon: 'linkedin' },
	{ label: 'Instagram', href: 'https://www.instagram.com/_vaishnavsm_/', icon: 'instagram' },
	{ label: 'Twitter', href: 'https://twitter.com/vaishnavsm_', icon: 'twitter' },
	{ label: 'RSS', href: '/feed.xml', icon: 'rss' },
];
