import type { Tensor } from "@huggingface/transformers";

export function tokenize(input: string): string[] {
	return input.split(/\s+/).filter(token => token.length > 0);
}

export function chunkTokens(tokens: string[], max_embedding: number, overlap: number): string[][] {
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

export function poolEmbeddings(embeddings: Tensor): number[] {
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

