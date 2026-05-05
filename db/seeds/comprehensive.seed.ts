/**
 * Database Seed
 * Seeds essential tables: roles, permissions, admin/dosen users, categories, courses
 */

import { db } from '@/db';
import {
    roles, users,
    courses,
    itemCategories,
    permissions, rolePermissions
} from '@/db/schema';
import bcrypt from 'bcryptjs';

/**
 * 1. Seed Roles (if not exists)
 */
export async function seedRoles() {
    console.log('🔑 Seeding roles...');

    const existingRoles = await db.select().from(roles);
    if (existingRoles.length > 0) {
        console.log('   ⏭️  Roles already exist, skipping...');
        return existingRoles;
    }

    const roleData = [
        { name: 'Admin' },
        { name: 'Dosen' },
        { name: 'Mahasiswa' },
    ];

    await db.insert(roles).values(roleData);
    const createdRoles = await db.select().from(roles);
    console.log(`   ✅ Created ${createdRoles.length} roles`);
    return createdRoles;
}

/**
 * 2. Seed Permissions & Role Permissions
 */
export async function seedPermissions() {
    console.log('\n🔐 Seeding permissions...');

    const existingPerms = await db.select().from(permissions);
    if (existingPerms.length > 0) {
        console.log('   ⏭️  Permissions already exist, skipping...');
        return existingPerms;
    }

    const allRoles = await db.select().from(roles);
    const adminRole = allRoles.find(r => r.name === 'Admin')!;
    const dosenRole = allRoles.find(r => r.name === 'Dosen')!;

    const permData = [
        { code: 'dashboard.admin', name: 'Akses Dashboard Admin', category: 'General' },
        { code: 'dashboard.lecturer', name: 'Akses Dashboard Dosen', category: 'General' },
        { code: 'loans.manage', name: 'Validasi Peminjaman Alat', category: 'Loans' },
        { code: 'bookings.manage', name: 'Validasi Booking Ruangan', category: 'Bookings' },
        { code: 'users.manage', name: 'Manajemen Akun & Hak Akses', category: 'Users' },
        { code: 'inventory.manage', name: 'Manajemen Inventaris Alat', category: 'Inventory' },
        { code: 'courses.manage', name: 'Manajemen Mata Kuliah', category: 'Academic' },
        { code: 'practicum.manage', name: 'Manajemen Modul & Jadwal Praktikum', category: 'Academic' },
        { code: 'publications.manage', name: 'Manajemen Publikasi', category: 'Publications' },
        { code: 'governance.manage', name: 'Manajemen SOP & Laporan LPJ', category: 'Governance' },
        { code: 'download-center.manage', name: 'Kelola Pusat Download', category: 'Download Center' },
        { code: 'hero.manage', name: 'Kelola Hero Photos', category: 'Hero' },
    ];

    await db.insert(permissions).values(permData);
    const insertedPerms = await db.select().from(permissions);
    console.log(`   ✅ Created ${insertedPerms.length} permissions`);

    // Assign all to Admin
    const adminPermData = insertedPerms.map(p => ({
        roleId: adminRole.id,
        permissionId: p.id
    }));

    // Assign specific academic access to Dosen
    const dosenDefaultCodes = ['dashboard.lecturer', 'courses.manage', 'practicum.manage', 'publications.manage'];
    const dosenPermData = insertedPerms
        .filter(p => dosenDefaultCodes.includes(p.code))
        .map(p => ({
            roleId: dosenRole.id,
            permissionId: p.id
        }));

    await db.insert(rolePermissions).values([...adminPermData, ...dosenPermData]);
    console.log(`   ✅ Assigned permissions to Admin and Dosen roles`);

    return insertedPerms;
}

/**
 * 3. Seed Users (Admin & Dosen only)
 */
export async function seedUsers() {
    console.log('\n👥 Seeding users...');

    const allRoles = await db.select().from(roles);
    const adminRole = allRoles.find(r => r.name === 'Admin')!;
    const dosenRole = allRoles.find(r => r.name === 'Dosen')!;

    const adminPassword = await bcrypt.hash('admin', 10);
    const dosenPassword = await bcrypt.hash('dosen', 10);

    // Lecturer names
    const lecturerNames = ['Dr. Ir Winangsari Pradani, M.T.', 'Andi Arniaty, Ph.D', 'Ir. Endang Ripmiatin, M.T.', 'Dr. Ir. Ade Jamal, M.T.', 'Denny Hermawan S.T., M.Kom.', 'Riri Safitri, S.Si., M.T.', 'Doddy Haryadi, S.T., M.T.I.'];

    // Create Admin 1
    const existingAdmin = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, 'admin@lab.ac.id')
    });

    if (!existingAdmin) {
        await db.insert(users).values({
            fullName: 'Administrator',
            identifier: 'admin1',
            email: 'admin@lab.ac.id',
            passwordHash: adminPassword,
            roleId: adminRole.id,
            status: 'Active',
            dosenPembimbing: '-',
            phoneNumber: '081200000000',
        });
        console.log('   ✅ Created admin user');
    }

    // Create Admin 2
    const existingAdmin2 = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, 'admin02@lab.ac.id')
    });

    if (!existingAdmin2) {
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
        console.log('   ✅ Created admin02 user');
    }

    // Create lecturers
    for (let i = 0; i < lecturerNames.length; i++) {
        const email = `dosen${i + 1}@lab.ac.id`;
        const existing = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, email)
        });
        if (!existing) {
            await db.insert(users).values({
                fullName: lecturerNames[i],
                identifier: `DSN${String(i + 1).padStart(3, '0')}`,
                email,
                passwordHash: dosenPassword,
                roleId: dosenRole.id,
                status: 'Active',
                dosenPembimbing: '-',
                phoneNumber: `08121000${String(i + 1).padStart(3, '0')}`,
            });
        }
    }
    console.log(`   ✅ Created ${lecturerNames.length} lecturers`);

    return await db.select().from(users);
}

