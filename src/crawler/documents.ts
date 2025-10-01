import { Readability } from "@mozilla/readability";
import type { Db } from "mongodb";
import axios from "axios";
import { JSDOM, VirtualConsole } from "jsdom";

export async function fetchDocuments(db: Db) {
	let sites = db.collection("sites");
	let documents = db.collection("documents");

	const cursor = sites.find();

	// to skip errors from jsdom
	// https://stackoverflow.com/questions/69906136/console-error-error-could-not-parse-css-stylesheet
	const virtualConsole = new VirtualConsole();
	virtualConsole.on("error", () => { });

	for await (const site of cursor) {
		// TODO
		// this is not a great design, we have to do 1 request per site
		// ideally we would stream only new sites
		//   using metadata from the DB
		//   or a message queue
		const exists = await documents.findOne({ site_uuid: site.uuid });
		if (exists) {
			continue;
		}

		let res;
		try {
			res = await axios.get(site.url);
		} catch (e) {
			// TODO error handling / logging (see comment in mapper.ts)
			console.warn(`could not fetch ${site.url}: ${e}`);
			continue;
		}

		// https://github.com/mozilla/readability?tab=readme-ov-file#nodejs-usage

		// TODO went the easy way here
		// there are a lot of ways we could sanitize the input
		const dom = new JSDOM(res.data, { virtualConsole });
		const content = new Readability(dom.window.document).parse();

		if (!content) {
			// TODO persist logs (see comment in mapper.ts)
			console.warn(`could not extract content from ${site.url}`);
			continue;
		}
		await documents.insertOne({
			site_uuid: site.uuid,
			title: content.title,
			content: content.textContent,
			excerpt: content.excerpt,
			lang: content.lang,
		});
		console.log(`fetched and persisted document from ${site.source}:${site.url}`);
	}
}
