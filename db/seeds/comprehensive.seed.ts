/**
 * Comprehensive Database Seed
 * Seeds ALL tables with realistic sample data
 * 
 * UPDATED FOR SIMPLIFIED PRACTICUM:
 * - Removed: classes, classEnrollments, assignments, practicalReports
 * - Added: practicumModules (simple module management)
 */

import { db } from '@/db';
import {
    roles, users,
    courses, practicumModules,
    rooms, roomBookings,
    itemCategories, items, itemLoans,
    labAttendance,
    governanceDocs, publications, heroPhotos,
    permissions, rolePermissions
} from '@/db/schema';
import bcrypt from 'bcryptjs';
import { SEED_CONFIG, SAMPLE_DATA } from './seed.config';

/**
 * Helper: Get random items from array
 */
function getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Helper: Get random item from array
 */
function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Helper: Generate date offset from now
 */
function dateOffset(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}

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
    console.log(`   ✅ Assingned permissions to Admin and Dosen roles`);

    return insertedPerms;
}

/**
 * 3. Seed Users (Admin, Dosen, Mahasiswa)
 */
export async function seedUsers() {
    console.log('\n👥 Seeding users...');

    const allRoles = await db.select().from(roles);
    const adminRole = allRoles.find(r => r.name === 'Admin')!;
    const dosenRole = allRoles.find(r => r.name === 'Dosen')!;
    const mahasiswaRole = allRoles.find(r => r.name === 'Mahasiswa')!;

    const adminPassword = await bcrypt.hash('admin', 10);
    const dosenPassword = await bcrypt.hash('dosen', 10);
    const mahasiswaPassword = await bcrypt.hash('mahasiswa', 10);

    // Lecturer names for reference
    const lecturerNames = ['Dr. Ir Winangsari Pradani, M.T.', 'Andi Arniaty, Ph.D', 'Ir. Endang Ripmiatin, M.T.', 'Dr. Ir. Ade Jamal, M.T.', 'Denny Hermawan S.T., M.Kom.', 'Riri Safitri, S.Si., M.T.', 'Doddy Haryadi, S.T., M.T.I.'];

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

    const existingAdmin2 = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, 'admin02@lab.ac.id')
    });

    if (!existingAdmin2) {
        await db.insert(users).values({
            fullName: 'Administrator 2',
            identifier: 'admin2',
            email: 'admin02@lab.ac.id',
            passwordHash: adminPassword, // using same 'admin' password
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

    // Create students with random dosenPembimbing
    const studentNames = [
        'Andi Pratama', 'Budi Wijaya', 'Citra Dewi', 'Dian Sari', 'Eka Putra',
        'Fitri Handayani', 'Galih Setiawan', 'Hendra Kusuma', 'Indah Permata', 'Joko Susanto'
    ];
    for (let i = 0; i < Math.min(SEED_CONFIG.users.studentsCount, studentNames.length); i++) {
        const email = `mahasiswa${i + 1}@lab.ac.id`;
        const existing = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, email)
        });
        if (!existing) {
            await db.insert(users).values({
                fullName: studentNames[i],
                identifier: `2024${String(i + 1).padStart(5, '0')}`,
                email,
                passwordHash: mahasiswaPassword,
                roleId: mahasiswaRole.id,
                status: 'Active',
                batch: 2024,
                studyType: getRandomItem(['Reguler', 'Hybrid']),
                dosenPembimbing: getRandomItem(lecturerNames),
                phoneNumber: `08122000${String(i + 1).padStart(3, '0')}`,
            });
        }
    }
    console.log(`   ✅ Created ${Math.min(SEED_CONFIG.users.studentsCount, studentNames.length)} students`);

    return await db.select().from(users);
}

/**
 * 3. Seed Courses
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
 * 4. Seed Practicum Modules
 */
