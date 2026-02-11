const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "app_db",
};

async function run() {
    const conn = await mysql.createConnection(dbConfig);
    console.log("🔌 Connected to database for seeding");

    try {
        await conn.beginTransaction();

        // 1) Add more locations
        const locations = [
            ["Oficina Flexible 1", "Medellín - Co-work"],
            ["Sala de Innovación", "Cali - Sede Sur"],
            ["Terraza Lounge", "Bogotá - Rooftop"]
        ];

        const newLocIds = [];
        for (const [name, addr] of locations) {
            const [rows] = await conn.execute("SELECT id FROM locations WHERE name = ?", [name]);
            if (rows.length === 0) {
                const [result] = await conn.execute("INSERT INTO locations (name, address) VALUES (?, ?)", [name, addr]);
                newLocIds.push(result.insertId);
            } else {
                newLocIds.push(rows[0].id);
            }
        }
        console.log(`✅ Locations ensured (added ${newLocIds.length} locations)`);

        // 2) Get valid IDs
        const [users] = await conn.execute("SELECT id FROM users LIMIT 10");
        const [existingLocs] = await conn.execute("SELECT id FROM locations LIMIT 10");
        const [existingInv] = await conn.execute("SELECT id FROM inventory LIMIT 10");

        if (users.length === 0 || existingLocs.length === 0) {
            throw new Error("Missing users or locations. Please run base init/seeding first.");
        }

        const userIds = users.map(u => u.id);
        const locIds = existingLocs.map(l => l.id);
        const inventoryIds = existingInv.map(i => i.id);

        const now = new Date();
        const bookings = [
            { user: userIds[0], loc: locIds[0], start: addDays(now, 0, 10), end: addDays(now, 0, 12), status: 'confirmed' },
            { user: userIds[1 % userIds.length], loc: locIds[1 % locIds.length], start: addDays(now, 1, 14), end: addDays(now, 1, 16), status: 'pending' },
            { user: userIds[2 % userIds.length], loc: locIds[0], start: addDays(now, -1, 9), end: addDays(now, -1, 11), status: 'confirmed' },
            { user: userIds[3 % userIds.length], loc: locIds[2 % locIds.length], start: addDays(now, 2, 10), end: addDays(now, 2, 11), status: 'pending' },
            { user: userIds[0], loc: locIds[Math.min(3, locIds.length - 1)], start: addDays(now, 0, 15), end: addDays(now, 0, 17), status: 'confirmed' },
            { user: userIds[1 % userIds.length], loc: locIds[0], start: addDays(now, 3, 9), end: addDays(now, 3, 10), status: 'pending' },
            { user: userIds[2 % userIds.length], loc: locIds[1 % locIds.length], start: addDays(now, -2, 14), end: addDays(now, -2, 15), status: 'cancelled' }
        ];

        for (const b of bookings) {
            // Check if booking already exists (simple check by user, loc, and start_time)
            const [exists] = await conn.execute(
                "SELECT id FROM bookings WHERE user_id = ? AND location_id = ? AND start_time = ?",
                [b.user, b.loc, formatDate(b.start)]
            );

            if (exists.length === 0) {
                const [result] = await conn.execute(
                    "INSERT INTO bookings (user_id, location_id, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)",
                    [b.user, b.loc, formatDate(b.start), formatDate(b.end), b.status]
                );
                const bookingId = result.insertId;

                // Randomly assign 1-2 inventory items
                const count = Math.floor(Math.random() * 2) + 1;
                const shuffledInv = [...inventoryIds].sort(() => 0.5 - Math.random());
                for (let i = 0; i < count; i++) {
                    await conn.execute(
                        "INSERT IGNORE INTO booking_inventory (booking_id, inventory_id) VALUES (?, ?)",
                        [bookingId, shuffledInv[i]]
                    );
                }
            }
        }
        console.log("✅ Bookings and inventory links ensured");

        await conn.commit();
        console.log("🚀 Seeding finished successfully");

    } catch (err) {
        await conn.rollback();
        console.error("❌ Error during seeding:", err);
    } finally {
        await conn.end();
    }
}

function addDays(date, days, hour) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    result.setHours(hour, 0, 0, 0);
    return result;
}

function formatDate(date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

run();
