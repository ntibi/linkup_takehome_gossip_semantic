import { QdrantClient } from "@qdrant/js-client-rest";

export async function connect() {
	const client = new QdrantClient({ url: "http://localhost:6333" });

	try {
		await client.createCollection("documents", {
			vectors: {
				// TODO
				// used model and its vector size should be in a shared configuration (see comment in src/crawler/config.ts)
				size: 384,
				distance: "Cosine",
			}
		});
	} catch (e: unknown) {
		// 409 = collection already exists
		if ((e as { status?: number }).status !== 409) {
			throw e;
		}
	}

	return client;
}

