import { MongoClient, Db } from "mongodb";

// TODO
// why mongodb ?
// because it's easy to set up and use
//
// in a real world prototype (with more time to spend on it)
// id probably use a transactional DB for the metadata (sources, sitemaps, ...etc)
// distributed fs/db for the raw documents

const URL = "mongodb://root:gossipsemantic@localhost:27017";
const CLIENT = new MongoClient(URL);

const dbName = "gossip_semantic";

export async function connect(): Promise<Db> {
	try {
		await CLIENT.connect();
		console.log(`connected successfully to server ${URL}`);
	} catch (err) {
		console.error("connection to database failed", err);
		console.error("make sure a mongo instance is running on localhost:27017");
		console.error("you can use the following command to start a mongo instance in a docker container:");
		console.error("docker compose up -d");
		throw err;
	}

	return CLIENT.db(dbName);
}
