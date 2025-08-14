import mysql from 'mysql2/promise';
import { DatabaseConfig } from '../types';
import { seedDatabase as seedDatabaseFromSeeder } from './seeder';

// Database configuration
const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Akila@123',
  database: process.env.DB_NAME || 'agriconnect',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeoutMillis: 60000,
  connectTimeout: 60000
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

// Check if database is already properly initialized
const isDatabaseInitialized = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    
    // Check if key tables exist
    const [tables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name IN (
        'users', 'soil_collection_centers', 'locations', 'provinces', 'districts'
      )
    `, [dbConfig.database]);
    
    const tableNames = (tables as mysql.RowDataPacket[]).map(row => row.table_name);
    
    // Check if we have all required tables
    if (tableNames.length < 5) {
      connection.release();
      return false;
    }
    
    // Check if we have at least one user and one soil collection center
    const [userCount] = await connection.execute(`SELECT COUNT(*) as count FROM users`);
    const [centerCount] = await connection.execute(`SELECT COUNT(*) as count FROM soil_collection_centers`);
    
    const hasUsers = (userCount as any[])[0].count > 0;
    const hasCenters = (centerCount as any[])[0].count > 0;
    
    connection.release();
    
    // Return true only if we have all required tables AND some data
    return tableNames.length >= 5 && hasUsers && hasCenters;
  } catch (error) {
    // If we can't check, assume it's not initialized
    console.log('Database initialization check failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    
    // Create database if not exists (use query for DDL statements)
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.query(`USE ${dbConfig.database}`);
    
    
    // Create tables from scratch
    await createTables(connection);
    
    connection.release();
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error:', error);
    return false;
  }
};

// Create all tables
const createTables = async (connection: mysql.PoolConnection): Promise<void> => {
  // Users table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      role ENUM('farmer', 'admin', 'super_admin') NOT NULL,
      username VARCHAR(100) UNIQUE,
      email VARCHAR(150) UNIQUE,
      password_hash VARCHAR(255) NULL,
      google_oauth_id VARCHAR(255) NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NULL,
      profile_image_url VARCHAR(255) NULL,
      language ENUM('si', 'ta', 'en') DEFAULT 'si',
      phone VARCHAR(20) NOT NULL,
      nic VARCHAR(20) NOT NULL,
      location_id BIGINT NULL,
      latitude DECIMAL(10,8) NULL,
      longitude DECIMAL(11,8) NULL,
      place_id VARCHAR(255) NULL,
      location_name VARCHAR(255) NULL,
      location_address VARCHAR(500) NULL,
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
      INDEX idx_active (is_active),
      INDEX idx_latitude (latitude),
      INDEX idx_longitude (longitude),
      INDEX idx_place_id (place_id)
    )
  `);

  // Provinces table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS provinces (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(10) UNIQUE NOT NULL
    )
  `);

  // Districts table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS districts (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(10) UNIQUE NOT NULL,
      province_id BIGINT NOT NULL,
      FOREIGN KEY (province_id) REFERENCES provinces(id)
    )
  `);

  // Equipment categories table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS equipment_categories (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_active (is_active)
    )
  `);

  // Equipment table (enhanced) - Drop old tables that depend on machines first
  await connection.execute(`DROP TABLE IF EXISTS machine_rentals`);
  await connection.execute(`DROP TABLE IF EXISTS machines`);
  
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS equipment (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(150) NOT NULL,
      category_id BIGINT NOT NULL,
      description TEXT,
      daily_rate DECIMAL(10,2) NOT NULL,
      weekly_rate DECIMAL(10,2) NOT NULL,
      monthly_rate DECIMAL(10,2) NULL,
      contact_number VARCHAR(20) NOT NULL,
      delivery_fee DECIMAL(10,2) DEFAULT 0.00,
      security_deposit DECIMAL(10,2) DEFAULT 0.00,
      equipment_image_url VARCHAR(500) NULL,
      specifications TEXT NULL,
      maintenance_notes TEXT NULL,
      is_available BOOLEAN DEFAULT TRUE,
      is_active BOOLEAN DEFAULT TRUE,
      current_status VARCHAR(20) DEFAULT 'available',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category_id),
      INDEX idx_available (is_available),
      INDEX idx_active (is_active),
      INDEX idx_status (current_status)
    )
  `);

  // Equipment availability table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS equipment_availability (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      equipment_id BIGINT NOT NULL,
      date DATE NOT NULL,
      is_available BOOLEAN DEFAULT TRUE,
      reason VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_equipment_date (equipment_id, date),
      INDEX idx_equipment_date (equipment_id, date),
      INDEX idx_available (is_available)
    )
  `);

  // Equipment rental requests table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS equipment_rental_requests (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      farmer_id BIGINT NOT NULL,
      equipment_id BIGINT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      rental_duration INT NOT NULL COMMENT 'Duration in days',
      total_amount DECIMAL(10,2) NOT NULL,
      delivery_fee DECIMAL(10,2) DEFAULT 0.00,
      security_deposit DECIMAL(10,2) DEFAULT 0.00,
      receiver_name VARCHAR(100) NOT NULL,
      receiver_phone VARCHAR(20) NOT NULL,
      delivery_address TEXT NOT NULL,
      delivery_latitude DECIMAL(10,8) NULL,
      delivery_longitude DECIMAL(11,8) NULL,
      additional_notes TEXT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      admin_notes TEXT NULL,
      rejection_reason TEXT NULL,
      approved_by BIGINT NULL,
      approved_at TIMESTAMP NULL,
      pickup_qr_code_url VARCHAR(500) NULL,
      pickup_qr_code_data TEXT NULL,
      return_qr_code_url VARCHAR(500) NULL,
      return_qr_code_data TEXT NULL,
      pickup_confirmed_at TIMESTAMP NULL,
      return_confirmed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_farmer (farmer_id),
      INDEX idx_equipment (equipment_id),
      INDEX idx_status (status),
      INDEX idx_dates (start_date, end_date),
      INDEX idx_approved_by (approved_by)
    )
  `);

  // Warehouse categories table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS warehouse_categories (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      description TEXT
    )
  `);

  // Warehouses table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS warehouses (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      contact_person_name VARCHAR(150) NOT NULL,
      contact_person_number VARCHAR(20) NOT NULL,
      warehouse_status ENUM('open', 'closed') DEFAULT 'open',
      fixed_space_amount DECIMAL(10,2) NOT NULL,
      temperature_range VARCHAR(100),
      security_level ENUM('high', 'medium', 'low') DEFAULT 'medium',
      description TEXT,
      category_id BIGINT NOT NULL,
      address TEXT NOT NULL,
      province_id BIGINT NOT NULL,
      district_id BIGINT NOT NULL,
      is_available BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      -- FOREIGN KEY (category_id) REFERENCES warehouse_categories(id),
      -- FOREIGN KEY (province_id) REFERENCES provinces(id),
      -- FOREIGN KEY (district_id) REFERENCES districts(id),
      INDEX idx_name (name),
      INDEX idx_status (warehouse_status),
      INDEX idx_security_level (security_level),
      INDEX idx_available (is_available),
      INDEX idx_category (category_id)
    )
  `);

  // Field officers table (updated with profile image)
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS field_officers (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      designation VARCHAR(255) NOT NULL,
      description TEXT,
      center VARCHAR(255),
      phone_no VARCHAR(20),
      specialization VARCHAR(100),
      assigned_province_id BIGINT,
      assigned_district_id BIGINT,
      profile_image_url VARCHAR(500),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_province_id) REFERENCES provinces(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_district_id) REFERENCES districts(id) ON DELETE SET NULL,
      INDEX idx_specialization (specialization),
      INDEX idx_location (assigned_province_id, assigned_district_id),
      INDEX idx_is_active (is_active)
    )
  `);

  // Add profile_image_url column if it doesn't exist (migration)
  try {
    await connection.execute(`
      ALTER TABLE field_officers 
      ADD COLUMN profile_image_url VARCHAR(500) AFTER assigned_district_id
    `);
    console.log('✅ Added profile_image_url column to field_officers table');
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ profile_image_url column already exists in field_officers table');
    } else {
      console.log('ℹ️ Could not add profile_image_url column:', error.message);
    }
  }

  // Field Officer Contact Requests table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS field_officer_contact_requests (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      farmer_id BIGINT NOT NULL,
      field_officer_id BIGINT NOT NULL,
      farmer_name VARCHAR(255) NOT NULL,
      farmer_mobile VARCHAR(20) NOT NULL,
      farmer_address TEXT NOT NULL,
      current_issues TEXT NOT NULL,
      urgency_level ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
      status ENUM('pending', 'in_progress', 'completed', 'rejected') DEFAULT 'pending',
      admin_notes TEXT,
      rejection_reason TEXT,
      assigned_by BIGINT,
      assigned_at TIMESTAMP NULL,
      completed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (field_officer_id) REFERENCES field_officers(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_farmer (farmer_id),
      INDEX idx_field_officer (field_officer_id),
      INDEX idx_status (status),
      INDEX idx_urgency (urgency_level),
      INDEX idx_created_at (created_at)
    )
  `);

  // Locations table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS locations (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      district VARCHAR(150) NOT NULL,
      province VARCHAR(150) NOT NULL,
      latitude DECIMAL(10,8) NULL,
      longitude DECIMAL(11,8) NULL,
      INDEX idx_district (district),
      INDEX idx_province (province)
    )
  `);

  // Soil collection centers table (enhanced)
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS soil_collection_centers (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      location_id BIGINT NOT NULL,
      address VARCHAR(255) NOT NULL,
      contact_number VARCHAR(20) NULL,
      contact_person VARCHAR(100) NULL,
      description TEXT NULL,
      image_url VARCHAR(500) NULL,
      latitude DECIMAL(10,8) NULL,
      longitude DECIMAL(11,8) NULL,
      place_id VARCHAR(255) NULL,
      operating_hours VARCHAR(255) NULL,
      services_offered TEXT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
      INDEX idx_location (location_id),
      INDEX idx_active (is_active),
      INDEX idx_contact_person (contact_person),
      INDEX idx_latitude (latitude),
      INDEX idx_longitude (longitude),
      INDEX idx_place_id (place_id),
      INDEX idx_created_at (created_at)
    )
  `);

  // User locations table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS user_locations (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      location_type ENUM('farm', 'field', 'warehouse', 'market', 'other') NOT NULL,
      name VARCHAR(150) NOT NULL,
      description TEXT NULL,
      place_id VARCHAR(255) NULL,
      latitude DECIMAL(10,8) NULL,
      longitude DECIMAL(11,8) NULL,
      address VARCHAR(255) NULL,
      notes TEXT NULL,
      is_primary BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_location_type (location_type),
      INDEX idx_is_primary (is_primary),
      INDEX idx_is_active (is_active)
    )
  `);

  // Location history table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS location_history (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      location_id BIGINT NOT NULL,
      action ENUM('created', 'updated', 'deleted') NOT NULL,
      old_data JSON NULL,
      new_data JSON NULL,
      action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (location_id) REFERENCES user_locations(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_location_id (location_id),
      INDEX idx_action (action),
      INDEX idx_action_timestamp (action_timestamp)
    )
  `);

  // Soil testing table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS soil_testing (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      farmer_id BIGINT NOT NULL,
      soil_collection_center_id BIGINT NOT NULL,
      scheduled_date DATE NOT NULL,
      start_time TIME NULL,
      end_time TIME NULL,
      status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
      farmer_phone VARCHAR(20) NOT NULL,
      farmer_location_address TEXT NULL,
      farmer_latitude DECIMAL(10,8) NULL,
      farmer_longitude DECIMAL(11,8) NULL,
      admin_notes TEXT NULL,
      rejection_reason TEXT NULL,
      field_officer_id BIGINT NULL,
      qr_code_url VARCHAR(500) NULL,
      qr_code_data TEXT NULL,
      completed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES users(id),
      FOREIGN KEY (soil_collection_center_id) REFERENCES soil_collection_centers(id),
      FOREIGN KEY (field_officer_id) REFERENCES field_officers(id),
      INDEX idx_farmer (farmer_id),
      INDEX idx_center (soil_collection_center_id),
      INDEX idx_date (scheduled_date),
      INDEX idx_status (status),
      INDEX idx_field_officer (field_officer_id)
    )
  `);

  // Soil testing time slots table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS soil_testing_time_slots (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      soil_collection_center_id BIGINT NOT NULL,
      date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      is_available BOOLEAN DEFAULT TRUE,
      max_bookings INT DEFAULT 1,
      current_bookings INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (soil_collection_center_id) REFERENCES soil_collection_centers(id),
      UNIQUE KEY unique_slot (soil_collection_center_id, date, start_time, end_time),
      INDEX idx_center_date (soil_collection_center_id, date),
      INDEX idx_available (is_available)
    )
  `);

  // Soil testing scheduling requests table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS soil_testing_requests (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      farmer_id BIGINT NOT NULL,
      soil_collection_center_id BIGINT NOT NULL,
      preferred_date DATE NOT NULL,
      preferred_time_slot VARCHAR(50) NULL,
      farmer_phone VARCHAR(20) NOT NULL,
      farmer_location_address TEXT NULL,
      farmer_latitude DECIMAL(10,8) NULL,
      farmer_longitude DECIMAL(11,8) NULL,
      additional_notes TEXT NULL,
      status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
      admin_notes TEXT NULL,
      rejection_reason TEXT NULL,
      approved_date DATE NULL,
      approved_start_time TIME NULL,
      approved_end_time TIME NULL,
      field_officer_id BIGINT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES users(id),
      FOREIGN KEY (soil_collection_center_id) REFERENCES soil_collection_centers(id),
      FOREIGN KEY (field_officer_id) REFERENCES field_officers(id),
      INDEX idx_farmer (farmer_id),
      INDEX idx_center (soil_collection_center_id),
      INDEX idx_date (preferred_date),
      INDEX idx_status (status)
    )
  `);

  // Soil testing reports table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS soil_testing_reports (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      soil_testing_id BIGINT NOT NULL,
      farmer_id BIGINT NOT NULL,
      soil_collection_center_id BIGINT NOT NULL,
      field_officer_id BIGINT NOT NULL,
      report_file_name VARCHAR(255) NOT NULL,
      report_file_path VARCHAR(500) NOT NULL,
      report_file_size BIGINT NOT NULL,
      report_file_type VARCHAR(100) NOT NULL,
      report_title VARCHAR(255) NOT NULL,
      report_summary TEXT NULL,
      soil_ph DECIMAL(3,1) NULL,
      soil_nitrogen DECIMAL(5,2) NULL,
      soil_phosphorus DECIMAL(5,2) NULL,
      soil_potassium DECIMAL(5,2) NULL,
      soil_organic_matter DECIMAL(4,2) NULL,
      soil_texture VARCHAR(50) NULL,
      recommendations TEXT NULL,
      testing_date DATE NOT NULL,
      report_date DATE NOT NULL,
      is_public BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (soil_collection_center_id) REFERENCES soil_collection_centers(id) ON DELETE CASCADE,
      FOREIGN KEY (field_officer_id) REFERENCES field_officers(id) ON DELETE CASCADE,
      INDEX idx_soil_testing (soil_testing_id),
      INDEX idx_farmer (farmer_id),
      INDEX idx_center (soil_collection_center_id),
      INDEX idx_field_officer (field_officer_id),
      INDEX idx_testing_date (testing_date),
      INDEX idx_report_date (report_date),
      INDEX idx_is_public (is_public)
    )
  `);



  // Field visit requests table
  await connection.execute(`
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
    )
  `);



  // Warehouse images table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS warehouse_images (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      warehouse_id BIGINT NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      image_name VARCHAR(255),
      image_type VARCHAR(100),
      image_size BIGINT,
      is_primary BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
      INDEX idx_warehouse (warehouse_id),
      INDEX idx_primary (is_primary)
    )
  `);

    // Warehouse inventory table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS warehouse_inventory (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        warehouse_id BIGINT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        location VARCHAR(255),
        stored_date DATE NOT NULL,
        product_owner VARCHAR(255),
        item_condition ENUM('good', 'moderate', 'poor') DEFAULT 'good',
        expiry_date DATE,
        notes TEXT,
        farmer_id BIGINT,
        farmer_name VARCHAR(255),
        farmer_phone VARCHAR(20),
        storage_type ENUM('temporary', 'long_term') DEFAULT 'temporary',
        storage_duration_days INT,
        current_market_price DECIMAL(10,2),
        auto_sell_on_expiry BOOLEAN DEFAULT TRUE,
        expiry_action ENUM('auto_sell', 'notify_farmer', 'manual_handling') DEFAULT 'auto_sell',
        last_price_update TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
        FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_warehouse (warehouse_id),
        INDEX idx_farmer (farmer_id),
        INDEX idx_item_name (item_name),
        INDEX idx_expiry_date (expiry_date),
        INDEX idx_storage_type (storage_type)
      )
    `);

  // Warehouse availability table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS warehouse_availability (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      warehouse_id BIGINT NOT NULL,
      date DATE NOT NULL,
      is_available BOOLEAN DEFAULT TRUE,
      reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
      UNIQUE KEY unique_warehouse_date (warehouse_id, date),
      INDEX idx_warehouse_date (warehouse_id, date),
      INDEX idx_available (is_available)
    )
  `);

  // Warehouse time slots table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS warehouse_time_slots (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      warehouse_id BIGINT NOT NULL,
      date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      is_available BOOLEAN DEFAULT TRUE,
      max_bookings INT DEFAULT 1,
      current_bookings INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
      UNIQUE KEY unique_slot (warehouse_id, date, start_time, end_time),
      INDEX idx_warehouse_date (warehouse_id, date),
      INDEX idx_available (is_available)
    )
  `);

  // Warehouse bookings table (updated)
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS warehouse_bookings (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      farmer_id BIGINT NOT NULL,
      warehouse_id BIGINT NOT NULL,
      time_slot_id BIGINT NOT NULL,
      farmer_name VARCHAR(255) NOT NULL,
      farmer_mobile VARCHAR(20) NOT NULL,
      farmer_contact VARCHAR(255),
      storage_requirements TEXT,
      status ENUM('pending', 'approved', 'completed', 'rejected', 'overdue') DEFAULT 'pending',
      admin_notes TEXT,
      rejection_reason TEXT,
      qr_code_url VARCHAR(500),
      qr_code_data VARCHAR(255),
      approved_by BIGINT,
      approved_at TIMESTAMP NULL,
      completed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
      FOREIGN KEY (time_slot_id) REFERENCES warehouse_time_slots(id) ON DELETE CASCADE,
      INDEX idx_farmer (farmer_id),
      INDEX idx_warehouse (warehouse_id),
      INDEX idx_status (status)
    )
  `);

  // Farmer warehouse requests table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS farmer_warehouse_requests (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      farmer_id BIGINT NOT NULL,
      warehouse_id BIGINT NOT NULL,
      request_type ENUM('storage', 'retrieval', 'inspection') NOT NULL,
      item_name VARCHAR(255) NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      storage_duration_days INT NOT NULL,
      storage_requirements TEXT,
      preferred_dates VARCHAR(255),
      status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
      admin_notes TEXT,
      rejection_reason TEXT,
      approved_by BIGINT,
      approved_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_farmer (farmer_id),
      INDEX idx_warehouse (warehouse_id),
      INDEX idx_status (status),
      INDEX idx_request_type (request_type)
    )
  `);

  // Market prices table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS market_prices (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      item_name VARCHAR(255) NOT NULL,
      current_price DECIMAL(10,2) NOT NULL,
      unit VARCHAR(20) NOT NULL DEFAULT 'kg',
      price_date DATE NOT NULL,
      source VARCHAR(255) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_item_name (item_name),
      INDEX idx_price_date (price_date),
      INDEX idx_source (source)
    )
  `);

  // Expiry notifications table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS expiry_notifications (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      inventory_id BIGINT NOT NULL,
      farmer_id BIGINT NOT NULL,
      notification_type ENUM('expiring_soon', 'expired', 'auto_sold') NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (inventory_id) REFERENCES warehouse_inventory(id) ON DELETE CASCADE,
      FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_farmer (farmer_id),
      INDEX idx_inventory (inventory_id),
      INDEX idx_notification_type (notification_type),
      INDEX idx_is_read (is_read)
    )
  `);

  // Notifications table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_type (type),
      INDEX idx_is_read (is_read),
      INDEX idx_created_at (created_at)
    )
  `);

  // Audit logs table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NULL,
      action VARCHAR(100) NOT NULL,
      table_name VARCHAR(100) NULL,
      record_id BIGINT NULL,
      old_values JSON NULL,
      new_values JSON NULL,
      ip_address VARCHAR(45) NULL,
      user_agent TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_user_id (user_id),
      INDEX idx_action (action),
      INDEX idx_table_name (table_name),
      INDEX idx_created_at (created_at)
    )
  `);

  // Market rates table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS market_rates (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      crop_name VARCHAR(100) NOT NULL,
      price_per_kg DECIMAL(10,2) NOT NULL,
      province_id BIGINT NOT NULL,
      district_id BIGINT NOT NULL,
      date DATE NOT NULL,
      source VARCHAR(100),
      FOREIGN KEY (province_id) REFERENCES provinces(id),
      FOREIGN KEY (district_id) REFERENCES districts(id)
    )
  `);
};

// Seed database with initial data
const seedDatabase = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    
    // Seed provinces
    await connection.execute(`
      INSERT IGNORE INTO provinces (name, code) VALUES
      ('Western Province', 'WP'),
      ('Central Province', 'CP'),
      ('Southern Province', 'SP'),
      ('Northern Province', 'NP'),
      ('Eastern Province', 'EP'),
      ('North Western Province', 'NWP'),
      ('North Central Province', 'NCP'),
      ('Uva Province', 'UP'),
      ('Sabaragamuwa Province', 'SGP')
    `);

    // Seed districts
    await connection.execute(`
      INSERT IGNORE INTO districts (name, code, province_id) VALUES
      ('Colombo', 'COL', 1),
      ('Gampaha', 'GAM', 1),
      ('Kalutara', 'KAL', 1),
      ('Kandy', 'KAN', 2),
      ('Matale', 'MAT', 2),
      ('Nuwara Eliya', 'NUE', 2),
      ('Galle', 'GAL', 3),
      ('Matara', 'MAT', 3),
      ('Hambantota', 'HAM', 3)
    `);

    // Seed admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await connection.execute(`
      INSERT IGNORE INTO users (username, email, phone, nic, password_hash, role, first_name, last_name, is_active)
      VALUES ('admin', 'admin@agriconnect.lk', '0770000000', '000000000001', ?, 'admin', 'System', 'Administrator', TRUE)
    `, [hashedPassword]);

    // Seed equipment categories
    await connection.execute(`
      INSERT IGNORE INTO equipment_categories (name, description) VALUES
      ('Tractors', 'Agricultural tractors and machinery'),
      ('Harvesters', 'Crop harvesting equipment'),
      ('Irrigation', 'Water management systems')
    `);

    // Seed machines
    await connection.execute(`
      INSERT IGNORE INTO machines (name, description, category_id, daily_rate, is_available) VALUES
      ('John Deere Tractor', '50 HP agricultural tractor', 1, 15000.00, TRUE),
      ('Combine Harvester', 'Multi-crop harvesting machine', 2, 25000.00, TRUE),
      ('Drip Irrigation System', 'Automated water distribution', 3, 5000.00, TRUE)
    `);

    // Seed warehouse categories
    await connection.execute(`
      INSERT IGNORE INTO warehouse_categories (name, description) VALUES
      ('Grain Storage', 'Storage facilities for grains and cereals'),
      ('Cold Storage', 'Temperature controlled storage'),
      ('General Storage', 'Multi-purpose storage facilities')
    `);

    // Seed warehouses
    await connection.execute(`
      INSERT IGNORE INTO warehouses (name, description, category_id, address, province_id, district_id, capacity, is_available) VALUES
      ('Central Grain Hub', 'Main grain storage facility', 1, '123 Main St, Colombo', 1, 1, 1000.00, TRUE),
      ('Cold Storage Center', 'Refrigerated storage facility', 2, '456 Industrial Ave, Gampaha', 1, 2, 500.00, TRUE),
      ('General Warehouse', 'Multi-purpose storage', 3, '789 Storage Rd, Kalutara', 1, 3, 750.00, TRUE)
    `);





    // Seed locations
    await connection.execute(`
      INSERT IGNORE INTO locations (name, district, province, latitude, longitude) VALUES
      ('Colombo Central', 'Colombo', 'Western Province', 6.9271, 79.8612),
      ('Gampaha City', 'Gampaha', 'Western Province', 7.0841, 79.9915),
      ('Kalutara Town', 'Kalutara', 'Western Province', 6.5833, 79.9593),
      ('Kandy City', 'Kandy', 'Central Province', 7.2906, 80.6337),
      ('Matale Town', 'Matale', 'Central Province', 7.4675, 80.6234),
      ('Nuwara Eliya', 'Nuwara Eliya', 'Central Province', 6.9497, 80.7891),
      ('Galle City', 'Galle', 'Southern Province', 6.0535, 80.2210),
      ('Matara City', 'Matara', 'Southern Province', 5.9483, 80.5353),
      ('Hambantota Town', 'Hambantota', 'Southern Province', 6.1244, 81.1186)
    `);

    // Seed soil collection centers (updated structure)
    await connection.execute(`
      INSERT IGNORE INTO soil_collection_centers (
        name, location_id, address, contact_number, contact_person, 
        description, image_url, latitude, longitude, place_id, 
        operating_hours, services_offered, is_active
      ) VALUES 
      (
        'Colombo Central Soil Testing Lab',
        1,
        '123 Agriculture Road, Colombo 10',
        '0712345678',
        'Dr. Silva',
        'State-of-the-art soil testing laboratory offering comprehensive soil analysis services including pH testing, nutrient analysis, and soil composition testing.',
        'https://example.com/images/colombo-lab.jpg',
        6.9271,
        79.8612,
        'ChIJqWYFlV5m4zoR3WpuNi6ZtHE',
        'Monday - Friday: 8:00 AM - 5:00 PM, Saturday: 8:00 AM - 12:00 PM',
        'pH Testing, Nutrient Analysis, Soil Composition, Organic Matter Testing, Heavy Metal Testing',
        TRUE
      ),
      (
        'Gampaha Agricultural Laboratory',
        2,
        '456 Farming Street, Gampaha',
        '0712345679',
        'Dr. Perera',
        'Specialized agricultural laboratory providing soil testing services for farmers in the Western Province.',
        'https://example.com/images/gampaha-lab.jpg',
        7.0841,
        79.9915,
        'ChIJqWYFlV5m4zoR3WpuNi6ZtHF',
        'Monday - Friday: 7:30 AM - 4:30 PM',
        'Basic Soil Testing, pH Analysis, Fertilizer Recommendations',
        TRUE
      ),
      (
        'Kalutara Soil Analysis Center',
        3,
        '789 Rural Road, Kalutara',
        '0712345680',
        'Dr. Fernando',
        'Modern soil analysis center serving the Southern Province with comprehensive testing capabilities.',
        'https://example.com/images/kalutara-lab.jpg',
        6.5833,
        79.9593,
        'ChIJqWYFlV5m4zoR3WpuNi6ZtHG',
        'Monday - Friday: 8:00 AM - 6:00 PM, Sunday: 9:00 AM - 1:00 PM',
        'Complete Soil Analysis, Water Testing, Compost Analysis, Crop-Specific Testing',
        TRUE
      )
    `);

    // Seed soil testing time slots
    await connection.execute(`
      INSERT IGNORE INTO soil_testing_time_slots (soil_collection_center_id, date, start_time, end_time, is_available, max_bookings, current_bookings) VALUES
      (1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '10:00:00', TRUE, 3, 0),
      (1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', '12:00:00', TRUE, 3, 0),
      (1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '16:00:00', TRUE, 3, 0),
      (1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '08:00:00', '10:00:00', TRUE, 3, 0),
      (1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00:00', '12:00:00', TRUE, 3, 0),
      (2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '07:30:00', '09:30:00', TRUE, 2, 0),
      (2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:30:00', '11:30:00', TRUE, 2, 0),
      (3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '10:00:00', TRUE, 2, 0),
      (3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', '12:00:00', TRUE, 2, 0)
    `);

    // Seed market rates
    await connection.execute(`
      INSERT IGNORE INTO market_rates (crop_name, price_per_kg, province_id, district_id, date, source) VALUES
      ('Rice', 120.00, 1, 1, CURDATE(), 'Department of Agriculture'),
      ('Tea', 450.00, 1, 2, CURDATE(), 'Tea Board'),
      ('Coconut', 80.00, 1, 3, CURDATE(), 'Coconut Development Authority')
    `);

    connection.release();
    return true;
  } catch (error) {
    console.error('Database seeding failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

// Auto-initialize database on startup
const autoInitializeDatabase = async (): Promise<void> => {
  try {
    console.log('🔍 Checking database initialization status...');
    
    const isInitialized = await isDatabaseInitialized();
    
    if (!isInitialized) {
      console.log('📊 Database needs initialization. Starting process...');
      
      // Always try to initialize from scratch to avoid schema conflicts
      console.log('🆕 Creating new database structure...');
      const initSuccess = await initializeDatabase();
      if (!initSuccess) {
        console.log('❌ Database initialization failed!');
        return;
      }
      
      console.log('🌱 Seeding database with initial data...');
      const seedSuccess = await seedDatabaseFromSeeder();
      if (seedSuccess) {
        console.log('✅ Database initialization and seeding completed successfully!');
      } else {
        console.log('⚠️ Database initialized but seeding failed. Some data may be missing.');
      }
    } else {
      console.log('✅ Database is already initialized and ready.');
    }
  } catch (error) {
    console.error('💥 Auto-initialization failed:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error:', error);
  }
};

// Check if we have some tables but need updates
const checkPartialTables = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    
    const [tables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name IN (
        'users', 'soil_collection_centers', 'locations', 'provinces', 'districts'
      )
    `, [dbConfig.database]);
    
    connection.release();
    
    const tableNames = (tables as mysql.RowDataPacket[]).map(row => row.table_name);
    return tableNames.length > 0 && tableNames.length < 5;
  } catch (error) {
    return false;
  }
};

// These functions are no longer needed - we always initialize from scratch

export {
  pool,
  testConnection,
  initializeDatabase,
  isDatabaseInitialized,
  autoInitializeDatabase
};
