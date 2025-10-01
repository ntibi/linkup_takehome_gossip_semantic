import { FeatureExtractionPipeline, pipeline, } from "@huggingface/transformers";
import type { QdrantClient } from "@qdrant/js-client-rest";
import type { Db } from "mongodb";
import { poolEmbeddings, chunkTokens, tokenize } from "./utils.js";

// TODO should be in a shared configuration (see comment in src/crawler/config.ts)
const MAX_EMBEDDING_SIZE = 512;
const OVERLAP = 200;


export async function generateEmbedding(embedder: FeatureExtractionPipeline, input: string): Promise<number[]> {
	const tokenized = chunkTokens(tokenize(input), MAX_EMBEDDING_SIZE, OVERLAP).map(chunk => chunk.join(" "));
	const embeddings = await embedder(tokenized);
	return poolEmbeddings(embeddings);
}

export async function getPipeline() {
	return await pipeline("feature-extraction", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2");
}

export async function generateEmbeddings(db: Db, vectorDB: QdrantClient) {
	const embedder = await getPipeline();
	const documents = db.collection("documents");

	for await (const document of documents.find()) {
		// TODO ideally we would stream only new documents
		// with a flag in the DB
		// or via subscribing to a message queue
		if ((await vectorDB.retrieve("documents", { ids: [document.site_uuid] })).length > 0) {
			continue;
		}

		const vector = await generateEmbedding(embedder, document.content);
		if (vector.length) {
			console.log(`generated embedding for document ${document.site_uuid}`);
			await vectorDB.upsert("documents", {
				points: [{ id: document.site_uuid, vector, payload: { content: document.content } }],
			});
		}
	}
}