export async function seedPracticumModules() {
    console.log('\n📚 Seeding practicum modules...');

    const existingModules = await db.select().from(practicumModules);
    if (existingModules.length > 0) {
        console.log('   ⏭️  Modules already exist, skipping...');
        return existingModules;
    }

    const allCourses = await db.select().from(courses);
    const kriptografi = allCourses.find(c => c.code === 'IF302');
    const komputasiAwan = allCourses.find(c => c.code === 'IF401');
    const basisData = allCourses.find(c => c.code === 'IF201');

    const moduleData = [
        {
            name: 'Modul 1 - Pengenalan Kriptografi',
            description: 'Mempelajari dasar-dasar kriptografi, termasuk enkripsi simetris dan asimetris.',
            courseId: kriptografi?.id || null,
            filePath: '/uploads/assignments/praktikum1.pdf',
        },
        {
            name: 'Modul 2 - Implementasi AES dan RSA',
            description: 'Praktikum implementasi algoritma AES dan RSA menggunakan Python.',
            courseId: kriptografi?.id || null,
            filePath: '/uploads/assignments/praktikum2.pdf',
        },
        {
            name: 'Modul 3 - Pengenalan Cloud Computing',
            description: 'Pengenalan konsep cloud computing, IaaS, PaaS, SaaS.',
            courseId: komputasiAwan?.id || null,
            filePath: '/uploads/assignments/praktikum3.pdf',
        },
        {
            name: 'Modul 4 - SQL dan Query Optimization',
            description: 'Praktikum query SQL dasar hingga lanjut dan teknik optimasi.',
            courseId: basisData?.id || null,
            filePath: '/uploads/assignments/praktikum4.pdf',
        },
    ];

    await db.insert(practicumModules).values(moduleData);
    console.log(`   ✅ Created ${moduleData.length} practicum modules`);
    return await db.select().from(practicumModules);
}

/**
 * 4. Seed Rooms
 */
export async function seedRooms() {
    console.log('\n🏠 Seeding rooms...');

    const existingRooms = await db.select().from(rooms);
    if (existingRooms.length > 0) {
        console.log('   ⏭️  Rooms already exist, skipping...');
        return existingRooms;
    }

    const roomData = [
        { name: 'Laboratorium Server & Database (614)', location: 'Lantai 6', capacity: 30, status: 'Tersedia' as const },
        { name: 'Laboratorium Data Science & Software Engineering (613B)', location: 'Lantai 6', capacity: 35, status: 'Tersedia' as const },
        { name: 'Laboratorium Komputer Vision (613A)', location: 'Lantai 6', capacity: 40, status: 'Tersedia' as const },
    ];

    await db.insert(rooms).values(roomData);
    console.log(`   ✅ Created ${roomData.length} rooms`);
    return await db.select().from(rooms);
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
 * 6. Seed Items
 */
export async function seedItems() {
    console.log('\n🔧 Seeding items...');

    const existingItems = await db.select().from(items);
    if (existingItems.length > 0) {
        console.log('   ⏭️  Items already exist, skipping...');
        return existingItems;
    }

    const allCategories = await db.select().from(itemCategories);
    const allRooms = await db.select().from(rooms);

    const itemData = [
        { name: 'Laptop ASUS ROG', categoryId: allCategories[0].id, roomId: allRooms[0].id, qrCode: 'ITEM-LAP-001', status: 'Tersedia' as const },
        { name: 'Laptop HP EliteBook', categoryId: allCategories[0].id, roomId: allRooms[0].id, qrCode: 'ITEM-LAP-002', status: 'Tersedia' as const },
        { name: 'Laptop Dell XPS', categoryId: allCategories[0].id, roomId: allRooms[1].id, qrCode: 'ITEM-LAP-003', status: 'Tersedia' as const },
        { name: 'Proyektor Epson EB-X51', categoryId: allCategories[1].id, roomId: allRooms[2].id, qrCode: 'ITEM-PRO-001', status: 'Tersedia' as const },
        { name: 'Proyektor BenQ MH733', categoryId: allCategories[1].id, roomId: allRooms[1].id, qrCode: 'ITEM-PRO-002', status: 'Tersedia' as const },
        { name: 'Kamera Sony A7III', categoryId: allCategories[2].id, roomId: allRooms[1].id, qrCode: 'ITEM-CAM-001', status: 'Tersedia' as const },
        { name: 'Mikrofon Blue Yeti', categoryId: allCategories[3].id, roomId: allRooms[2].id, qrCode: 'ITEM-MIC-001', status: 'Tersedia' as const },
        { name: 'Router Cisco 2901', categoryId: allCategories[4].id, roomId: allRooms[0].id, qrCode: 'ITEM-NET-001', status: 'Tersedia' as const },
        { name: 'Switch Cisco 2960', categoryId: allCategories[4].id, roomId: allRooms[0].id, qrCode: 'ITEM-NET-002', status: 'Tersedia' as const },
    ];

    await db.insert(items).values(itemData);
    console.log(`   ✅ Created ${itemData.length} items`);
    return await db.select().from(items);
}

/**
 * 7. Seed Room Bookings
 */
export async function seedRoomBookings() {
    console.log('\n📅 Seeding room bookings...');

    const existingBookings = await db.select().from(roomBookings);
    if (existingBookings.length > 0) {
        console.log('   ⏭️  Room bookings already exist, skipping...');
        return existingBookings;
    }

    const mahasiswaRole = await db.query.roles.findFirst({
        where: (roles, { eq }) => eq(roles.name, 'Mahasiswa')
    });
    const students = await db.query.users.findMany({
        where: (users, { eq }) => eq(users.roleId, mahasiswaRole!.id)
    });
    const allRooms = await db.select().from(rooms);

    const purposes = [
        'Rapat Organisasi HMIF',
        'Praktikum Jaringan Komputer',
        'Workshop Web Development',
        'Diskusi Tugas Akhir',
        'Latihan Presentasi',
    ];

    const bookingData = [];
    for (let i = 0; i < 5; i++) {
        const student = students[i % students.length];
        const room = allRooms[i % allRooms.length];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + i + 1);
        startDate.setHours(9 + i, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 2);

        bookingData.push({
            userId: student.identifier,
            roomId: room.id,
            startTime: startDate,
            endTime: endDate,
            purpose: purposes[i],
            organisasi: i % 2 === 0 ? 'HMIF' : 'Pribadi',
            jumlahPeserta: 10 + (i * 5),
            status: i < 2 ? 'Pending' as const : 'Disetujui' as const,
        });
    }

    await db.insert(roomBookings).values(bookingData);
    console.log(`   ✅ Created ${bookingData.length} room bookings`);
    return await db.select().from(roomBookings);
}

