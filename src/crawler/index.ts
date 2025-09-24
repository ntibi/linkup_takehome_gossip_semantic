import { mapSources } from "./mapper.js";
import { fetchDocuments } from "./documents.js";
import { connect as connectDb } from "../db/index.js";
import { connect as connectVectorDb } from "../vector/index.js";
import { generateEmbeddings } from "../embed/index.js";

// TODO
// those tasks could all be performed in parallel
// the easiest way would be to have all of those modules be
//   different workers with their inputs and outputs being message queues (eg: rabbitmq, kafka, PubSub ...etc)
// but for simplicity we execute them sequentially here
async function main() {
	// TODO
	// id rather use dependency injection than importing the db connection directly in each module and passing it around
	// I like NestJS for that, but it's a lot of boilerplate for a project this size
	let db = await connectDb();
	let vectorDb = await connectVectorDb();

	console.log("starting sitemap mapping");
	await mapSources(db);
	console.log("updated sitemaps mapping");

	console.log("starting to fetch documents");
	await fetchDocuments(db);
	console.log("fetched documents");

	await generateEmbeddings(db, vectorDb);
}

main();
