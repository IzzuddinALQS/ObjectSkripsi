-- Add custom role activation and download center support

ALTER TABLE users
ADD COLUMN custom_role_enabled BOOLEAN NOT NULL DEFAULT FALSE;

INSERT INTO permissions (code, name, category, description)
VALUES (
    'download-center.manage',
    'Kelola Pusat Download',
    'Download Center',
    'Upload dan hapus dokumen pusat download'
)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    category = VALUES(category),
    description = VALUES(description);

ALTER TABLE governance_docs
MODIFY COLUMN type ENUM('SOP', 'LPJ Bulanan', 'Pusat Download') NOT NULL;