/**
 * 8. Seed Item Loans
 */
export async function seedItemLoans() {
    console.log('\n📦 Seeding item loans...');

    const existingLoans = await db.select().from(itemLoans);
    if (existingLoans.length > 0) {
        console.log('   ⏭️  Item loans already exist, skipping...');
        return existingLoans;
    }

    const mahasiswaRole = await db.query.roles.findFirst({
        where: (roles, { eq }) => eq(roles.name, 'Mahasiswa')
    });
    const students = await db.query.users.findMany({
        where: (users, { eq }) => eq(users.roleId, mahasiswaRole!.id)
    });
    const allItems = await db.select().from(items);

    const purposes = [
        'Praktikum Jaringan',
        'Tugas Akhir',
        'Proyek Mata Kuliah',
        'Penelitian',
        'Workshop',
    ];

    const loanData = [];
    for (let i = 0; i < 5; i++) {
        const student = students[i % students.length];
        const item = allItems[i % allItems.length];
        const requestDate = new Date();
        requestDate.setDate(requestDate.getDate() - (5 - i));
        const returnPlanDate = new Date();
        returnPlanDate.setDate(returnPlanDate.getDate() + i + 3);

        loanData.push({
            studentId: student.identifier,
            itemId: item.id,
            requestDate: requestDate,
            returnPlanDate: returnPlanDate,
            purpose: purposes[i],
            status: i < 2 ? 'Pending' as const : 'Disetujui' as const,
        });
    }

    await db.insert(itemLoans).values(loanData);
    console.log(`   ✅ Created ${loanData.length} item loans`);
    return await db.select().from(itemLoans);
}

/**
 * 9. Seed Publications
 */
export async function seedPublications() {
    console.log('\n📰 Seeding publications...');

    const existingPubs = await db.select().from(publications);
    if (existingPubs.length > 0) {
        console.log('   ⏭️  Publications already exist, skipping...');
        return existingPubs;
    }

    const pubData = [
        {
            title: 'Implementasi Machine Learning untuk Deteksi Fraud',
            authorName: 'Dr. Ahmad Fauzi',
            abstract: 'Penelitian ini membahas implementasi algoritma machine learning untuk mendeteksi transaksi fraud.',
            keywords: JSON.stringify(['Machine Learning', 'Fraud Detection', 'Deep Learning']),
            filePath: '/uploads/publications/publication-1.pdf',
            viewCount: 150,
            publishYear: 2025,
            publishMonth: 1,
            publishDay: 15,
        },
        {
            title: 'Analisis Keamanan Jaringan IoT',
            authorName: 'Dr. Siti Rahayu',
            abstract: 'Studi komprehensif tentang keamanan perangkat IoT dalam lingkungan smart home.',
            keywords: JSON.stringify(['IoT', 'Network Security', 'Smart Home']),
            filePath: '/uploads/publications/publication-2.pdf',
            viewCount: 89,
            publishYear: 2024,
            publishMonth: 11,
        },
        {
            title: 'Optimasi Algoritma Kriptografi pada Embedded Systems',
            authorName: 'Dr. Budi Santoso',
            abstract: 'Penelitian optimasi algoritma AES untuk implementasi pada sistem embedded.',
            keywords: JSON.stringify(['Kriptografi', 'Embedded Systems', 'AES']),
            filePath: '/uploads/publications/publication-3.pdf',
            viewCount: 67,
            publishYear: 2024,
        },
    ];

    await db.insert(publications).values(pubData);
    console.log(`   ✅ Created ${pubData.length} publications`);
    return await db.select().from(publications);
}

