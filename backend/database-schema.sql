-- AgriConnect Database Schema
-- This file contains the complete database structure for the AgriConnect platform

-- Create database
CREATE DATABASE IF NOT EXISTS agriconnect;
USE agriconnect;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role ENUM('farmer', 'admin', 'super_admin') NOT NULL,
  username VARCHAR(100) UNIQUE,
  email VARCHAR(150) UNIQUE, -- Note: UNIQUE constraint with NULL values may cause issues
  password_hash VARCHAR(255) NULL,
  google_oauth_id VARCHAR(255) NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NULL,
  profile_image_url VARCHAR(255) NULL,
  language ENUM('si', 'ta', 'en') DEFAULT 'si',
  phone VARCHAR(20) NOT NULL,
  nic VARCHAR(20) NOT NULL,
  location_id BIGINT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  reset_otp VARCHAR(10) NULL,
  reset_otp_expiry TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role),
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_phone (phone),
  INDEX idx_nic (nic),
  INDEX idx_location (location_id),
  INDEX idx_active (is_active)
);

-- Note: If you encounter issues with multiple NULL emails due to UNIQUE constraint,
-- you can run this SQL command to fix it:
-- ALTER TABLE users DROP INDEX idx_email;
-- CREATE UNIQUE INDEX idx_email ON users (email) WHERE email IS NOT NULL;

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  district VARCHAR(150) NOT NULL,
  province VARCHAR(150) NOT NULL,
  latitude DECIMAL(10,8) NULL,
  longitude DECIMAL(11,8) NULL,
  INDEX idx_district (district),
  INDEX idx_province (province)
);

-- Soil Collection Centers table
CREATE TABLE IF NOT EXISTS soil_collection_centers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  location_id BIGINT NOT NULL,
  address VARCHAR(255) NOT NULL,
  contact_number VARCHAR(20) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  INDEX idx_location (location_id),
  INDEX idx_active (is_active)
);

-- Soil Testing table
CREATE TABLE IF NOT EXISTS soil_testing (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  farmer_id BIGINT NOT NULL,
  center_id BIGINT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  status ENUM('pending', 'approved', 'completed', 'rejected') DEFAULT 'pending',
  qr_code_url VARCHAR(255) NULL,
  report_file_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (center_id) REFERENCES soil_collection_centers(id) ON DELETE CASCADE,
  INDEX idx_farmer (farmer_id),
  INDEX idx_center (center_id),
  INDEX idx_status (status),
  INDEX idx_date (scheduled_date)
);

-- Field Officers table
CREATE TABLE IF NOT EXISTS field_officers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category ENUM('general_support', 'pest_control', 'fertilizer_guidance') NOT NULL,
  location_id BIGINT NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  details TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  INDEX idx_category (category),
  INDEX idx_location (location_id),
  INDEX idx_active (is_active)
);

-- Field Visit Requests table
CREATE TABLE IF NOT EXISTS field_visit_requests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  farmer_id BIGINT NOT NULL,
  officer_id BIGINT NOT NULL,
  requested_date DATE NOT NULL,
  request_details TEXT NULL,
  status ENUM('pending', 'approved', 'completed', 'rejected') DEFAULT 'pending',
  qr_code_url VARCHAR(255) NULL,
  feedback_rating TINYINT NULL,
  feedback_comment TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (officer_id) REFERENCES field_officers(id) ON DELETE CASCADE,
  INDEX idx_farmer (farmer_id),
  INDEX idx_officer (officer_id),
  INDEX idx_status (status),
  INDEX idx_date (requested_date)
);

-- Machinery Categories table
CREATE TABLE IF NOT EXISTS equipment_categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL
);

-- Machines table
CREATE TABLE IF NOT EXISTS machines (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  availability_status ENUM('available', 'maintenance', 'unavailable') DEFAULT 'available',
  FOREIGN KEY (category_id) REFERENCES equipment_categories(id) ON DELETE CASCADE,
  INDEX idx_category (category_id),
  INDEX idx_status (availability_status)
);

-- Machine Rentals table
CREATE TABLE IF NOT EXISTS machine_rentals (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  farmer_id BIGINT NOT NULL,
  machine_id BIGINT NOT NULL,
  rental_date DATE NOT NULL,
  rental_time TIME NULL,
  location VARCHAR(255) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  status ENUM('pending', 'approved', 'completed', 'rejected') DEFAULT 'pending',
  qr_code_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE,
  INDEX idx_farmer (farmer_id),
  INDEX idx_machine (machine_id),
  INDEX idx_status (status),
  INDEX idx_date (rental_date)
);

-- Warehouse Categories table
CREATE TABLE IF NOT EXISTS warehouse_categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL
);

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT NOT NULL,
  name VARCHAR(150) NOT NULL,
  location_id BIGINT NOT NULL,
  capacity_kg DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (category_id) REFERENCES warehouse_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  INDEX idx_category (category_id),
  INDEX idx_location (location_id),
  INDEX idx_active (is_active)
);

-- Warehouse Bookings table
CREATE TABLE IF NOT EXISTS warehouse_bookings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  farmer_id BIGINT NOT NULL,
  warehouse_id BIGINT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NULL,
  product_type VARCHAR(100) NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  additional_details TEXT NULL,
  status ENUM('pending', 'approved', 'stored', 'sold', 'expired') DEFAULT 'pending',
  qr_code_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
  INDEX idx_farmer (farmer_id),
  INDEX idx_warehouse (warehouse_id),
  INDEX idx_status (status),
  INDEX idx_date (booking_date)
);

-- Market Rates table
CREATE TABLE IF NOT EXISTS market_rates (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_type VARCHAR(100) NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  effective_date DATE NOT NULL,
  INDEX idx_product (product_type),
  INDEX idx_date (effective_date)
);

-- AI Chat Documents table
CREATE TABLE IF NOT EXISTS ai_chat_documents (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  embedding_vector_id VARCHAR(255) NULL,
  uploaded_by_admin BIGINT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by_admin) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_admin (uploaded_by_admin),
  INDEX idx_upload_date (uploaded_at)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  type ENUM('sms', 'email', 'in_app') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('sent', 'failed') DEFAULT 'sent',
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_sent_date (sent_at)
);

-- Audit and Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NULL,
  action VARCHAR(255) NOT NULL,
  details TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_created_date (created_at)
);

-- Add foreign key constraint for users.location_id after locations table is created
ALTER TABLE users 
ADD CONSTRAINT fk_users_location 
FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL;

-- Sample data insertion (optional)
-- Uncomment the following lines to insert sample data

/*
-- Insert sample locations
INSERT INTO locations (name, district, province) VALUES
('Colombo', 'Colombo', 'Western'),
('Gampaha', 'Gampaha', 'Western'),
('Kalutara', 'Kalutara', 'Western'),
('Kandy', 'Kandy', 'Central'),
('Matale', 'Matale', 'Central');

-- Insert sample equipment categories
INSERT INTO equipment_categories (name, description) VALUES
('Tractors', 'Agricultural tractors for field operations'),
('Harvesters', 'Machines for harvesting crops'),
('Planters', 'Equipment for planting seeds and seedlings');

-- Insert sample admin user
INSERT INTO users (role, username, email, first_name, last_name, phone, language) VALUES
('super_admin', 'admin', 'admin@agriconnect.lk', 'System', 'Administrator', '+94112345678', 'en');
*/
