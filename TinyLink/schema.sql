USE tinylink;

CREATE TABLE IF NOT EXISTS links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(255) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  title VARCHAR(500) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  clickCount INT DEFAULT 0,
  lastClicked TIMESTAMP NULL
);

-- Migration: Add title column to existing tables (run this if table already exists)
-- ALTER TABLE links ADD COLUMN title VARCHAR(500) NULL;