/**
 * 8. Seed Governance Docs
 */
export async function seedGovernanceDocs() {
    console.log('\n📋 Seeding governance docs...');

    const existingDocs = await db.select().from(governanceDocs);
    if (existingDocs.length > 0) {
        console.log('   ⏭️  Governance docs already exist, skipping...');
        return existingDocs;
    }

    const adminUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, 'admin@lab.ac.id')
    });

    const docData = [
        { type: 'SOP' as const, title: 'SOP Peminjaman Alat Lab', filePath: '/uploads/governance/sop-1.pdf', coverPath: '/uploads/governance/covers/sop-1.png', adminId: adminUser!.identifier },
        { type: 'SOP' as const, title: 'SOP Penggunaan Ruangan', filePath: '/uploads/governance/sop-2.pdf', coverPath: '/uploads/governance/covers/sop-2.png', adminId: adminUser!.identifier },
        { type: 'LPJ Bulanan' as const, title: 'LPJ Januari 2024', filePath: '/uploads/governance/lpj-bulanan-3.pdf', coverPath: '/uploads/governance/covers/lpj-bulanan-3.png', adminId: adminUser!.identifier },
        { type: 'LPJ Bulanan' as const, title: 'LPJ Februari 2024', filePath: '/uploads/governance/lpj-bulanan-4.pdf', coverPath: '/uploads/governance/covers/lpj-bulanan-4.png', adminId: adminUser!.identifier },
    ];

    await db.insert(governanceDocs).values(docData);
    console.log(`   ✅ Created ${docData.length} governance docs`);
    return await db.select().from(governanceDocs);
}

/**
 * 9. Seed Hero Photos
 */
export async function seedHeroPhotos() {
    console.log('\n🖼️  Seeding hero photos...');

    const existingPhotos = await db.select().from(heroPhotos);
    if (existingPhotos.length > 0) {
        console.log('   ⏭️  Hero photos already exist, skipping...');
        return existingPhotos;
    }

    const photoData = [
        {
            title: 'Praktikum Jaringan Komputer',
            description: 'Mahasiswa sedang melakukan praktikum konfigurasi jaringan di Lab Jaringan.',
            imageUrl: '/uploads/photos/hero-1.jpg',
            link: null,
        },
        {
            title: 'Workshop Cloud Computing',
            description: 'Kegiatan workshop cloud computing bersama praktisi industri.',
            imageUrl: '/uploads/photos/hero-2.jpg',
            link: null,
        },
        {
            title: 'Seminar Keamanan Siber',
            description: 'Seminar nasional tentang keamanan siber dan ethical hacking.',
            imageUrl: '/uploads/photos/hero-3.jpg',
            link: null,
        },
    ];

    await db.insert(heroPhotos).values(photoData);
    console.log(`   ✅ Created ${photoData.length} hero photos`);
    return await db.select().from(heroPhotos);
}

/**
 * Main Seed Function
 */
export async function runComprehensiveSeed() {
    console.log('🌱 Starting comprehensive database seed...\n');
    console.log('='.repeat(50));

    try {
        await seedRoles();
        await seedPermissions();
        await seedUsers();
        await seedCourses();
        await seedPracticumModules();
        await seedRooms();
        await seedItemCategories();
        await seedItems();
        await seedRoomBookings();
        await seedItemLoans();
        await seedPublications();
        await seedGovernanceDocs();
        await seedHeroPhotos();

        console.log('\n' + '='.repeat(50));
        console.log('✅ Comprehensive seed completed successfully!');
    } catch (error) {
        console.error('\n❌ Seed failed:', error);
        throw error;
    }
}

