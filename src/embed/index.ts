import { FeatureExtractionPipeline, pipeline, Tensor, AutoTokenizer } from "@huggingface/transformers";
import type { QdrantClient } from "@qdrant/js-client-rest";
import type { Db } from "mongodb";

// TODO should be in a shared configuration (see comment in src/crawler/config.ts)
const MAX_EMBEDDING_SIZE = 512;
const OVERLAP = 200;


function tokenize(input: string): string[] {
	return input.split(/\s+/).filter(token => token.length > 0);
}

// TODO test this
function chunkTokens(tokens: string[], max_embedding: number, overlap: number): string[][] {
	const chunks: string[][] = [];
	let start = 0;

	while (start < tokens.length) {
		const end = Math.min(start + max_embedding, tokens.length);
		chunks.push(tokens.slice(start, end));
		if (end === tokens.length) break;
		start += max_embedding - overlap;
	}

	return chunks;
}

function poolEmbeddings(embeddings: Tensor): number[] {
	let [n_embeddings, n_tokens, size] = embeddings.dims;
	const merged = new Array(size).fill(0);

	if (!n_embeddings || !n_tokens || !size) {
		console.warn("invalid embeddings dimensions");
		return [];
	}

	for (let i = 0; i < n_embeddings; i++) {
		for (let j = 0; j < n_tokens; j++) {
			for (let k = 0; k < size; k++) {
				merged[k] += embeddings.data[i * n_tokens * size + j * size + k];
			}
		}
	}

	for (let i = 0; i < size; i++) {
		merged[i] /= (n_embeddings * n_tokens);
	}

	return merged;
}

export async function generateEmbedding(embedder: FeatureExtractionPipeline, input: string): Promise<number[]> {
	let tokenized = chunkTokens(tokenize(input), MAX_EMBEDDING_SIZE, OVERLAP).map(chunk => chunk.join(" "));
	let embeddings = await embedder(tokenized);
	return poolEmbeddings(embeddings);
}

export async function getPipeline() {
	return await pipeline("feature-extraction", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2");
}

export async function generateEmbeddings(db: Db, vectorDB: QdrantClient) {
	const embedder = await getPipeline();
	let documents = db.collection("documents");

	for await (const document of documents.find()) {
		// TODO ideally we would stream only new documents
		// with a flag in the DB
		// or via subscribing to a message queue
		if ((await vectorDB.retrieve("documents", { ids: [document.site_uuid] })).length > 0) {
			let a = await vectorDB.retrieve("documents", { ids: [document.site_uuid] });
			continue;
		}

		let vector = await generateEmbedding(embedder, document.content);
		if (vector.length) {
			console.log(`generated embedding for document ${document.site_uuid}`);
			await vectorDB.upsert("documents", {
				points: [{ id: document.site_uuid, vector, payload: { content: document.content } }],
			});
		}
	}
}
