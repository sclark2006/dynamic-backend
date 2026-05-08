import { Injectable } from '@nestjs/common';
import { DynamicEndpoint } from './dynamic-endpoint.interface';

@Injectable()
export class EndpointRegistryService {
    private endpoints: Map<string, DynamicEndpoint> = new Map();

    constructor() {
        this.register({
            name: 'employees',
            sql: 'SELECT * FROM employees',
            type: 'query',
            method: 'GET',
            isCollection: true,
            pagination: true,
            primaryKey: 'id',
            description: 'Get all employees',
        });

        this.register({
            name: 'departments',
            sql: 'SELECT * FROM departments',
            type: 'query',
            method: 'GET',
            isCollection: true,
            pagination: true,
            primaryKey: 'id',
            description: 'Get all departments',
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
