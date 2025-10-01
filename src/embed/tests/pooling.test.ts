import { tokenize } from "../utils.js";

describe('tokenize', () => {
	it('splits by whitespace and removes empty tokens', () => {
		expect(tokenize('   ')).toEqual([]);
		expect(tokenize('aa bb cc   dd')).toEqual(['aa', 'bb', 'cc', 'dd']);
		expect(tokenize('hello  ')).toEqual(['hello']);
	});
});
