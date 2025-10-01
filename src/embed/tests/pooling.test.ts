import { chunkTokens, tokenize } from "../utils.js";

describe('tokenize', () => {
	it('splits by whitespace and removes empty tokens', () => {
		expect(tokenize('   ')).toEqual([]);
		expect(tokenize('aa bb cc   dd')).toEqual(['aa', 'bb', 'cc', 'dd']);
		expect(tokenize('hello  ')).toEqual(['hello']);
	});
});

describe('chunkTokens', () => {
	it('respects chunking/overlap rules', () => {
		const tokens = ['a', 'b', 'c', 'd', 'e', 'f'];
		expect(chunkTokens(tokens, 3, 1)).toEqual([
			['a', 'b', 'c'],
			['c', 'd', 'e'],
			['e', 'f']
		]);
	});

	it('returns one chunk if tokens length <= max_embedding', () => {
		expect(chunkTokens(['a', 'b'], 5, 0)).toEqual([['a', 'b']]);
	});
});

// TODO
// I didnt test poolEmbeddings
// It requires a Tensor type from @huggingface/transformers
// i could split the function to make it more testable (just pass dim and data instead of the whole tensor)
// or mock the Tensor type in this test file
