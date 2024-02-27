import { createPool } from "mysql2/promise";

const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "dodgetracker",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default pool;
