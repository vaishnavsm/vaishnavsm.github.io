export type IconName = 'mail' | 'github' | 'linkedin' | 'instagram' | 'twitter' | 'rss';

export const ICONS: Record<IconName, string> = {
	mail: '<path d="M4 4h16v16H4z"></path><polyline points="22 6 12 13 2 6"></polyline>',
	github:
		'<path d="M9 19c-5 1.5-5-2.5-7-3"></path><path d="M15 22v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 19.1 4.77 5.07 5.07 0 0 0 19 1s-1.18-.35-3.9 1.48a13.38 13.38 0 0 0-7 0C5.38.65 4.2 1 4.2 1a5.07 5.07 0 0 0-.1 3.77 5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 8.1 18.13V22"></path>',
	linkedin:
		'<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle>',
	instagram:
		'<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
	twitter:
		'<path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 12 7.5v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>',
	rss: '<path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle>',
};
