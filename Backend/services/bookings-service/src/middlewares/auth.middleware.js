const jwt = require("jsonwebtoken");

// el requireAuth es un middleware que se encarga de verificar que el token sea valido
// y que el usuario este autenticado este mismo codigo solo lo implemento en el servicio de auth-service
// pero la IA no lo creo en el servicio de bookings-service

function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization || "";
        const [type, token] = header.split(" ");

        if (type !== "Bearer" || !token) {
            return res.status(401).json({ ok: false, message: "Missing Bearer token" });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: payload.sub, email: payload.email };
        next();
    } catch (err) {
        return res.status(401).json({ ok: false, message: "Invalid token" });
    }
}

module.exports = { requireAuth };
