-- Migration: Add title column to existing links table
-- Run this if your links table already exists

USE tinylink;

ALTER TABLE links ADD COLUMN title VARCHAR(500) NULL;

