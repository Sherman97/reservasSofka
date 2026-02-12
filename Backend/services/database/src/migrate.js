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
    multipleStatements: true
};

async function runMigrations() {
    let conn;
    try {
        conn = await mysql.createConnection(dbConfig);
        console.log("🔌 Connected to MariaDB for migrations");

        const migrationsDir = path.join(__dirname, '..', 'migrations');
        const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

        for (const file of files) {
            console.log(`🚀 Running migration: ${file}`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            await conn.query(sql);
            console.log(`✅ Migration ${file} completed`);
        }

        console.log("✨ All migrations applied successfully");
        await conn.end();
    } catch (err) {
        console.error("❌ Migration failed:", err);
        if (conn) await conn.end();
        process.exit(1);
    }
}

runMigrations();
