-- Reset Database Script
-- This script will drop the existing database and recreate it
-- WARNING: This will delete ALL existing data!

-- Drop the existing database
DROP DATABASE IF EXISTS agriconnect;

-- Create a fresh database
CREATE DATABASE agriconnect;

-- Use the new database
USE agriconnect;

-- The auto-initialization will create all tables and seed data
-- when the application starts
