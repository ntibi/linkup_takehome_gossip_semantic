import { mapSources } from "./mapper.js";
import { fetchDocuments } from "./documents.js";
import { connect } from "../db/index.js";

async function main() {
	let db = await connect();

	console.log("starting sitemap mapping");
	await mapSources(db);
	console.log("updated sitemaps mapping");

	console.log("starting to fetch documents");
	await fetchDocuments(db);
	console.log("fetched documents");
}

main();
