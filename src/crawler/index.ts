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
	const db = await connectDb();
	const vectorDb = await connectVectorDb();

	console.log("starting sitemap mapping");
	await mapSources(db);
	console.log("updated sitemaps mapping");

	// i added a max document indexing limit for dev purposes
	// mapping sources takes a few seconds
	// generating embeddings is fast
	// but fetching hundreds of thousands documents takes a while, and it's not needed for a proof of concept
	console.log("starting to fetch documents");
	await fetchDocuments(db, 100);
	console.log("fetched documents");

	console.log("starting to generate embeddings");
	await generateEmbeddings(db, vectorDb);
	console.log("generated embeddings");
}

main();
