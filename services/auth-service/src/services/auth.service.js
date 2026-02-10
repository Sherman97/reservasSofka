const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// “DB” en memoria (temporal)
const users = [];

function signToken(user) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        const e = new Error("JWT_SECRET no está configurado en el .env");
        e.statusCode = 500;
        throw e;
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || "1d";

    return jwt.sign(
        { sub: user.id, email: user.email },
        secret,
        { expiresIn }
    );
}


async function register({ name, email, password }) {
    if (!name || !email || !password) {
        const e = new Error("name, email y password son obligatorios");
        e.statusCode = 400;
        throw e;
    }

    const normalizedEmail = normalizeEmail(email);

    const exists = users.find(u => u.email === normalizedEmail);

    if (exists) {
        const e = new Error("El email ya está registrado");
        e.statusCode = 409;
        throw e;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
        id: crypto.randomUUID(),
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: "USER",
        createdAt: new Date().toISOString()
    };

    users.push(user);

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
    const user = users.find(u => u.email === normalizedEmail);

    if (!user) {
        const e = new Error("Credenciales inválidas");
        e.statusCode = 401;
        throw e;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        const e = new Error("Credenciales inválidas");
        e.statusCode = 401;
        throw e;
    }

    const token = signToken(user);
    return { user: safeUser(user), token };
}


function getMe(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        const e = new Error("Usuario no encontrado");
        e.statusCode = 404;
        throw e;
    }
    return safeUser(user);
}

function safeUser(user) {
    return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

// se creo este metodo con fin de normalizar y estadarizar el correo
// ya que la Ia repitia la misma funcion en los metodoso de register y login
// 
function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}


module.exports = { register, login, getMe };
