require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log(`✅ bookings-service running on http://localhost:${PORT}`);
});
