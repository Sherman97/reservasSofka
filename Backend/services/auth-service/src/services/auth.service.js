const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { normalizeEmail } = require("../utils/normalizeEmail");

function signToken(user) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        const e = new Error("JWT_SECRET no está configurado en el .env");
        e.statusCode = 500;
        throw e;
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || "1d";

    // Si luego agregas role al token, aquí lo metes.
    return jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn });
}

function safeUser(user) {
    return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

async function register({ name, email, password }) {
    if (!name || !email || !password) {
        const e = new Error("name, email y password son obligatorios");
        e.statusCode = 400;
        throw e;
    }

    const normalizedEmail = normalizeEmail(email);

    // 1) Verificar existencia en BD
    const [existsRows] = await pool.execute(
        `SELECT id FROM users WHERE email = ? LIMIT 1`,
        [normalizedEmail]
    );

    if (existsRows.length > 0) {
        const e = new Error("El email ya está registrado");
        e.statusCode = 409;
        throw e;
    }

    // 2) Crear usuario
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
        `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
        [String(name).trim(), normalizedEmail, passwordHash]
    );

    const user = {
        id: result.insertId,
        name: String(name).trim(),
        email: normalizedEmail,
        role: "USER",
        createdAt: new Date().toISOString(),
    };

    const token = signToken(user);
    return { user: safeUser(user), token };
}

async function login({ email, password }) {
    if (!email || !password) {
        const e = new Error("email y password son obligatorios");
        e.statusCode = 400;
        throw e;
    }

    const normalizedEmail = normalizeEmail(email);

    // 1) Buscar en BD
    const [rows] = await pool.execute(
        `SELECT id, username, email, password, created_at
     FROM users
     WHERE email = ?
     LIMIT 1`,
        [normalizedEmail]
    );

    if (!rows.length) {
        const e = new Error("Credenciales inválidas");
        e.statusCode = 401;
        throw e;
    }

    const row = rows[0];

    // 2) Comparar password
    const ok = await bcrypt.compare(password, row.password);
    if (!ok) {
        const e = new Error("Credenciales inválidas");
        e.statusCode = 401;
        throw e;
    }

    const user = {
        id: row.id,
        name: row.username,
        email: row.email,
        role: "USER",
        createdAt: row.created_at,
    };

    const token = signToken(user);
    return { user: safeUser(user), token };
}

async function getMe(userId) {
    const [rows] = await pool.execute(
        `SELECT id, username, email, created_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
        [userId]
    );

    if (!rows.length) {
        const e = new Error("Usuario no encontrado");
        e.statusCode = 404;
        throw e;
    }

    const row = rows[0];
    return safeUser({
        id: row.id,
        name: row.username,
        email: row.email,
        createdAt: row.created_at,
    });
}

module.exports = { register, login, getMe };
