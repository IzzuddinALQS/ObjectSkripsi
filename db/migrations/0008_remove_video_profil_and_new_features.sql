-- Migration: Remove Video Profil, add LPJ Praktikum & Practicum Posts tables

-- 1. Delete existing 'Video Profil' records from governance_docs
DELETE FROM governance_docs WHERE type = 'Video Profil';

-- 2. Update governance_docs enum to remove 'Video Profil' and add 'Pusat Download'
ALTER TABLE governance_docs
MODIFY COLUMN type ENUM('SOP', 'LPJ Bulanan', 'Template Surat', 'Pusat Download') NOT NULL;

-- 3. Create practicum_lpj_docs table (LPJ Praktikum per jadwal)
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
);

-- 4. Create practicum_posts table (Blog/Jadwal dengan periode)
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
);

-- 5. Add new permissions for practicum assist and post management
INSERT INTO permissions (code, name, category, description)
VALUES
    ('practicum.assist', 'Asisten Praktikum', 'Academic', 'Upload LPJ Praktikum dan pengumuman/blog jadwal praktikum')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    category = VALUES(category),
    description = VALUES(description);
