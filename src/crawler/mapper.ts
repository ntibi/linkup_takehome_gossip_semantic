import Sitemapper from "sitemapper";
import { config, type SourceConfig } from "./config.js";
import * as path from "path";
import type { Db } from "mongodb";
import { v4 as uuidv4 } from 'uuid';

async function map(source: SourceConfig) {
	// TODO
	// if sitemaps got really big, we could stream them instead of loading them fully in memory
	const siteMapper = new Sitemapper({
		url: path.join(source.url, source.sitemap),
		// TODO:  move those to values to config defaults + allow override 
		timeout: 15000,
		concurrency: 10,
	});

	return siteMapper.fetch();
}

// TODO
// v1:
// do it in parallel over multiple sites
// to spread out the requests and avoid potential rate limiting
//
// v2:
// do it in a distributed way over multiple machines
// centralize the queue of urls to explore
//
// if rate limiting is still an issue, assign different outbound IPs to different workers
// if speed is an issue, add more workers
export async function mapSources(db: Db) {
	let db_sites = db.collection("sites");

	for (const source of config.sources) {
		let found = await db_sites.countDocuments({ source: source.name });

		// TODO more granularity, we could want to partially crawl a source according to last crawl date, lastmod, ...etc
		if (found && found > 0) {
			console.log(`using DB data for ${source.name}: ${found} sites`);
			continue;
		}

		let { errors, sites } = await map(source);
		console.log(`mapped ${source.name}: ${sites?.length} sites, ${errors?.length} errors`);
		// TODO
		// handle errors
		// log them, persist the logs somewhere (clickhouse, snowflake, cloud storage, ...), directly from the code or using a log collector
		// queue the failed urls for retry, while keeping count of retries attempted
		if (errors.length > 0) {
			console.warn(`errors while mapping source ${source.name}:`);
			// just show the first error to avoid console spamming
			console.warn(errors[0]);
		}

		for (const site of sites) {
			// TODO
			// - batch insert for performance
			// - check for duplicates (maybe the package i use already does that)
			// - add more metadata (ie: lastmod, changefreq, priority), and use them to prioritize fetching
			await db_sites.insertOne({
				uuid: uuidv4(),
				created_at: new Date(),
				updated_at: new Date(),
				source: source.name,
				url: site,
			});
		}
		console.log(`persisted ${sites.length} sites for source ${source.name}`);
	}
}
