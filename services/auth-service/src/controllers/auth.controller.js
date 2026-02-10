const authService = require("../services/auth.service");

async function register(req, res) {
    try {
        const result = await authService.register(req.body);
        res.status(201).json({ ok: true, data: result });
    } catch (err) {
        res.status(err.statusCode || 500).json({ ok: false, message: err.message || "Error" });
    }
}

async function login(req, res) {
    try {
        const result = await authService.login(req.body);
        res.json({ ok: true, data: result });
    } catch (err) {
        res.status(err.statusCode || 500).json({ ok: false, message: err.message || "Error" });
    }
}

async function me(req, res) {
    try {
        const user = authService.getMe(req.user.id);
        res.json({ ok: true, data: user });
    } catch (err) {
        res.status(err.statusCode || 500).json({ ok: false, message: err.message || "Error" });
    }
}

module.exports = { register, login, me };
