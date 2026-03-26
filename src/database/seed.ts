import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config(); // Load .env

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'postgres',
    synchronize: false,
    logging: true,
});

async function seed() {
    await dataSource.initialize();
    console.log('Seeding database...');

    await dataSource.query(`
    CREATE TABLE IF NOT EXISTS departments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      location VARCHAR(100)
    );
  `);

    await dataSource.query(`
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(50),
      last_name VARCHAR(50),
      email VARCHAR(100),
      salary DECIMAL(10, 2),
      dept_id INTEGER REFERENCES departments(id)
    );
  `);

    // Clear existing data
    await dataSource.query('TRUNCATE TABLE employees, departments RESTART IDENTITY CASCADE');

    // Insert Departments
    await dataSource.query(`
    INSERT INTO departments (name, location) VALUES 
    ('IT', 'New York'),
    ('HR', 'London'),
    ('Sales', 'San Francisco');
  `);

    // Insert Employees
    await dataSource.query(`
    INSERT INTO employees (first_name, last_name, email, salary, dept_id) VALUES 
    ('John', 'Doe', 'john@example.com', 60000, 1),
    ('Jane', 'Smith', 'jane@example.com', 75000, 1),
    ('Alice', 'Johnson', 'alice@example.com', 50000, 2),
    ('Bob', 'Brown', 'bob@example.com', 45000, 3),
    ('Charlie', 'Davis', 'charlie@example.com', 80000, 1);
  `);

    console.log('Seeding complete!');
    await dataSource.destroy();
}

seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
