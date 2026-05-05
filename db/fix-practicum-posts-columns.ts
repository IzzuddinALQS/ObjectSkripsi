/**
 * Fix Migration: Rename status→post_status dan DATE→DATETIME di practicum_posts
 * Run with: npx tsx db/fix-practicum-posts-columns.ts
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import mysql from 'mysql2/promise';

async function main() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'be-labindustriuai',
        port: parseInt(process.env.DB_PORT || '3306'),
    });

    console.log('🔗 Connected to:', process.env.DB_NAME || 'be-labindustriuai');

    try {
        // 1. Rename status → post_status (dan drop index lama, buat index baru)
        console.log('\n[1/3] Rename kolom status → post_status...');
        try {
            await conn.query(`ALTER TABLE practicum_posts DROP INDEX pp_status_idx`);
        } catch { /* index mungkin belum ada */ }
        try {
            await conn.query(`ALTER TABLE practicum_posts DROP INDEX idx_post_status`);
        } catch { /* index mungkin belum ada */ }

        await conn.query(`
            ALTER TABLE practicum_posts
            CHANGE COLUMN \`status\` \`post_status\` ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif'
        `);
        await conn.query(`ALTER TABLE practicum_posts ADD INDEX pp_status_idx (post_status)`);
        console.log('  ✅ Kolom status → post_status');

        // 2. Ubah period_start dari DATE ke DATETIME
        console.log('\n[2/3] Ubah period_start: DATE → DATETIME...');
        await conn.query(`
            ALTER TABLE practicum_posts
            MODIFY COLUMN period_start DATETIME NOT NULL
        `);
        console.log('  ✅ period_start sekarang DATETIME');

        // 3. Ubah period_end dari DATE ke DATETIME
        console.log('\n[3/3] Ubah period_end: DATE → DATETIME...');
        await conn.query(`
            ALTER TABLE practicum_posts
            MODIFY COLUMN period_end DATETIME NOT NULL
        `);
        console.log('  ✅ period_end sekarang DATETIME');

        // Verifikasi
        const [cols] = await conn.query('DESCRIBE practicum_posts');
        console.log('\nSchema final practicum_posts:');
        (cols as any[]).forEach((c: any) => {
            console.log(`  ${c.Field.padEnd(20)} ${c.Type}`);
        });

        console.log('\n🎉 Fix selesai!\n');
    } catch (err: any) {
        console.error('\n❌ Error:', err.message);
        process.exit(1);
    } finally {
        await conn.end();
    }
}

main();
