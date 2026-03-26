import { Injectable, NotFoundException, MethodNotAllowedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EndpointRegistryService } from './endpoint-registry.service';
import { QueryParser } from './query-parser.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DynamicApiService {
    constructor(
        private registry: EndpointRegistryService,
        private dataSource: DataSource,
        private configService: ConfigService,
    ) { }

    async execute(endpointName: string, query: any, method: string, req?: any, id?: string) {
        const endpoint = this.registry.get(endpointName);
        if (!endpoint) {
            throw new NotFoundException(`Endpoint ${endpointName} not found`);
        }

        if (endpoint.method !== method) {
            throw new MethodNotAllowedException(`Method ${method} not allowed for endpoint ${endpointName}. Expected ${endpoint.method}`);
        }

        const configType = this.configService.get('DB_TYPE');
        const dbType = configType === 'oracle' ? 'oracle' : 'postgres';

        // Parse q parameter
        let parsedQuery = {};
        if (query.q) {
            try {
                parsedQuery = typeof query.q === 'string' ? JSON.parse(query.q) : query.q;
            } catch (e) {
                // ignore
            }
        }

        // If ID is provided, force filter by PK
        if (id) {
            const pk = endpoint.primaryKey || 'id';
            parsedQuery = { ...parsedQuery, [pk]: id };
        }

        const parser = new QueryParser(dbType);
        const { where, params } = parser.parse(parsedQuery);

        // Filter / Projection logic
        let selectedFields = '*';
        if (query.fields) {
            const fields = query.fields.split(',').map((f: string) => f.trim()).join(', ');
            // Basic strict sanitization
            if (/^[a-zA-Z0-9_, ]+$/.test(fields)) {
                selectedFields = fields;
            }
        }

        const baseSql = `SELECT ${selectedFields} FROM (${endpoint.sql}) base_query ${where}`;

        // Handle Pagination (only if no ID is present, and it's a collection)
        if (!id && endpoint.isCollection && endpoint.pagination) {
            const limit = query.limit ? parseInt(query.limit, 10) : 25;
            const offset = query.offset ? parseInt(query.offset, 10) : 0;

            // Count query
            // optimization: SELECT COUNT(*) FROM (endpoint.sql) base ... where
            const countSql = `SELECT COUNT(*) as "total" FROM (${endpoint.sql}) base_query ${where}`;

            // Execute count
            // We need to pass params for WHERE clause again
            // NOTE: params are mixed? No, they are purely for WHERE, so safe to reuse.
            const countResult = await this.dataSource.query(countSql, params);
            const total = parseInt(countResult[0].total || countResult[0].count, 10);

            // Paging SQL
            let pagingSql = '';
            const pagingParams = [...params];

            if (dbType === 'postgres') {
                pagingSql = `${baseSql} LIMIT $${pagingParams.length + 1} OFFSET $${pagingParams.length + 2}`;
                pagingParams.push(limit, offset);
            } else {
                // Oracle 12c+
                pagingSql = `${baseSql} OFFSET :p${pagingParams.length + 1} ROWS FETCH NEXT :p${pagingParams.length + 2} ROWS ONLY`;
                pagingParams.push(offset, limit);
            }

            console.log(`Executing Paged SQL: ${pagingSql} with params:`, pagingParams);
            const items = await this.dataSource.query(pagingSql, pagingParams);

            // HATEOAS Links
            const links = this.generateLinks(endpointName, query, limit, offset, total);

            return {
                items,
                hasMore: offset + limit < total,
                limit,
                offset,
                count: items.length,
                total,
                links
            };
        }

        console.log(`Executing SQL: ${baseSql} with params:`, params);

        const results = await this.dataSource.query(baseSql, params);

        if (id) {
            if (results.length === 0) throw new NotFoundException('Record not found');
            return results[0];
        }

        if (!endpoint.isCollection) {
            if (results.length === 0) throw new NotFoundException('Record not found');
            return results[0];
        }

        return results;
    }

    private generateLinks(endpoint: string, query: any, limit: number, offset: number, total: number) {
        const baseUrl = `/api/${endpoint}`;
        const links = [
            { rel: 'self', href: `${baseUrl}?offset=${offset}&limit=${limit}${this.serializeQ(query)}` }
        ];

        if (offset > 0) {
            const prevOffset = Math.max(0, offset - limit);
            links.push({ rel: 'prev', href: `${baseUrl}?offset=${prevOffset}&limit=${limit}${this.serializeQ(query)}` });
        }

        if (offset + limit < total) {
            const nextOffset = offset + limit;
            links.push({ rel: 'next', href: `${baseUrl}?offset=${nextOffset}&limit=${limit}${this.serializeQ(query)}` });
        }

        links.push({ rel: 'first', href: `${baseUrl}?offset=0&limit=${limit}${this.serializeQ(query)}` });

        return links;
    }

    // Helper to keep q and fields param in links
    private serializeQ(query: any) {
        let str = '';
        if (query.q) str += `&q=${query.q}`;
        if (query.fields) str += `&fields=${query.fields}`;
        return str;
    }
}
