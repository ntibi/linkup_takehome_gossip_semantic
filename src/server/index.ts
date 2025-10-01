import express from "express";
import { connect as connectVectorDb } from "../vector/index.js";
import { connect as connectDb } from "../db/index.js";
import { generateEmbedding, getPipeline } from "../embed/index.js";

const app = express();
const port = 4000;

app.use(express.json());

// TODO
// we bootstrap the db connections before starting the server
// so we reuse the same connections for all requests
//
// we could also:
// - use a connection pool depending on the db used
// - lazy connect (connect on first request, then reuse it)
// - tie the connections to server health checks
//
// TODO error handling if the connections fail
// add a few retries and log them
// log and exit if we cant connect after a few retries
// inform our orchestration system (health checks, liveness probes, exit codes, ...)
let vectorDb = await connectVectorDb();
let db = await connectDb();

app.get("/search", async (req, res) => {
	// TODO
	// would be cleaner with query params validation (like with express-validator)
	// I didnt do it here because we only have one endpoint with one param
	const query = String(req.query.q);

	const embedder = await getPipeline();
	let documents = db.collection("documents");
	let vector = await generateEmbedding(embedder, query);

	let results = await vectorDb.query("documents", {
		query: vector,
		// TODO
		// limit could be a query param
		limit: 5,
	});

	// TODO
	// log query, number of results, db response time
	// for monitoring and analytics

	let docs_to_fetch = results.points.map(p => p.id);
	let docs = await documents.find({ site_uuid: { $in: docs_to_fetch } }).toArray();
	// for O(1) lookup when building the response
	let docsMap = new Map(docs.map(d => [d.site_uuid, d]));

	res.send({
		found: results.points.length,
		results: results.points.map(({ id, score }) => {
			let dbDoc = docsMap.get(id);
			let doc = dbDoc ? { title: dbDoc.title, excerpt: dbDoc.excerpt } : { title: "Unknown", excerpt: "No excerpt available" };

			return {
				id,
				// TODO
				// keeping the score for front end ordering
				// but it could be an index (0, 1, 2 ...) if we dont want to expose the actual similarity score
				score,
				doc,
			};
		}),
	});
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
