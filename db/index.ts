import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
    conn: mysql.Pool | undefined;
};

import * as dotenv from 'dotenv';
dotenv.config();

const poolConnection = globalForDb.conn ?? mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'be-labelektrouai',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

if (process.env.NODE_ENV !== 'production') globalForDb.conn = poolConnection;

export const db = drizzle(poolConnection, { schema, mode: "default" });
