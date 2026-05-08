import { QueryParser } from './query-parser.util';

describe('QueryParser', () => {
    let parser: QueryParser;

    beforeEach(() => {
        parser = new QueryParser('postgres');
    });

    it('should return empty where clause for empty query', () => {
        const { where, params } = parser.parse({});
        expect(where).toBe('');
        expect(params).toEqual([]);
    });

    it('should parse simple equality', () => {
        const { where, params } = parser.parse({ dept_id: 10 });
        expect(where).toBe('WHERE dept_id = $1');
        expect(params).toEqual([10]);
    });

    it('should parse simple equality with oracle placeholders', () => {
        parser = new QueryParser('oracle');
        const { where, params } = parser.parse({ dept_id: 10 });
        expect(where).toBe('WHERE dept_id = :p1');
        expect(params).toEqual([10]);
    });

    it('should parse operators', () => {
        const { where, params } = parser.parse({ salary: { $gt: 5000 } });
        expect(where).toBe('WHERE salary > $1');
        expect(params).toEqual([5000]);
    });

    it('should parse multiple conditions', () => {
        const { where, params } = parser.parse({ dept_id: 10, salary: { $gt: 5000 } });
        expect(where).toBe('WHERE dept_id = $1 AND salary > $2');
        expect(params).toEqual([10, 5000]);
    });

    it('should parse $in operator', () => {
        const { where, params } = parser.parse({ dept_id: { $in: [10, 20, 30] } });
        expect(where).toBe('WHERE dept_id IN ($1, $2, $3)');
        expect(params).toEqual([10, 20, 30]);
    });

    it('should throw on unsupported operator', () => {
        expect(() => parser.parse({ salary: { $bad: 5000 } })).toThrow();
    });
});
