export class QueryParser {
    private paramIndex = 1;
    private parameters: any[] = [];
    private dbType: 'oracle' | 'postgres';

    constructor(dbType: 'oracle' | 'postgres' = 'postgres', startIndex: number = 1) {
        this.dbType = dbType;
        this.paramIndex = startIndex;
    }

    parse(q: any): { where: string; params: any[] } {
        if (!q || Object.keys(q).length === 0) {
            return { where: '', params: [] };
        }

        const conditions: string[] = [];

        for (const [key, value] of Object.entries(q)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // Handle operators
                for (const [op, opValue] of Object.entries(value)) {
                    conditions.push(this.buildCondition(key, op, opValue));
                }
            } else {
                // Implicit equality
                conditions.push(this.buildCondition(key, '$eq', value));
            }
        }

        return { where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '', params: this.parameters };
    }

    private buildCondition(field: string, operator: string, value: any): string {
        const paramPlaceholder = this.getParamPlaceholder();

        switch (operator) {
            case '$eq':
                this.parameters.push(value);
                return `${field} = ${paramPlaceholder}`;
            case '$gt':
                this.parameters.push(value);
                return `${field} > ${paramPlaceholder}`;
            case '$gte':
                this.parameters.push(value);
                return `${field} >= ${paramPlaceholder}`;
            case '$lt':
                this.parameters.push(value);
                return `${field} < ${paramPlaceholder}`;
            case '$lte':
                this.parameters.push(value);
                return `${field} <= ${paramPlaceholder}`;
            case '$like':
                this.parameters.push(value);
                return `${field} LIKE ${paramPlaceholder}`;
            case '$in':
                if (!Array.isArray(value)) throw new Error(`Value for $in must be an array`);
                const inPlaceholders: string[] = [];

                inPlaceholders.push(paramPlaceholder);
                this.parameters.push(value[0]);

                for (let i = 1; i < value.length; i++) {
                    inPlaceholders.push(this.getParamPlaceholder());
                    this.parameters.push(value[i]);
                }

                return `${field} IN (${inPlaceholders.join(', ')})`;
            default:
                throw new Error(`Unsupported operator: ${operator}`);
        }
    }

    private getParamPlaceholder(): string {
        if (this.dbType === 'postgres') {
            return `$${this.paramIndex++}`;
        } else {
            return `:p${this.paramIndex++}`;
        }
    }
}
