const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization || "";
        const [type, token] = header.split(" ");

        if (type !== "Bearer" || !token) {
            return res.status(401).json({ ok: false, message: "Missing Bearer token" });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ ok: false, message: "JWT_SECRET no configurado" });
        }

        const payload = jwt.verify(token, secret);
        req.user = { id: payload.sub, email: payload.email };
        next();
    } catch (err) {
        return res.status(401).json({ ok: false, message: "Invalid token" });
    }
}

module.exports = { requireAuth };
