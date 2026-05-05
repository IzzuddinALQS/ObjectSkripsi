/**
 * Migration 0008: Run with `npx tsx db/run-migration-0008.ts`
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import mysql from 'mysql2/promise';

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'be-labindustriuai',
        port: parseInt(process.env.DB_PORT || '3306'),
        multipleStatements: true,
    });

    console.log('🔗 Terhubung ke database:', process.env.DB_NAME || 'be-labindustriuai');

    try {
        // 1. Delete Video Profil records
        console.log('\n[1/5] Hapus record Video Profil...');
        await connection.query(`DELETE FROM governance_docs WHERE type = 'Video Profil'`);
        console.log('  ✅ Selesai');

        // 2. Alter governance_docs enum
        console.log('\n[2/5] Update enum governance_docs...');
        try {
            await connection.query(`
                ALTER TABLE governance_docs
                MODIFY COLUMN type ENUM('SOP', 'LPJ Bulanan', 'Template Surat', 'Pusat Download') NOT NULL
            `);
            console.log('  ✅ Enum diperbarui');
        } catch (e: any) {
            console.log('  ⚠️  Skip:', e.message);
        }

        // 3. Create practicum_lpj_docs
        console.log('\n[3/5] Buat tabel practicum_lpj_docs...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS practicum_lpj_docs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                scheduled_practicum_id INT NOT NULL,
                uploader_id VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                file_path VARCHAR(500) NOT NULL,
                period_month INT NOT NULL COMMENT '1-12',
                period_year INT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_lpj_sched FOREIGN KEY (scheduled_practicum_id) REFERENCES scheduled_practicums(id) ON DELETE CASCADE,
                CONSTRAINT fk_lpj_uploader FOREIGN KEY (uploader_id) REFERENCES users(identifier) ON DELETE CASCADE,
                INDEX idx_lpj_sched (scheduled_practicum_id),
                INDEX idx_lpj_uploader (uploader_id),
                INDEX idx_lpj_period (period_year, period_month)
            )
        `);
        console.log('  ✅ Tabel practicum_lpj_docs siap');

        // 4. Create practicum_posts
        console.log('\n[4/5] Buat tabel practicum_posts...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS practicum_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                uploader_id VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                file_path VARCHAR(500),
                period_type ENUM('harian', 'mingguan', 'bulanan', 'kustom') NOT NULL DEFAULT 'bulanan',
                period_start DATETIME NOT NULL,
                period_end DATETIME NOT NULL,
                notes TEXT,
                post_status ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME,
                CONSTRAINT fk_post_uploader FOREIGN KEY (uploader_id) REFERENCES users(identifier) ON DELETE CASCADE,
                INDEX pp_uploader_idx (uploader_id),
                INDEX pp_period_idx (period_start, period_end),
                INDEX pp_status_idx (post_status)
            )
        `);
        console.log('  ✅ Tabel practicum_posts siap');

        // 5. Insert permissions
        console.log('\n[5/5] Insert permission practicum.assist...');
        await connection.query(`
            INSERT INTO permissions (code, name, category, description)
            VALUES ('practicum.assist', 'Asisten Praktikum', 'Academic', 'Upload LPJ Praktikum dan pengumuman/blog jadwal praktikum')
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                category = VALUES(category),
                description = VALUES(description)
        `);
        console.log('  ✅ Permission ditambahkan');

        console.log('\n🎉 Migrasi 0008 selesai!\n');
    } catch (err: any) {
        console.error('\n❌ Error:', err.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

run();
