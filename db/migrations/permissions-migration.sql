-- ============================================
-- Permission System Migration
-- ============================================

-- 1. Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT
);

-- 2. Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    UNIQUE KEY unique_role_perm (role_id, permission_id),
    INDEX rp_role_idx (role_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 3. Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    permission_id INT NOT NULL,
    granted BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE KEY unique_user_perm (user_id, permission_id),
    INDEX up_user_idx (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 4. Seed all permissions
INSERT INTO permissions (code, name, category, description) VALUES
('inventory.view', 'Lihat Inventaris', 'Inventory', 'Melihat daftar barang inventaris'),
('inventory.manage', 'Kelola Inventaris', 'Inventory', 'CRUD barang, kategori, ruangan'),
('loans.request', 'Ajukan Peminjaman', 'Loans', 'Mengajukan peminjaman alat'),
('loans.manage', 'Kelola Peminjaman', 'Loans', 'Approve/reject/return peminjaman'),
('bookings.request', 'Ajukan Booking', 'Bookings', 'Mengajukan booking ruangan'),
('bookings.manage', 'Kelola Booking', 'Bookings', 'Approve/reject booking ruangan'),
('publications.manage', 'Kelola Publikasi', 'Publications', 'CRUD publikasi jurnal'),
('download-center.manage', 'Kelola Pusat Download', 'Download Center', 'Upload/hapus dokumen pusat download'),
('governance.view', 'Lihat Tata Kelola', 'Governance', 'Melihat dokumen SOP dan LPJ'),
('governance.manage', 'Kelola Tata Kelola', 'Governance', 'Upload/hapus dokumen SOP dan LPJ'),
('users.manage', 'Kelola User', 'Users', 'CRUD user, approval, assign permission'),
('courses.manage', 'Kelola Mata Kuliah', 'Courses', 'CRUD mata kuliah'),
('practicum.manage', 'Kelola Praktikum', 'Practicum', 'Kelola jadwal dan modul praktikum'),
('dashboard.admin', 'Dashboard Admin', 'Dashboard', 'Akses dashboard admin dengan statistik'),
('dashboard.lecturer', 'Dashboard Dosen', 'Dashboard', 'Akses dashboard dosen'),
('hero.manage', 'Kelola Hero Photos', 'Hero', 'Kelola foto hero homepage'),
('attendance.manage', 'Kelola Absensi', 'Attendance', 'Kelola data absensi lab');

-- 11. Add custom role activation flag on users
ALTER TABLE users
ADD COLUMN custom_role_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- 12. Extend governance_docs type enum for download center
ALTER TABLE governance_docs
MODIFY COLUMN type ENUM('SOP', 'LPJ Bulanan', 'Pusat Download') NOT NULL;

-- 5. Seed Admin defaults (ALL permissions except dashboard.lecturer)
-- Assuming Admin role id = 1
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'Admin'),
    id
FROM permissions
WHERE code != 'dashboard.lecturer';

-- 6. Seed Dosen defaults
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'Dosen'),
    id
FROM permissions
WHERE code IN ('bookings.request', 'publications.manage', 'dashboard.lecturer');

-- 7. Seed Mahasiswa defaults
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'Mahasiswa'),
    id
FROM permissions
WHERE code IN ('loans.request', 'bookings.request');

-- 8. Migrate Kaprodi users → Dosen + custom permissions
-- First, add custom permissions for existing Kaprodi users
INSERT INTO user_permissions (user_id, permission_id, granted)
SELECT u.id, p.id, TRUE
FROM users u
JOIN roles r ON u.role_id = r.id
CROSS JOIN permissions p
WHERE r.name = 'Kaprodi'
AND p.code IN ('governance.view');

-- Update Kaprodi users to Dosen role
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE name = 'Dosen')
WHERE role_id = (SELECT id FROM roles WHERE name = 'Kaprodi');

-- 9. Migrate Kepala Laboratorium users → Dosen + custom permissions
INSERT INTO user_permissions (user_id, permission_id, granted)
SELECT u.id, p.id, TRUE
FROM users u
JOIN roles r ON u.role_id = r.id
CROSS JOIN permissions p
WHERE r.name = 'Kepala Laboratorium'
AND p.code IN ('courses.manage', 'practicum.manage', 'inventory.view', 'governance.view');

-- Update Kepala Lab users to Dosen role
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE name = 'Dosen')
WHERE role_id = (SELECT id FROM roles WHERE name = 'Kepala Laboratorium');

-- 10. Delete old roles (now safe since no users reference them)
DELETE FROM roles WHERE name IN ('Kaprodi', 'Kepala Laboratorium');
