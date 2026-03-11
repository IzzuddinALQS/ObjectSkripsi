import { db } from '../index';
import { users, roles } from '../schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('Menjalankan seed untuk menambahkan admin02...');
    try {
        const existingAdmin2 = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, 'admin02@lab.ac.id')
        });

        if (!existingAdmin2) {
            const adminRole = await db.query.roles.findFirst({
                where: eq(roles.name, 'Admin')
            });

            if (!adminRole) {
                console.error('Role Admin tidak ditemukan di database. Pastikan permissions sudah di-seed sebelumnya.');
                process.exit(1);
            }

            const adminPassword = await bcrypt.hash('admin', 10);

            await db.insert(users).values({
                fullName: 'Administrator 2',
                identifier: 'admin2',
                email: 'admin02@lab.ac.id',
                passwordHash: adminPassword,
                roleId: adminRole.id,
                status: 'Active',
                dosenPembimbing: '-',
                phoneNumber: '081200000002',
            });
            console.log('✅ Berhasil menambahkan user admin02 (email: admin02@lab.ac.id, password: admin)');
        } else {
            console.log('⏩ User admin02 sudah ada di database, melewati proses insert.');
        }

        console.log('🎉 Selesai menambahkan admin02.');
    } catch (error) {
        console.error('❌ Gagal menambahkan admin02:', error);
    }
    process.exit(0);
}

main();
