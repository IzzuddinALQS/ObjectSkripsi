-- Add hyperlink support for practicum modules
ALTER TABLE practicum_modules
ADD COLUMN module_link VARCHAR(500) NULL;