/**
 * 4. Seed Courses
 */
export async function seedCourses() {
    console.log('\n🎓 Seeding courses...');

    const existingCourses = await db.select().from(courses);
    if (existingCourses.length > 0) {
        console.log('   ⏭️  Courses already exist, skipping...');
        return existingCourses;
    }

    const allUsers = await db.select().from(users);
    const allRoles = await db.select().from(roles);
    const dosenRole = allRoles.find(r => r.name === 'Dosen')!;
    const lecturers = allUsers.filter(u => u.roleId === dosenRole.id);

    const courseData = [
        { code: 'IF101', name: 'Algoritma Pemrograman', description: 'Dasar-dasar algoritma dan pemrograman komputer.', sks: 3, semester: 'Ganjil' as const, lecturerId: lecturers[0]?.identifier || null },
        { code: 'IF102', name: 'Struktur Data', description: 'Konsep dan implementasi struktur data: array, linked list, tree, graph.', sks: 3, semester: 'Ganjil' as const, lecturerId: lecturers[1]?.identifier || null },
        { code: 'IF201', name: 'Basis Data', description: 'Perancangan dan implementasi basis data relasional.', sks: 3, semester: 'Ganjil' as const, lecturerId: lecturers[2]?.identifier || null },
        { code: 'IF202', name: 'Jaringan Komputer', description: 'Konsep jaringan komputer, protokol, dan implementasi.', sks: 3, semester: 'Ganjil' as const, lecturerId: lecturers[0]?.identifier || null },
        { code: 'IF301', name: 'Rekayasa Perangkat Lunak', description: 'Metodologi pengembangan perangkat lunak dan software engineering.', sks: 3, semester: 'Genap' as const, lecturerId: lecturers[1]?.identifier || null },
        { code: 'IF302', name: 'Kriptografi', description: 'Konsep dan implementasi algoritma kriptografi modern.', sks: 3, semester: 'Genap' as const, lecturerId: lecturers[2]?.identifier || null },
        { code: 'IF303', name: 'Keamanan Komputer', description: 'Prinsip keamanan komputer, ethical hacking, dan cyber security.', sks: 3, semester: 'Genap' as const, lecturerId: lecturers[0]?.identifier || null },
        { code: 'IF401', name: 'Komputasi Awan', description: 'Cloud computing: IaaS, PaaS, SaaS, dan deployment.', sks: 3, semester: 'Ganjil' as const, lecturerId: lecturers[1]?.identifier || null },
        { code: 'IF402', name: 'Web Dinamis', description: 'Pengembangan aplikasi web dinamis dengan framework modern.', sks: 3, semester: 'Genap' as const, lecturerId: lecturers[2]?.identifier || null },
        { code: 'IF403', name: 'Web Semantik', description: 'Konsep semantic web, ontologi, dan linked data.', sks: 3, semester: 'Genap' as const, lecturerId: lecturers[0]?.identifier || null },
    ];

    await db.insert(courses).values(courseData);
    console.log(`   ✅ Created ${courseData.length} courses`);
    return await db.select().from(courses);
}

/**
 * 5. Seed Item Categories
 */
export async function seedItemCategories() {
    console.log('\n📦 Seeding item categories...');

    const existingCategories = await db.select().from(itemCategories);
    if (existingCategories.length > 0) {
        console.log('   ⏭️  Categories already exist, skipping...');
        return existingCategories;
    }

    const categoryData = [
        { name: 'Laptop' },
        { name: 'Proyektor' },
        { name: 'Kamera' },
        { name: 'Mikrofon' },
        { name: 'Peralatan Jaringan' },
    ];

    await db.insert(itemCategories).values(categoryData);
    console.log(`   ✅ Created ${categoryData.length} categories`);
    return await db.select().from(itemCategories);
}

/**
 * Main Seed Function
 */
export async function runComprehensiveSeed() {
    console.log('🌱 Starting database seed...\n');
    console.log('='.repeat(50));

    try {
        await seedRoles();
        await seedPermissions();
        await seedUsers();
        await seedCourses();
        await seedItemCategories();

        console.log('\n' + '='.repeat(50));
        console.log('✅ Database seed completed successfully!');
    } catch (error) {
        console.error('\n❌ Seed failed:', error);
        throw error;
    }
}
