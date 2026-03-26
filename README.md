<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Dynamic NestJS Backend

A modular NestJS backend designed for dynamic endpoint creation, advanced data filtering, and multi-database support (Oracle 19c+ & PostgreSQL). This project allows you to expose SQL queries as REST endpoints with powerful, ORDS-like filtering capabilities.

## 🚀 Features

- **Dynamic Endpoints**: Map SQL queries or Stored Procedures to REST endpoints without writing dedicated controllers.
- **Advanced Filtering**: Support for ORDS-style JSON filtering (`q={ ... }`) with operators like `$eq`, `$gt`, `$like`, `$in`, etc.
- **Multi-Database Support**: Seamlessly switch between Oracle and PostgreSQL via configuration.
- **Dynamic Projections**: Select specific columns to return using the `fields` parameter.
- **Swagger Documentation**: Integrated OpenAI (Swagger) documentation.

## 🛠 Installation

```bash
$ npm install
```

## ⚙️ Configuration

Create a `.env` file in the root directory (copy from `.env.example`).

```env
# DB Configuration
# Options: oracle, postgres
DB_TYPE=original

# Connection Details
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=postgres

# Oracle Specific
DB_SID=xe
DB_SERVICE_NAME=ORCLPDB1
```

## 🏃 Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 📖 Usage Guide

### 1. Registering a New Endpoint

To expose a new query as an API endpoint, register it in `src/dynamic-api/endpoint-registry.service.ts`:

```typescript
this.register({
  name: 'active-users',
  sql: "SELECT * FROM users WHERE status = 'ACTIVE'",
  type: 'query',
  description: 'Retrieve all active users'
});
```

This will be immediately available at:
`GET /api/active-users`

### 2. Filtering (`q` parameter)

The backend supports a JSON-based query syntax similar to Oracle ORDS.

**Syntax:** `?q={"field": "value", "field2": {"$operator": "value"}}`

| Operator | Description | Example |
|----------|-------------|---------|
| `$eq` | Equality (default) | `{"id": 1}` |
| `$gt` | Greater than | `{"salary": {"$gt": 5000}}` |
| `$gte` | Greater than or equal | `{"age": {"$gte": 18}}` |
| `$lt` | Less than | `{"priority": {"$lt": 5}}` |
| `$lte` | Less than or equal | `{"stock": {"$lte": 10}}` |
| `$like` | SQL LIKE pattern | `{"name": {"$like": "John%"}}` |
| `$in` | match any in array | `{"status": {"$in": ["A", "B"]}}` |

**Example URL:**
`/api/employees?q={"dept_id": 10, "salary": {"$gt": 5000}}`

### 3. Projections (`fields` parameter)

Select only specific columns to reduce payload size.

**Syntax:** `?fields=col1,col2`

**Example:**
`/api/employees?fields=first_name,last_name,email`

## 📚 API Documentation

Once the application is running, visit:
`http://localhost:3000/api/docs`

## 🏗 Architecture

- **`DatabaseModule`**: Handles dynamic connection to Oracle or Postgres based on `DB_TYPE`.
- **`DynamicApiModule`**: Core module containing:
    - **`EndpointRegistryService`**: Stores mappings of endpoint names to SQL.
    - **`QueryParser`**: Translates JSON `q` params into parameterized SQL `WHERE` clauses (prevents SQL injection).
    - **`DynamicApiService`**: Executes the final constructed SQL.
    - **`DynamicApiController`**: A generic controller resolving wildcards to endpoints.

## 📄 License

Nest is [MIT licensed](LICENSE).
