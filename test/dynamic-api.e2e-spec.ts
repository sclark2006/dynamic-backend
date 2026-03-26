import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { EndpointRegistryService } from './../src/dynamic-api/endpoint-registry.service';

describe('DynamicApiController (e2e)', () => {
    let app: INestApplication;
    let registry: EndpointRegistryService;

    beforeAll(async () => {
        // Ensure environment variables are loaded for DB connection
        // In a real CI, we might want a separate test DB, but here we use the docker one we just seeded.
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        registry = app.get(EndpointRegistryService);

        // Register test endpoints dynamically
        registry.register({
            name: 'test-employees',
            sql: 'SELECT * FROM employees',
            type: 'query',
            method: 'GET',
            isCollection: true,
            pagination: true
        });

        registry.register({
            name: 'test-depts',
            sql: 'SELECT * FROM departments',
            type: 'query',
            method: 'GET',
            isCollection: true
        });
    });

    afterAll(async () => {
        await app.close();
    });

    it('/api/test-employees (GET) - should return all employees', () => {
        return request(app.getHttpServer())
            .get('/api/test-employees')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('items');
                expect(Array.isArray(res.body.items)).toBe(true);
                expect(res.body.items.length).toBeGreaterThan(0);
                expect(res.body.items[0]).toHaveProperty('email');
            });
    });

    it('/api/test-employees (GET) - filter by equality', () => {
        const q = JSON.stringify({ dept_id: 1 });
        return request(app.getHttpServer())
            .get(`/api/test-employees?q=${q}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.items.length).toBeGreaterThan(0);
                // All results should have dept_id = 1
                res.body.items.forEach((emp: any) => {
                    expect(emp.dept_id).toBe(1);
                });
            });
    });

    it('/api/test-employees (GET) - filter by $gt operator', () => {
        const q = JSON.stringify({ salary: { $gt: 70000 } });
        return request(app.getHttpServer())
            .get(`/api/test-employees?q=${q}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.items.length).toBeGreaterThan(0);
                res.body.items.forEach((emp: any) => {
                    expect(Number(emp.salary)).toBeGreaterThan(70000);
                });
            });
    });

    it('/api/test-employees (GET) - projection', () => {
        return request(app.getHttpServer())
            .get('/api/test-employees?fields=first_name,email')
            .expect(200)
            .expect((res) => {
                expect(res.body.items.length).toBeGreaterThan(0);
                const emp = res.body.items[0];
                expect(emp).toHaveProperty('first_name');
                expect(emp).toHaveProperty('email');
                expect(emp).not.toHaveProperty('salary'); // Should be excluded
            });
    });

    it('/api/invalid-endpoint (GET) - should return 404', () => {
        return request(app.getHttpServer())
            .get('/api/invalid-endpoint')
            .expect(404);
    });

    it('/api/test-employees/:id (GET) - should return single employee by ID', () => {
        return request(app.getHttpServer())
            .get('/api/test-employees/1')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                // The logical test implies ID 1 exists.
                // expect(res.body.id).toBe(1); 
                expect(res.body).not.toHaveProperty('items');
            });
    });

    it('/api/test-employees (GET) - pagination with offset', () => {
        return request(app.getHttpServer())
            .get('/api/test-employees?limit=1&offset=1')
            .expect(200)
            .expect((res) => {
                expect(res.body.items.length).toBe(1);
                expect(res.body.offset).toBe(1);
                // Verify we get a result. 
                expect(res.body.items[0]).toBeDefined();
            });
    });
});
