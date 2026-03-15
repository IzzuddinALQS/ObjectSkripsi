/**
 * Manual Migration Script
 * Adds missing columns to existing tables without dropping data.
 * Run with: npx tsx db/migrate.ts
 */
import * as dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';
async function addColumnIfNotExists(
    connection: mysql.Connection,
    table: string,
    column: string,
    definition: string
) {
    try {
        await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
        console.log(`  ✅ Added: ${table}.${column}`);
    } catch (err: any) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log(`  ⏭️  Already exists: ${table}.${column}`);
        } else {
            console.error(`  ❌ Error on ${table}.${column}: ${err.message}`);
        }
    }
}
async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'be-labuai',
        port: parseInt(process.env.DB_PORT || '3306'),
    });
    console.log('✅ Connected to database:', process.env.DB_NAME);
    console.log('🚀 Running migrations...\n');
    // ─── room_bookings ─────────────────────────────────────────
    console.log('📋 Migrating room_bookings...');
    await addColumnIfNotExists(connection, 'room_bookings', 'rejection_reason', 'TEXT NULL');
    await addColumnIfNotExists(connection, 'room_bookings', 'notification_read', "ENUM('0','1') DEFAULT '0'");
    await addColumnIfNotExists(connection, 'room_bookings', 'organisasi', "VARCHAR(255) DEFAULT 'Pribadi'");
    await addColumnIfNotExists(connection, 'room_bookings', 'jumlah_peserta', 'INT DEFAULT 1');
    await addColumnIfNotExists(connection, 'room_bookings', 'surat_permohonan', 'VARCHAR(255) NULL');
    await addColumnIfNotExists(connection, 'room_bookings', 'dosen_pembimbing', 'VARCHAR(255) NULL');
    await addColumnIfNotExists(connection, 'room_bookings', 'validator_id', 'VARCHAR(50) NULL');
    // ─── item_loans ─────────────────────────────────────────────
    console.log('\n📦 Migrating item_loans...');
    await addColumnIfNotExists(connection, 'item_loans', 'rejection_reason', 'TEXT NULL');
    await addColumnIfNotExists(connection, 'item_loans', 'organisasi', 'VARCHAR(255) NULL');
    await addColumnIfNotExists(connection, 'item_loans', 'start_time', 'DATETIME NULL');
    await addColumnIfNotExists(connection, 'item_loans', 'end_time', 'DATETIME NULL');
    await addColumnIfNotExists(connection, 'item_loans', 'purpose', 'VARCHAR(255) NULL');
    await addColumnIfNotExists(connection, 'item_loans', 'surat_izin', 'VARCHAR(255) NULL');
    await addColumnIfNotExists(connection, 'item_loans', 'dosen_pembimbing', 'VARCHAR(255) NULL');
    await addColumnIfNotExists(connection, 'item_loans', 'software', 'TEXT NULL');
    await addColumnIfNotExists(connection, 'item_loans', 'notification_read', "ENUM('0','1') DEFAULT '0'");
    await addColumnIfNotExists(connection, 'item_loans', 'return_photo', 'VARCHAR(255) NULL');
    await addColumnIfNotExists(connection, 'item_loans', 'return_status', "ENUM('Belum','Pending','Dikembalikan') DEFAULT 'Belum'");
    await addColumnIfNotExists(connection, 'item_loans', 'return_notification_read', "ENUM('0','1') DEFAULT '0'");
    await addColumnIfNotExists(connection, 'item_loans', 'validator_id', 'VARCHAR(50) NULL');
    await addColumnIfNotExists(connection, 'item_loans', 'actual_return_date', 'DATETIME NULL');
    // ─── users (extra fields) ────────────────────────────────────
    console.log('\n👤 Migrating users...');
    await addColumnIfNotExists(connection, 'users', 'batch', 'INT NULL');
    await addColumnIfNotExists(connection, 'users', 'study_type', "ENUM('Reguler','Hybrid') NULL");
    await addColumnIfNotExists(connection, 'users', 'phone_number', 'VARCHAR(20) NULL');
    await addColumnIfNotExists(connection, 'users', 'dosen_pembimbing', 'VARCHAR(255) NULL');
    await addColumnIfNotExists(connection, 'users', 'status', "ENUM('Active','Inactive') DEFAULT 'Active'");
    await connection.end();
    console.log('\n✅ Migration completed!');
}
main().catch((err) => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
});
