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
		// TODO
		// i commented this source
		// because the sitemap is huge (>200k urls)
		// so it doesnt take too much time
		// i could have added a max limit to the sitemap parser
		// or tweaked the concurrency settings to go faster while still avoiding rate limiting
		// but i preferred to keep things simple and have a source that gets crawled in a reasonable time out of the box
		// feel free to uncomment and try it out if you want to (it takes ~1min)
		// and once the sitemap is fully explored, it's persisted anyway

		//{
		//name: "public",
		//url: "https://www.public.fr",
		//sitemap: "/sitemap.xml",
		//},
		{
			name: "vsd",
			url: "https://vsd.fr",
			sitemap: "/sitemap.xml",
		},
	],
}

