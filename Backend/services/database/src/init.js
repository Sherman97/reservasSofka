const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'app_db',
    multipleStatements: true // Essential for running schema.sql
};

async function initializeDatabase() {
    let conn;
    try {
        // 1. Connect without database to create it if needed
        const { database, ...configWithoutDb } = dbConfig;
        conn = await mysql.createConnection(configWithoutDb);
        console.log("🔌 Connected to MariaDB server (via mysql2)");

        await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
        console.log(`✅ Database '${database}' checked/created`);

        // 2. Switch to the database
        await conn.query(`USE \`${database}\``);

        // 3. Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // With multipleStatements: true, we can run the whole file at once
        await conn.query(schemaSql);

        console.log("✅ Tables initialized successfully");
        await conn.end();

    } catch (err) {
        console.error("❌ Database initialization failed:", err);
        if (conn) await conn.end();
        throw err;
    }
}

module.exports = { initializeDatabase };
