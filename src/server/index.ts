import express from "express";
import { connect as connectVectorDb } from "../vector/index.js";
import { connect as connectDb } from "../db/index.js";

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
let vectorDb = await connectVectorDb();
let db = await connectDb();

app.get("/search", async (req, res) => {
	// TODO
	// would be cleaner with query params validation (like with express-validator)
	// I didnt do it here because we only have one endpoint with one param
	const query = req.query.q;

	res.send("OK");

});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
