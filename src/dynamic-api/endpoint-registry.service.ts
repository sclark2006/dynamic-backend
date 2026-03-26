import { Injectable } from '@nestjs/common';

export interface DynamicEndpoint {
    name: string;
    sql: string; // The base SQL query or SP call
    type: 'query' | 'procedure';
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    isCollection?: boolean;
    pagination?: boolean;
    primaryKey?: string;
    description?: string;
}

@Injectable()
export class EndpointRegistryService {
    private endpoints: Map<string, DynamicEndpoint> = new Map();

    constructor() {
        // Seed with some examples
        this.register({
            name: 'employees',
            sql: 'SELECT * FROM employees',
            type: 'query',
            description: 'Get all employees',
        });

        this.register({
            name: 'departments',
            sql: 'SELECT * FROM departments',
            type: 'query',
            description: 'Get all departments'
        });
    }

    register(endpoint: DynamicEndpoint) {
        this.endpoints.set(endpoint.name, endpoint);
    }

    get(name: string): DynamicEndpoint | undefined {
        return this.endpoints.get(name);
    }

    getAll(): DynamicEndpoint[] {
        return Array.from(this.endpoints.values());
    }
}
