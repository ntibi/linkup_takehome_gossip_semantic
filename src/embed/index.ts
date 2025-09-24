import { FeatureExtractionPipeline, pipeline, Tensor } from "@huggingface/transformers";
import type { QdrantClient } from "@qdrant/js-client-rest";
import type { Db } from "mongodb";

export async function generateEmbedding(embedder: FeatureExtractionPipeline, input: string): Promise<number[]> {
	let embedding = await embedder(input);
	console.log(embedding);
	return [1];
}

export async function getPipeline() {
	return await pipeline("feature-extraction", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2");
}

export async function generateEmbeddings(db: Db, vectorDB: QdrantClient) {
	const embedder = await getPipeline();
	let documents = db.collection("documents");

	for await (const document of documents.find()) {
		let embedding = await generateEmbedding(embedder, document.content);
		//await vectorDB.upsert("documents", embedding);
	}
}
