export type SourceConfig = {
	name: string;
	url: string;
	sitemap: string;
}

export type Config = {
	sources: SourceConfig[];
}

// TODO
// went with raw inline JSON because i'm on a schedule
// should be replaced by a proper config system (with a type system, defaults, overrides, ...etc)
// or a kv store (redis, etcd, ...) if the workers were running 24/7 and needed dynamic config updates
export const config: Config = {
	sources: [
		{
			name: "public",
			url: "https://www.public.fr",
			sitemap: "/sitemap.xml",
		},
		{
			name: "vsd",
			url: "https://vsd.fr",
			sitemap: "/sitemap.xml",
		},
	],
}

