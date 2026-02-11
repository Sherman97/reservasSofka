const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
require("dotenv").config();

const dbConfig = {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "app_db",
    multipleStatements: true,
};

async function ensureUser(conn, { username, email, passwordPlain }) {
    const normalizedEmail = String(email).trim().toLowerCase();

    const [rows] = await conn.execute(
        `SELECT id FROM users WHERE email = ? LIMIT 1`,
        [normalizedEmail]
    );

    const passwordHash = await bcrypt.hash(passwordPlain, 10);

    if (rows.length) {
        // Si ya existe, actualizamos username y password (útil para resetear claves demo)
        await conn.execute(
            `UPDATE users SET username = ?, password = ? WHERE email = ?`,
            [String(username).trim(), passwordHash, normalizedEmail]
        );
        return rows[0].id;
    }

    const [result] = await conn.execute(
        `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
        [String(username).trim(), normalizedEmail, passwordHash]
    );
    return result.insertId;
}

async function ensureLocation(conn, { name, address }) {
    const [rows] = await conn.execute(
        `SELECT id FROM locations WHERE name = ? AND address = ? LIMIT 1`,
        [name, address]
    );
    if (rows.length) return rows[0].id;

    const [result] = await conn.execute(
        `INSERT INTO locations (name, address) VALUES (?, ?)`,
        [name, address]
    );
    return result.insertId;
}

async function ensureInventory(conn, { name, type, status = "available" }) {
    const [rows] = await conn.execute(
        `SELECT id FROM inventory WHERE name = ? AND type = ? LIMIT 1`,
        [name, type]
    );
    if (rows.length) return rows[0].id;

    const [result] = await conn.execute(
        `INSERT INTO inventory (name, type, status) VALUES (?, ?, ?)`,
        [name, type, status]
    );
    return result.insertId;
}

async function upsertLocationInventory(conn, { locationId, inventoryId, qty }) {
    // location_inventory tiene UNIQUE(location_id, inventory_id) por tu migración 002
    await conn.execute(
        `INSERT INTO location_inventory (location_id, inventory_id, qty)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE qty = VALUES(qty)`,
        [locationId, inventoryId, qty]
    );
}

async function run() {
    const conn = await mysql.createConnection(dbConfig);

    try {
        await conn.beginTransaction();

        // 1) Users demo (passwords en texto plano para generar hash con bcrypt)
        const adminId = await ensureUser(conn, {
            username: "Admin Demo",
            email: "admin@demo.com",
            passwordPlain: "Admin123*",
        });

        const userId = await ensureUser(conn, {
            username: "Usuario Demo",
            email: "user@demo.com",
            passwordPlain: "User123*",
        });

        // 2) Locations demo
        const salaJuntasId = await ensureLocation(conn, {
            name: "Sala de Juntas A",
            address: "Bogotá - Sede Principal",
        });

        const salaGamerId = await ensureLocation(conn, {
            name: "Sala Gamer",
            address: "Bogotá - Piso 2",
        });

        // 3) Inventory demo
        const tvId = await ensureInventory(conn, { name: 'TV 55"', type: "tv" });
        const camId = await ensureInventory(conn, {
            name: "Cámara Videoconferencia",
            type: "camera",
        });
        const fanId = await ensureInventory(conn, { name: "Ventilador", type: "fan" });
        const xboxId = await ensureInventory(conn, {
            name: "Consola Xbox",
            type: "console",
        });
        const speakerId = await ensureInventory(conn, {
            name: "Parlante",
            type: "speaker",
        });

        // 4) Stock por locación (location_inventory)
        await upsertLocationInventory(conn, {
            locationId: salaJuntasId,
            inventoryId: tvId,
            qty: 1,
        });
        await upsertLocationInventory(conn, {
            locationId: salaJuntasId,
            inventoryId: camId,
            qty: 1,
        });
        await upsertLocationInventory(conn, {
            locationId: salaJuntasId,
            inventoryId: fanId,
            qty: 2,
        });

        await upsertLocationInventory(conn, {
            locationId: salaGamerId,
            inventoryId: tvId,
            qty: 1,
        });
        await upsertLocationInventory(conn, {
            locationId: salaGamerId,
            inventoryId: xboxId,
            qty: 1,
        });
        await upsertLocationInventory(conn, {
            locationId: salaGamerId,
            inventoryId: speakerId,
            qty: 1,
        });

        await conn.commit();

        console.log("✅ Seed 001 listo");
        console.log("   Users:", { adminId, userId });
        console.log("   Locations:", { salaJuntasId, salaGamerId });
    } catch (err) {
        await conn.rollback();
        console.error("❌ Error en Seed 001:", err);
        process.exitCode = 1;
    } finally {
        await conn.end();
    }
}

run();
