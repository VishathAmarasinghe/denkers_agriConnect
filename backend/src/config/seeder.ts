import { pool } from './database';
import { PoolConnection } from 'mysql2/promise';

const seedDatabase = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    console.log('Starting database seeding...');

    // Seed locations
    await seedLocations(connection);
    
    // Seed equipment categories
    await seedEquipmentCategories(connection);
    
    // Seed provinces and districts
    await seedProvinces(connection);
    await seedDistricts(connection);
    
    // Seed warehouse categories
    await seedWarehouseCategories(connection);
    
    // Seed sample admin user
    await seedAdminUser(connection);
    
    // Seed sample field officers
    await seedFieldOfficers(connection);
    
    // Seed sample soil collection centers
    await seedSoilCollectionCenters(connection);
    
    // Seed sample equipment
    await seedEquipment(connection);
    
    // Seed sample warehouses
    await seedWarehouses(connection);
    
    // Seed sample market rates
    await seedMarketRates(connection);
    
    // Seed market items
    await seedMarketItems(connection);
    
    // Seed market prices
    await seedMarketPrices(connection);
    
    // Create contact requests table if it doesn't exist
    await createContactRequestsTable(connection);
    
    // Seed sample contact requests
    await seedContactRequests(connection);
    
    // Seed sample warehouse inventory
    await seedWarehouseInventory(connection);

    // Seed sample farmer warehouse requests
    await seedFarmerWarehouseRequests(connection);

    connection.release();
    console.log('Database seeding completed successfully');
    return true;
  } catch (error) {
    console.error('Database seeding failed:', (error as Error).message);
    return false;
  }
};

const seedLocations = async (connection: PoolConnection): Promise<void> => {
  const locations = [
    { name: 'Colombo', district: 'Colombo', province: 'Western' },
    { name: 'Gampaha', district: 'Gampaha', province: 'Western' },
    { name: 'Kalutara', district: 'Kalutara', province: 'Western' },
    { name: 'Kandy', district: 'Kandy', province: 'Central' },
    { name: 'Matale', district: 'Matale', province: 'Central' },
    { name: 'Nuwara Eliya', district: 'Nuwara Eliya', province: 'Central' },
    { name: 'Jaffna', district: 'Jaffna', province: 'Northern' },
    { name: 'Kilinochchi', district: 'Kilinochchi', province: 'Northern' },
    { name: 'Mullaitivu', district: 'Mullaitivu', province: 'Northern' },
    { name: 'Vavuniya', district: 'Vavuniya', province: 'Northern' },
    { name: 'Anuradhapura', district: 'Anuradhapura', province: 'North Central' },
    { name: 'Polonnaruwa', district: 'Polonnaruwa', province: 'North Central' },
    { name: 'Trincomalee', district: 'Trincomalee', province: 'Eastern' },
    { name: 'Batticaloa', district: 'Batticaloa', province: 'Eastern' },
    { name: 'Ampara', district: 'Ampara', province: 'Eastern' },
    { name: 'Kurunegala', district: 'Kurunegala', province: 'North Western' },
    { name: 'Puttalam', district: 'Puttalam', province: 'North Western' },
    { name: 'Matara', district: 'Matara', province: 'Southern' },
    { name: 'Hambantota', district: 'Hambantota', province: 'Southern' },
    { name: 'Galle', district: 'Galle', province: 'Southern' },
    { name: 'Ratnapura', district: 'Ratnapura', province: 'Sabaragamuwa' },
    { name: 'Kegalle', district: 'Kegalle', province: 'Sabaragamuwa' },
    { name: 'Badulla', district: 'Badulla', province: 'Uva' },
    { name: 'Monaragala', district: 'Monaragala', province: 'Uva' }
  ];

  for (const location of locations) {
    await connection.execute(
      'INSERT IGNORE INTO locations (name, district, province) VALUES (?, ?, ?)',
      [location.name, location.district, location.province]
    );
  }
  console.log('Locations seeded');
};

const seedEquipmentCategories = async (connection: PoolConnection): Promise<void> => {
  const categories = [
    {
      name: 'Tractors',
      description: 'Agricultural tractors for various farming operations',
      is_active: true
    },
    {
      name: 'Harvesters',
      description: 'Machines for harvesting crops efficiently',
      is_active: true
    },
    {
      name: 'Planters',
      description: 'Equipment for planting seeds and seedlings',
      is_active: true
    },
    {
      name: 'Irrigation Equipment',
      description: 'Tools and systems for crop irrigation',
      is_active: true
    },
    {
      name: 'Soil Preparation Tools',
      description: 'Equipment for soil tilling and preparation',
      is_active: true
    }
  ];

  for (const category of categories) {
    await connection.execute(
      `INSERT IGNORE INTO equipment_categories (name, description, is_active) 
       VALUES (?, ?, ?)`,
      [category.name, category.description, category.is_active]
    );
  }
  console.log('🏷️ Equipment categories seeded');
};

const seedWarehouseCategories = async (connection: PoolConnection): Promise<void> => {
  const categories = [
    { name: 'Grain Storage', description: 'Storage facilities for grains and cereals' },
    { name: 'Cold Storage', description: 'Refrigerated storage for perishable goods' },
    { name: 'General Storage', description: 'Multi-purpose storage facilities' },
    { name: 'Organic Storage', description: 'Specialized storage for organic products' },
    { name: 'Seed Storage', description: 'Climate-controlled seed storage facilities' }
  ];

  for (const category of categories) {
    await connection.execute(
      'INSERT IGNORE INTO warehouse_categories (name, description) VALUES (?, ?)',
      [category.name, category.description]
    );
  }
  console.log('🏭 Warehouse categories seeded');
};

const seedAdminUser = async (connection: PoolConnection): Promise<void> => {
  // Note: In production, use proper password hashing
  const adminUsers = [
    {
      role: 'super_admin',
      username: 'admin',
      email: 'admin@agriconnect.lk',
      password_hash: '$2a$10$qqaFeZMh9bKDFlpXyP6np.sPptIOW4w4swLBlroeLE.yQX7lVuMKS', // admin123
      first_name: 'System',
      last_name: 'Administrator',
      phone: '+94112345678',
      language: 'en'
    },
    {
      role: 'admin',
      username: 'admin_user',
      email: 'admin_user@agriconnect.lk',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 123456
      first_name: 'Admin',
      last_name: 'User',
      phone: '+94112345679',
      language: 'en'
    }
  ];

  for (const adminUser of adminUsers) {
    await connection.execute(
      `INSERT IGNORE INTO users (role, username, email, password_hash, first_name, last_name, phone, language) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [adminUser.role, adminUser.username, adminUser.email, adminUser.password_hash, 
       adminUser.first_name, adminUser.last_name, adminUser.phone, adminUser.language]
    );
  }
  console.log('Admin users seeded');
};

const seedFieldOfficers = async (connection: PoolConnection): Promise<void> => {
  const officers = [
    {
      name: 'Kumara Perera',
      designation: 'Senior Agricultural Officer',
      description: 'Experienced agricultural officer specializing in general farming support and crop management',
      center: 'Colombo Agricultural Center',
      phone_no: '+94112345679',
      specialization: 'general_support',
      assigned_province_id: 1, // Western Province
      assigned_district_id: 1 // Colombo
    },
    {
      name: 'Nimal Silva',
      designation: 'Pest Control Specialist',
      description: 'Expert in pest management and control strategies with 10+ years of experience',
      center: 'Gampaha Agricultural Center',
      phone_no: '+94112345680',
      specialization: 'pest_control',
      assigned_province_id: 1, // Western Province
      assigned_district_id: 2 // Gampaha
    },
    {
      name: 'Sunil Fernando',
      designation: 'Soil Fertility Expert',
      description: 'Specialist in soil fertility and fertilizer management, certified soil scientist',
      center: 'Kalutara Agricultural Center',
      phone_no: '+94112345681',
      specialization: 'fertilizer_guidance',
      assigned_province_id: 1, // Western Province
      assigned_district_id: 3 // Kalutara
    },
    {
      name: 'Priya Mendis',
      designation: 'Agricultural Extension Officer',
      description: 'Dedicated extension officer helping farmers with modern farming techniques',
      center: 'Colombo Agricultural Center',
      phone_no: '+94112345682',
      specialization: 'extension_services',
      assigned_province_id: 1, // Western Province
      assigned_district_id: 1 // Colombo
    },
    {
      name: 'Ranjith Bandara',
      designation: 'Crop Management Specialist',
      description: 'Expert in crop rotation, disease prevention, and yield optimization',
      center: 'Gampaha Agricultural Center',
      phone_no: '+94112345683',
      specialization: 'crop_management',
      assigned_province_id: 1, // Western Province
      assigned_district_id: 2 // Gampaha
    }
  ];

  for (const officer of officers) {
    await connection.execute(
      `INSERT IGNORE INTO field_officers (name, designation, description, center, phone_no, specialization, assigned_province_id, assigned_district_id, profile_image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [officer.name, officer.designation, officer.description, officer.center, officer.phone_no, officer.specialization, officer.assigned_province_id, officer.assigned_district_id, null]
    );
  }
  console.log('👨‍🌾 Field officers seeded');
};

const seedSoilCollectionCenters = async (connection: PoolConnection): Promise<void> => {
  const centers = [
    {
      name: 'Colombo Soil Testing Center',
      location_id: 1, // Colombo
      address: '123 Agriculture Road, Colombo 10',
      contact_number: '+94112345682'
    },
    {
      name: 'Gampaha Agricultural Lab',
      location_id: 2, // Gampaha
      address: '456 Farming Street, Gampaha',
      contact_number: '+94112345683'
    },
    {
      name: 'Kalutara Soil Analysis Center',
      location_id: 3, // Kalutara
      address: '789 Rural Road, Kalutara',
      contact_number: '+94112345684'
    }
  ];

  for (const center of centers) {
    await connection.execute(
      `INSERT IGNORE INTO soil_collection_centers (name, location_id, address, contact_number) 
       VALUES (?, ?, ?, ?)`,
      [center.name, center.location_id, center.address, center.contact_number]
    );
  }
  console.log('🧪 Soil collection centers seeded');
};



const seedWarehouses = async (connection: PoolConnection): Promise<void> => {
  try {
    console.log('Starting warehouse seeding...');
    
    // First, let's check if the warehouses table exists
    const [tables] = await connection.execute('SHOW TABLES LIKE "warehouses"');
    console.log('Warehouses table check result:', tables);
    
    // Check if warehouse_categories table exists and has data
    const [categories] = await connection.execute('SELECT * FROM warehouse_categories LIMIT 5');
    console.log('Warehouse categories found:', categories);
    
    // Check if provinces table exists and has data
    const [provinces] = await connection.execute('SELECT * FROM provinces LIMIT 5');
    console.log('Provinces found:', provinces);
    
    // Check if districts table exists and has data
    const [districts] = await connection.execute('SELECT * FROM districts LIMIT 5');
    console.log('Districts found:', districts);
    
    const warehouses = [
      {
        name: 'Test Warehouse',
        contact_person_name: 'Test Person',
        contact_person_number: '0712345678',
        warehouse_status: 'open',
        fixed_space_amount: 10000.00,
        temperature_range: '20-25°C',
        security_level: 'medium',
        description: 'Test warehouse for testing',
        category_id: 1,
        address: '123 Test St, Colombo',
        province_id: 1,
        district_id: 1,
        is_available: true
      }
    ];

    for (const warehouse of warehouses) {
      try {
        console.log('Seeding warehouse:', warehouse.name);
        const result = await connection.execute(
          `INSERT IGNORE INTO warehouses (
            name, contact_person_name, contact_person_number, warehouse_status, 
            fixed_space_amount, temperature_range, security_level, description, 
            category_id, address, province_id, district_id, is_available
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            warehouse.name, warehouse.contact_person_name, warehouse.contact_person_number,
            warehouse.warehouse_status, warehouse.fixed_space_amount, warehouse.temperature_range,
            warehouse.security_level, warehouse.description, warehouse.category_id,
            warehouse.address, warehouse.province_id, warehouse.district_id, warehouse.is_available
          ]
        );
        console.log('Warehouse seeded successfully:', warehouse.name, result);
      } catch (error) {
        console.error('Error seeding warehouse:', warehouse.name, error);
      }
    }
    
    // Check if warehouses were actually inserted
    const [insertedWarehouses] = await connection.execute('SELECT * FROM warehouses LIMIT 5');
    console.log('Warehouses in database after seeding:', insertedWarehouses);
    
    console.log('🏭 Warehouses seeded');
  } catch (error) {
    console.error('Error in seedWarehouses:', error);
  }
};

const seedMarketRates = async (connection: PoolConnection): Promise<void> => {
  const marketRates = [
    { crop_name: 'Rice', price_per_kg: 120.00, province_id: 1, district_id: 1, date: new Date(), source: 'Department of Agriculture' },
    { crop_name: 'Wheat', price_per_kg: 95.00, province_id: 1, district_id: 2, date: new Date(), source: 'Department of Agriculture' },
    { crop_name: 'Corn', price_per_kg: 85.00, province_id: 1, district_id: 3, date: new Date(), source: 'Department of Agriculture' },
    { crop_name: 'Soybeans', price_per_kg: 180.00, province_id: 2, district_id: 4, date: new Date(), source: 'Department of Agriculture' },
    { crop_name: 'Potatoes', price_per_kg: 65.00, province_id: 2, district_id: 5, date: new Date(), source: 'Department of Agriculture' },
    { crop_name: 'Onions', price_per_kg: 75.00, province_id: 3, district_id: 7, date: new Date(), source: 'Department of Agriculture' },
    { crop_name: 'Tomatoes', price_per_kg: 90.00, province_id: 3, district_id: 8, date: new Date(), source: 'Department of Agriculture' },
    { crop_name: 'Cabbage', price_per_kg: 45.00, province_id: 3, district_id: 9, date: new Date(), source: 'Department of Agriculture' }
  ];

  for (const rate of marketRates) {
    await connection.execute(
      `INSERT IGNORE INTO market_rates (crop_name, price_per_kg, province_id, district_id, date, source) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [rate.crop_name, rate.price_per_kg, rate.province_id, rate.district_id, rate.date, rate.source]
    );
  }
  console.log('💰 Market rates seeded');
};

const seedProvinces = async (connection: PoolConnection): Promise<void> => {
  const provinces = [
    { name: 'Western Province', code: 'WP' },
    { name: 'Central Province', code: 'CP' },
    { name: 'Southern Province', code: 'SP' },
    { name: 'Northern Province', code: 'NP' },
    { name: 'Eastern Province', code: 'EP' },
    { name: 'North Western Province', code: 'NWP' },
    { name: 'North Central Province', code: 'NCP' },
    { name: 'Uva Province', code: 'UP' },
    { name: 'Sabaragamuwa Province', code: 'SGP' }
  ];

  for (const province of provinces) {
    await connection.execute(
      'INSERT IGNORE INTO provinces (name, code) VALUES (?, ?)',
      [province.name, province.code]
    );
  }
  console.log('🏛️ Provinces seeded');
};

const seedDistricts = async (connection: PoolConnection): Promise<void> => {
  const districts = [
    { name: 'Colombo', code: 'COL', province_id: 1 },
    { name: 'Gampaha', code: 'GAM', province_id: 1 },
    { name: 'Kalutara', code: 'KAL', province_id: 1 },
    { name: 'Kandy', code: 'KAN', province_id: 2 },
    { name: 'Matale', code: 'MAT', province_id: 2 },
    { name: 'Nuwara Eliya', code: 'NUE', province_id: 2 },
    { name: 'Jaffna', code: 'JAF', province_id: 4 },
    { name: 'Kilinochchi', code: 'KIL', province_id: 4 },
    { name: 'Mullaitivu', code: 'MUL', province_id: 4 },
    { name: 'Vavuniya', code: 'VAV', province_id: 4 },
    { name: 'Anuradhapura', code: 'ANU', province_id: 7 },
    { name: 'Polonnaruwa', code: 'POL', province_id: 7 },
    { name: 'Trincomalee', code: 'TRI', province_id: 5 },
    { name: 'Batticaloa', code: 'BAT', province_id: 5 },
    { name: 'Ampara', code: 'AMP', province_id: 5 },
    { name: 'Kurunegala', code: 'KUR', province_id: 6 },
    { name: 'Puttalam', code: 'PUT', province_id: 6 },
    { name: 'Matara', code: 'MAT', province_id: 3 },
    { name: 'Hambantota', code: 'HAM', province_id: 3 },
    { name: 'Galle', code: 'GAL', province_id: 3 },
    { name: 'Ratnapura', code: 'RAT', province_id: 9 },
    { name: 'Kegalle', code: 'KEG', province_id: 9 },
    { name: 'Badulla', code: 'BAD', province_id: 8 },
    { name: 'Monaragala', code: 'MON', province_id: 8 }
  ];

  for (const district of districts) {
    await connection.execute(
      'INSERT IGNORE INTO districts (name, code, province_id) VALUES (?, ?, ?)',
      [district.name, district.code, district.province_id]
    );
  }
  console.log('🏘️ Districts seeded');
};

const seedEquipment = async (connection: PoolConnection): Promise<void> => {
  const equipment = [
    {
      name: 'John Deere 5075E Tractor',
      category_id: 1,
      description: '75 HP utility tractor with front-end loader, perfect for medium to large farms',
      daily_rate: 15000.00,
      weekly_rate: 90000.00,
      monthly_rate: 300000.00,
      contact_number: '+94-11-2345678',
      delivery_fee: 5000.00,
      security_deposit: 50000.00,
      is_available: true,
      is_active: true,
      current_status: 'available'
    },
    {
      name: 'Mahindra 575 DI Compact Tractor',
      category_id: 1,
      description: '47 HP compact tractor ideal for small farms and tight spaces',
      daily_rate: 12000.00,
      weekly_rate: 70000.00,
      monthly_rate: 250000.00,
      contact_number: '+94-11-3456789',
      delivery_fee: 4000.00,
      security_deposit: 40000.00,
      is_available: true,
      is_active: true,
      current_status: 'available'
    },
    {
      name: 'Kubota DC60 Mini Combine Harvester',
      category_id: 2,
      description: 'Mini combine harvester for rice, wheat, and other grain crops',
      daily_rate: 25000.00,
      weekly_rate: 140000.00,
      monthly_rate: 500000.00,
      contact_number: '+94-11-4567890',
      delivery_fee: 8000.00,
      security_deposit: 75000.00,
      is_available: true,
      is_active: true,
      current_status: 'available'
    },
    {
      name: '8-Row Seed Drill',
      category_id: 3,
      description: 'Precision seed drill for efficient planting of various crops',
      daily_rate: 8000.00,
      weekly_rate: 45000.00,
      monthly_rate: 150000.00,
      contact_number: '+94-11-5678901',
      delivery_fee: 3000.00,
      security_deposit: 25000.00,
      is_available: true,
      is_active: true,
      current_status: 'available'
    },
    {
      name: 'Drip Irrigation System',
      category_id: 4,
      description: 'Complete drip irrigation setup for efficient water management',
      daily_rate: 5000.00,
      weekly_rate: 28000.00,
      monthly_rate: 100000.00,
      contact_number: '+94-11-6789012',
      delivery_fee: 2000.00,
      security_deposit: 20000.00,
      is_available: true,
      is_active: true,
      current_status: 'available'
    },
    {
      name: 'Rotary Tiller',
      category_id: 5,
      description: 'Heavy-duty rotary tiller for soil preparation and cultivation',
      daily_rate: 6000.00,
      weekly_rate: 32000.00,
      monthly_rate: 120000.00,
      contact_number: '+94-11-7890123',
      delivery_fee: 2500.00,
      security_deposit: 30000.00,
      is_available: true,
      is_active: true,
      current_status: 'available'
    }
  ];

  for (const item of equipment) {
    await connection.execute(
      `INSERT IGNORE INTO equipment (
        name, category_id, description, daily_rate, weekly_rate, monthly_rate,
        contact_number, delivery_fee, security_deposit, is_available, is_active, current_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.name, item.category_id, item.description, item.daily_rate, item.weekly_rate, item.monthly_rate,
        item.contact_number, item.delivery_fee, item.security_deposit, item.is_available, item.is_active, item.current_status
      ]
    );
  }
  console.log('Equipment seeded');
  
  // Seed equipment rental requests
  await seedEquipmentRentalRequests(connection);
};

const createContactRequestsTable = async (connection: PoolConnection): Promise<void> => {
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS field_officer_contact_requests (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        farmer_id BIGINT NOT NULL,
        field_officer_id BIGINT NOT NULL,
        farmer_name VARCHAR(150) NOT NULL,
        farmer_mobile VARCHAR(20) NOT NULL,
        farmer_address TEXT,
        current_issues TEXT NOT NULL,
        urgency_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        status ENUM('pending', 'in_progress', 'completed', 'rejected') DEFAULT 'pending',
        admin_notes TEXT,
        rejection_reason TEXT,
        assigned_by BIGINT NULL,
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
        INDEX idx_created (created_at)
      )
    `);
    console.log('Contact requests table created');
  } catch (error) {
          console.error('Failed to create contact requests table:', error);
  }
};

const seedContactRequests = async (connection: PoolConnection): Promise<void> => {
  try {
    // Create multiple farmer users if they don't exist
    const farmers = [
      {
        role: 'farmer',
        username: 'testfarmer',
        email: 'testfarmer@example.com',
        password_hash: '$2a$10$qqaFeZMh9bKDFlpXyP6np.sPptIOW4w4swLBlroeLE.yQX7lVuMKS', // test123
        first_name: 'Test',
        last_name: 'Farmer',
        phone: '+94123456789',
        nic: '123456789012',
        language: 'en'
      },
      {
        role: 'farmer',
        username: 'farmer1',
        email: 'farmer1@example.com',
        password_hash: '$2a$10$qqaFeZMh9bKDFlpXyP6np.sPptIOW4w4swLBlroeLE.yQX7lVuMKS', // test123
        first_name: 'John',
        last_name: 'Doe',
        phone: '+94123456790',
        nic: '123456789013',
        language: 'en'
      },
      {
        role: 'farmer',
        username: 'farmer2',
        email: 'farmer2@example.com',
        password_hash: '$2a$10$qqaFeZMh9bKDFlpXyP6np.sPptIOW4w4swLBlroeLE.yQX7lVuMKS', // test123
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+94123456791',
        nic: '123456789014',
        language: 'en'
      },
      {
        role: 'farmer',
        username: 'farmer3',
        email: 'farmer3@example.com',
        password_hash: '$2a$10$qqaFeZMh9bKDFlpXyP6np.sPptIOW4w4swLBlroeLE.yQX7lVuMKS', // test123
        first_name: 'Bob',
        last_name: 'Johnson',
        phone: '+94123456792',
        nic: '123456789015',
        language: 'en'
      },
      // Add the specific farmers that warehouse inventory data expects
      {
        role: 'farmer',
        username: 'kamal_perera',
        email: 'kamal.perera@example.com',
        password_hash: '$2a$10$qqaFeZMh9bKDFlpXyP6np.sPptIOW4w4swLBlroeLE.yQX7lVuMKS', // test123
        first_name: 'Kamal',
        last_name: 'Perera',
        phone: '+94712345678',
        nic: '123456789016',
        language: 'en'
      },
      {
        role: 'farmer',
        username: 'sunil_fernando',
        email: 'sunil.fernando@example.com',
        password_hash: '$2a$10$qqaFeZMh9bKDFlpXyP6np.sPptIOW4w4swLBlroeLE.yQX7lVuMKS', // test123
        first_name: 'Sunil',
        last_name: 'Fernando',
        phone: '+94712345679',
        nic: '123456789017',
        language: 'en'
      }
    ];

    // Insert all farmers
    for (const farmer of farmers) {
      await connection.execute(
        `INSERT IGNORE INTO users (role, username, email, password_hash, first_name, last_name, phone, nic, language) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [farmer.role, farmer.username, farmer.email, farmer.password_hash, 
         farmer.first_name, farmer.last_name, farmer.phone, farmer.nic, farmer.language]
      );
    }

    // Get the first farmer's ID for contact requests
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [farmers[0].username]
    );
    const farmerId = (existingUser as any[])[0]?.id;

    if (farmerId) {
      // Create sample contact requests
      const contactRequests = [
        {
          farmer_id: farmerId,
          field_officer_id: 1, // Kumara Perera
          farmer_name: 'Test Farmer',
          farmer_mobile: '+94123456789',
          farmer_address: '123 Test Farm, Colombo',
          current_issues: 'Pest infestation in paddy field, need immediate assistance',
          urgency_level: 'high'
        },
        {
          farmer_id: farmerId,
          field_officer_id: 2, // Nimal Silva
          farmer_name: 'Test Farmer',
          farmer_mobile: '+94123456789',
          farmer_address: '123 Test Farm, Colombo',
          current_issues: 'Soil fertility issues, need fertilizer guidance',
          urgency_level: 'medium'
        }
      ];

      for (const request of contactRequests) {
        await connection.execute(
          `INSERT IGNORE INTO field_officer_contact_requests (
            farmer_id, field_officer_id, farmer_name, farmer_mobile, 
            farmer_address, current_issues, urgency_level, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
          [
            request.farmer_id, request.field_officer_id, request.farmer_name, 
            request.farmer_mobile, request.farmer_address, request.current_issues, request.urgency_level
          ]
        );
      }
      console.log('Sample contact requests seeded');
    }
  } catch (error) {
          console.error('Failed to seed contact requests:', error);
  }
};

const seedMarketItems = async (connection: PoolConnection): Promise<void> => {
  try {
    const marketItems = [
      { name: 'Rice', description: 'White rice, long grain', category: 'Grains', unit: 'kg' },
      { name: 'Wheat', description: 'Whole wheat grain', category: 'Grains', unit: 'kg' },
      { name: 'Corn', description: 'Yellow corn kernels', category: 'Grains', unit: 'kg' },
      { name: 'Potatoes', description: 'Fresh potatoes', category: 'Vegetables', unit: 'kg' },
      { name: 'Tomatoes', description: 'Fresh red tomatoes', category: 'Vegetables', unit: 'kg' },
      { name: 'Onions', description: 'Fresh onions', category: 'Vegetables', unit: 'kg' },
      { name: 'Carrots', description: 'Fresh carrots', category: 'Vegetables', unit: 'kg' },
      { name: 'Cabbage', description: 'Fresh green cabbage', category: 'Vegetables', unit: 'kg' },
      { name: 'Bananas', description: 'Fresh yellow bananas', category: 'Fruits', unit: 'kg' },
      { name: 'Oranges', description: 'Fresh oranges', category: 'Fruits', unit: 'kg' },
      { name: 'Apples', description: 'Fresh red apples', category: 'Fruits', unit: 'kg' },
      { name: 'Mangoes', description: 'Fresh ripe mangoes', category: 'Fruits', unit: 'kg' },
      { name: 'Tea', description: 'Black tea leaves', category: 'Beverages', unit: 'kg' },
      { name: 'Coffee', description: 'Green coffee beans', category: 'Beverages', unit: 'kg' },
      { name: 'Sugar', description: 'White refined sugar', category: 'Sweeteners', unit: 'kg' },
      { name: 'Salt', description: 'Refined table salt', category: 'Seasonings', unit: 'kg' },
      { name: 'Chicken', description: 'Fresh chicken meat', category: 'Meat', unit: 'kg' },
      { name: 'Beef', description: 'Fresh beef meat', category: 'Meat', unit: 'kg' },
      { name: 'Fish', description: 'Fresh fish', category: 'Seafood', unit: 'kg' },
      { name: 'Eggs', description: 'Fresh chicken eggs', category: 'Dairy', unit: 'dozen' },
      { name: 'Milk', description: 'Fresh cow milk', category: 'Dairy', unit: 'liter' },
      { name: 'Cheese', description: 'Fresh cheese', category: 'Dairy', unit: 'kg' },
      { name: 'Butter', description: 'Fresh butter', category: 'Dairy', unit: 'kg' },
      { name: 'Oil', description: 'Cooking oil', category: 'Oils', unit: 'liter' },
      { name: 'Ghee', description: 'Clarified butter', category: 'Oils', unit: 'kg' }
    ];

    for (const item of marketItems) {
      await connection.execute(
        `INSERT IGNORE INTO market_items (name, description, category, unit, is_active) 
         VALUES (?, ?, ?, ?, TRUE)`,
        [item.name, item.description, item.category, item.unit]
      );
    }
    console.log('Market items seeded');
  } catch (error) {
    console.error('Failed to seed market prices:', error);
  }
};

const seedMarketPrices = async (connection: PoolConnection): Promise<void> => {
  try {
    // Get all market item IDs
    const [items] = await connection.execute('SELECT id FROM market_items');
    const itemIds = (items as any[]).map(row => row.id);

    if (itemIds.length === 0) {
      console.log('No market items found, skipping market prices seeding');
      return;
    }

    // Sample prices for each item
    const samplePrices = [
      120.00, 95.00, 85.00, 45.00, 60.00, 35.00, 40.00, 30.00, 80.00, 90.00,
      120.00, 150.00, 200.00, 350.00, 180.00, 25.00, 450.00, 650.00, 400.00, 180.00,
      120.00, 800.00, 1200.00, 200.00, 800.00
    ];

    // Insert sample prices for each item
    for (let i = 0; i < itemIds.length; i++) {
      const itemId = itemIds[i];
      const price = samplePrices[i] || 100.00; // Default price if not in sample

      await connection.execute(
        `INSERT IGNORE INTO market_prices (market_item_id, current_price, price_date, source, notes) 
         VALUES (?, ?, CURDATE(), 'admin', 'Initial market price')`,
        [itemId, price]
      );
    }
    console.log('Market prices seeded');
  } catch (error) {
    console.error('Failed to seed market prices:', error);
  }
};

const seedEquipmentRentalRequests = async (connection: PoolConnection): Promise<void> => {
  try {
    // Get farmer IDs dynamically to avoid hardcoded IDs
    const [kamalUser] = await connection.execute('SELECT id FROM users WHERE username = ?', ['kamal_perera']);
    const [sunilUser] = await connection.execute('SELECT id FROM users WHERE username = ?', ['sunil_fernando']);
    const [nimalUser] = await connection.execute('SELECT id FROM users WHERE username = ?', ['farmer1']);
    
    const kamalId = (kamalUser as any[])[0]?.id;
    const sunilId = (sunilUser as any[])[0]?.id;
    const nimalId = (nimalUser as any[])[0]?.id;

    const rentalRequests = [
      {
        farmer_id: kamalId,
        equipment_id: 1,
        start_date: '2025-08-20',
        end_date: '2025-08-22',
        rental_duration: 3,
        total_amount: 8000.00,
        delivery_fee: 500.00,
        security_deposit: 10000.00,
        receiver_name: 'Kamal Perera',
        receiver_phone: '+94711923774',
        delivery_address: '123 Rice Farm Road, Colombo District, Western Province',
        delivery_latitude: 6.9271,
        delivery_longitude: 79.8612,
        additional_notes: 'Need tractor for land preparation. Small area, mini tractor preferred.',
        status: 'pending'
      },
      {
        farmer_id: sunilId,
        equipment_id: 3,
        start_date: '2025-08-25',
        end_date: '2025-08-26',
        rental_duration: 2,
        total_amount: 8000.00,
        delivery_fee: 1000.00,
        security_deposit: 20000.00,
        receiver_name: 'Sunil Fernando',
        receiver_phone: '+94712345679',
        delivery_address: '456 Vegetable Garden, Gampaha District, Western Province',
        delivery_latitude: 7.0841,
        delivery_longitude: 79.9915,
        additional_notes: 'Rice harvesting needed. Field is about 0.8 acres.',
        status: 'pending'
      },
      {
        farmer_id: nimalId,
        equipment_id: 5,
        start_date: '2025-08-18',
        end_date: '2025-08-19',
        rental_duration: 2,
        total_amount: 3600.00,
        delivery_fee: 200.00,
        security_deposit: 3000.00,
        receiver_name: 'Nimal Silva',
        receiver_phone: '+94712345680',
        delivery_address: '789 Tea Estate, Kalutara District, Western Province',
        delivery_latitude: 6.5833,
        delivery_longitude: 79.9593,
        additional_notes: 'Planting new tea saplings. Need precision planter.',
        status: 'approved',
        admin_notes: 'Request approved. Equipment will be delivered on time.'
      },
      {
        farmer_id: kamalId,
        equipment_id: 2,
        start_date: '2025-08-10',
        end_date: '2025-08-12',
        rental_duration: 3,
        total_amount: 10500.00,
        delivery_fee: 800.00,
        security_deposit: 15000.00,
        receiver_name: 'Kamal Perera',
        receiver_phone: '+94711923774',
        delivery_address: '123 Rice Farm Road, Colombo District, Western Province',
        delivery_latitude: 6.9271,
        delivery_longitude: 79.8612,
        additional_notes: 'Large area plowing completed successfully.',
        status: 'completed',
        admin_notes: 'Equipment returned in good condition. Payment received.'
      },
      {
        farmer_id: sunilId,
        equipment_id: 7,
        start_date: '2025-08-30',
        end_date: '2025-09-02',
        rental_duration: 4,
        total_amount: 2400.00,
        delivery_fee: 100.00,
        security_deposit: 1500.00,
        receiver_name: 'Sunil Fernando',
        receiver_phone: '+94712345679',
        delivery_address: '456 Vegetable Garden, Gampaha District, Western Province',
        delivery_latitude: 7.0841,
        delivery_longitude: 79.9915,
        additional_notes: 'Need irrigation system for new vegetable plot.',
        status: 'rejected',
        admin_notes: 'Equipment not available for requested dates. Please check alternative dates.'
      }
    ];

    for (const request of rentalRequests) {
      await connection.execute(
        `INSERT IGNORE INTO equipment_rental_requests (
          farmer_id, equipment_id, start_date, end_date, rental_duration, total_amount,
          delivery_fee, security_deposit, receiver_name, receiver_phone, delivery_address, 
          delivery_latitude, delivery_longitude, additional_notes, status, admin_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          request.farmer_id, request.equipment_id, request.start_date, request.end_date,
          request.rental_duration, request.total_amount, request.delivery_fee, request.security_deposit,
          request.receiver_name, request.receiver_phone, request.delivery_address, request.delivery_latitude, request.delivery_longitude,
          request.additional_notes, request.status, request.admin_notes
        ]
      );
    }
    console.log('Equipment rental requests seeded');
  } catch (error) {
    console.error('Failed to seed equipment rental requests:', error);
  }
};

const seedWarehouseInventory = async (connection: PoolConnection): Promise<void> => {
  try {
    // Get farmer IDs dynamically to avoid hardcoded IDs
    const [kamalUser] = await connection.execute('SELECT id FROM users WHERE username = ?', ['kamal_perera']);
    const [sunilUser] = await connection.execute('SELECT id FROM users WHERE username = ?', ['sunil_fernando']);
    
    const kamalId = (kamalUser as any[])[0]?.id;
    const sunilId = (sunilUser as any[])[0]?.id;

    if (!kamalId || !sunilId) {
      console.log('Farmers not found, skipping warehouse inventory seeding');
      return;
    }

    const inventoryItems = [
      // Rice Storage Items
      {
        warehouse_id: 1,
        item_name: 'Basmati Rice',
        quantity: 5000.00,
        location: 'Section A, Rack 1',
        stored_date: '2025-08-01',
        product_owner: 'Kamal Perera',
        item_condition: 'good',
        expiry_date: '2025-11-01',
        notes: 'Premium quality basmati rice, stored in climate-controlled section',
        farmer_id: kamalId,
        farmer_name: 'Kamal Perera',
        farmer_phone: '+94712345678',
        storage_type: 'long_term',
        storage_duration_days: 90,
        current_market_price: 180.00,
        auto_sell_on_expiry: true,
        expiry_action: 'auto_sell'
      },
      {
        warehouse_id: 1,
        item_name: 'Samba Rice',
        quantity: 3000.00,
        location: 'Section A, Rack 2',
        stored_date: '2025-08-05',
        product_owner: 'Sunil Fernando',
        item_condition: 'good',
        expiry_date: '2025-10-05',
        notes: 'Local samba rice variety, good for daily consumption',
        farmer_id: sunilId,
        farmer_name: 'Sunil Fernando',
        farmer_phone: '+94712345679',
        storage_type: 'temporary',
        storage_duration_days: 60,
        current_market_price: 120.00,
        auto_sell_on_expiry: true,
        expiry_action: 'notify_farmer'
      },
      {
        warehouse_id: 1,
        item_name: 'Red Rice',
        quantity: 2000.00,
        location: 'Section A, Rack 3',
        stored_date: '2025-08-10',
        product_owner: 'Kamal Perera',
        item_condition: 'moderate',
        expiry_date: '2025-09-10',
        notes: 'Organic red rice, needs monitoring for moisture',
        farmer_id: kamalId,
        farmer_name: 'Kamal Perera',
        farmer_phone: '+94712345678',
        storage_type: 'temporary',
        storage_duration_days: 30,
        current_market_price: 200.00,
        auto_sell_on_expiry: false,
        expiry_action: 'manual_handling'
      },
      // Vegetable Storage Items
      {
        warehouse_id: 1,
        item_name: 'Potatoes',
        quantity: 1500.00,
        location: 'Section B, Rack 1',
        stored_date: '2025-08-02',
        product_owner: 'Sunil Fernando',
        item_condition: 'good',
        expiry_date: '2025-09-02',
        notes: 'Fresh potatoes, stored in cool section',
        farmer_id: sunilId,
        farmer_name: 'Sunil Fernando',
        farmer_phone: '+94712345679',
        storage_type: 'temporary',
        storage_duration_days: 30,
        current_market_price: 80.00,
        auto_sell_on_expiry: true,
        expiry_action: 'auto_sell'
      },
      {
        warehouse_id: 1,
        item_name: 'Onions',
        quantity: 800.00,
        location: 'Section B, Rack 2',
        stored_date: '2025-08-03',
        product_owner: 'Kamal Perera',
        item_condition: 'good',
        expiry_date: '2025-09-03',
        notes: 'Large onions, good quality',
        farmer_id: kamalId,
        farmer_name: 'Kamal Perera',
        farmer_phone: '+94712345678',
        storage_type: 'temporary',
        storage_duration_days: 30,
        current_market_price: 60.00,
        auto_sell_on_expiry: true,
        expiry_action: 'auto_sell'
      },
      // Grain Storage Items
      {
        warehouse_id: 1,
        item_name: 'Wheat',
        quantity: 4000.00,
        location: 'Section C, Rack 1',
        stored_date: '2025-07-15',
        product_owner: 'Kamal Perera',
        item_condition: 'good',
        expiry_date: '2025-12-15',
        notes: 'High-quality wheat for flour production',
        farmer_id: kamalId,
        farmer_name: 'Kamal Perera',
        farmer_phone: '+94712345678',
        storage_type: 'long_term',
        storage_duration_days: 150,
        current_market_price: 150.00,
        auto_sell_on_expiry: true,
        expiry_action: 'auto_sell'
      },
      {
        warehouse_id: 1,
        item_name: 'Corn',
        quantity: 2500.00,
        location: 'Section C, Rack 2',
        stored_date: '2025-07-20',
        product_owner: 'Sunil Fernando',
        item_condition: 'good',
        expiry_date: '2025-11-20',
        notes: 'Yellow corn, good for animal feed',
        farmer_id: sunilId,
        farmer_name: 'Sunil Fernando',
        farmer_phone: '+94712345679',
        storage_type: 'long_term',
        storage_duration_days: 120,
        current_market_price: 90.00,
        auto_sell_on_expiry: true,
        expiry_action: 'auto_sell'
      },
      // Spice Storage Items
      {
        warehouse_id: 1,
        item_name: 'Cinnamon',
        quantity: 500.00,
        location: 'Section D, Rack 1',
        stored_date: '2025-08-01',
        product_owner: 'Sunil Fernando',
        item_condition: 'good',
        expiry_date: '2026-02-01',
        notes: 'Premium Ceylon cinnamon, long shelf life',
        farmer_id: sunilId,
        farmer_name: 'Sunil Fernando',
        farmer_phone: '+94712345679',
        storage_type: 'long_term',
        storage_duration_days: 180,
        current_market_price: 800.00,
        auto_sell_on_expiry: true,
        expiry_action: 'auto_sell'
      },
      // Expiring Soon Items (for testing expiry functionality)
      {
        warehouse_id: 1,
        item_name: 'Fresh Tomatoes',
        quantity: 300.00,
        location: 'Section F, Rack 1',
        stored_date: '2025-08-01',
        product_owner: 'Sunil Fernando',
        item_condition: 'moderate',
        expiry_date: '2025-08-21',
        notes: 'Fresh tomatoes, need quick sale',
        farmer_id: sunilId,
        farmer_name: 'Sunil Fernando',
        farmer_phone: '+94712345679',
        storage_type: 'temporary',
        storage_duration_days: 20,
        current_market_price: 120.00,
        auto_sell_on_expiry: true,
        expiry_action: 'auto_sell'
      },
      // Expired Items (for testing expiry functionality)
      {
        warehouse_id: 1,
        item_name: 'Old Potatoes',
        quantity: 500.00,
        location: 'Section G, Rack 1',
        stored_date: '2025-07-01',
        product_owner: 'Kamal Perera',
        item_condition: 'poor',
        expiry_date: '2025-07-31',
        notes: 'Expired potatoes, need disposal',
        farmer_id: kamalId,
        farmer_name: 'Kamal Perera',
        farmer_phone: '+94712345678',
        storage_type: 'temporary',
        storage_duration_days: 30,
        current_market_price: 0.00,
        auto_sell_on_expiry: false,
        expiry_action: 'manual_handling'
      }
    ];

    for (const item of inventoryItems) {
      await connection.execute(
        `INSERT IGNORE INTO warehouse_inventory (
          warehouse_id, item_name, quantity, location, stored_date, product_owner,
          item_condition, expiry_date, notes, farmer_id, farmer_name, farmer_phone,
          storage_type, storage_duration_days, current_market_price, auto_sell_on_expiry, expiry_action
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.warehouse_id, item.item_name, item.quantity, item.location, item.stored_date,
          item.product_owner, item.item_condition, item.expiry_date, item.notes, item.farmer_id,
          item.farmer_name, item.farmer_phone, item.storage_type, item.storage_duration_days,
          item.current_market_price, item.auto_sell_on_expiry, item.expiry_action
        ]
      );
    }
    console.log('Warehouse inventory seeded');
  } catch (error) {
    console.error('Failed to seed warehouse inventory:', error);
  }
};

const seedFarmerWarehouseRequests = async (connection: PoolConnection): Promise<void> => {
  try {
    // Get farmer IDs
    const [kamalResult] = await connection.execute('SELECT id FROM users WHERE username = ?', ['kamal_perera']);
    const [sunilResult] = await connection.execute('SELECT id FROM users WHERE username = ?', ['sunil_fernando']);
    const [nimalResult] = await connection.execute('SELECT id FROM users WHERE username = ?', ['farmer3']);
    const [ranjithResult] = await connection.execute('SELECT id FROM users WHERE username = ?', ['farmer4']);
    const [lalithResult] = await connection.execute('SELECT id FROM users WHERE username = ?', ['farmer5']);
    
    const kamalId = (kamalResult as any[])[0]?.id;
    const sunilId = (sunilResult as any[])[0]?.id;
    const nimalId = (nimalResult as any[])[0]?.id;
    const ranjithId = (ranjithResult as any[])[0]?.id;
    const lalithId = (lalithResult as any[])[0]?.id;

    // Get admin user ID
    const [adminResult] = await connection.execute('SELECT id FROM users WHERE role = ?', ['admin']);
    const adminId = (adminResult as any[])[0]?.id;

    if (!kamalId || !sunilId || !nimalId || !ranjithId || !lalithId || !adminId) {
      console.log('Some required users not found, skipping farmer warehouse requests seeding');
      return;
    }

    const requests = [
      // Pending Requests
      {
        farmer_id: kamalId,
        warehouse_id: 1,
        request_type: 'storage',
        item_name: 'Basmati Rice',
        quantity: 5000.00,
        storage_duration_days: 90,
        storage_requirements: 'Climate controlled storage, humidity monitoring required',
        preferred_dates: '2025-08-20 to 2025-08-25',
        status: 'pending',
        admin_notes: null,
        rejection_reason: null,
        approved_by: null,
        approved_at: null,
        created_at: '2025-08-15 10:00:00'
      },
      {
        farmer_id: sunilId,
        warehouse_id: 2,
        request_type: 'storage',
        item_name: 'Fresh Vegetables',
        quantity: 2000.00,
        storage_duration_days: 30,
        storage_requirements: 'Cold storage, temperature 2-4°C, regular inspection needed',
        preferred_dates: '2025-08-22 to 2025-08-24',
        status: 'pending',
        admin_notes: null,
        rejection_reason: null,
        approved_by: null,
        approved_at: null,
        created_at: '2025-08-15 11:30:00'
      },
      {
        farmer_id: nimalId,
        warehouse_id: 3,
        request_type: 'storage',
        item_name: 'Organic Tea Leaves',
        quantity: 1500.00,
        storage_duration_days: 60,
        storage_requirements: 'Dry storage, away from direct sunlight, moisture control',
        preferred_dates: '2025-08-25 to 2025-08-27',
        status: 'pending',
        admin_notes: null,
        rejection_reason: null,
        approved_by: null,
        approved_at: null,
        created_at: '2025-08-15 14:15:00'
      },
      {
        farmer_id: ranjithId,
        warehouse_id: 1,
        request_type: 'storage',
        item_name: 'Wheat Grain',
        quantity: 3000.00,
        storage_duration_days: 120,
        storage_requirements: 'Standard grain storage, pest control measures',
        preferred_dates: '2025-08-28 to 2025-08-30',
        status: 'pending',
        admin_notes: null,
        rejection_reason: null,
        approved_by: null,
        approved_at: null,
        created_at: '2025-08-15 16:45:00'
      },

      // Approved Requests
      {
        farmer_id: kamalId,
        warehouse_id: 2,
        request_type: 'storage',
        item_name: 'Red Rice',
        quantity: 2500.00,
        storage_duration_days: 45,
        storage_requirements: 'Temperature controlled, regular quality checks',
        preferred_dates: '2025-08-10 to 2025-08-12',
        status: 'approved',
        admin_notes: 'Approved for cold storage. Monitor temperature regularly.',
        rejection_reason: null,
        approved_by: adminId,
        approved_at: '2025-08-12 09:00:00',
        created_at: '2025-08-10 08:30:00'
      },
      {
        farmer_id: sunilId,
        warehouse_id: 1,
        request_type: 'storage',
        item_name: 'Corn Grain',
        quantity: 4000.00,
        storage_duration_days: 90,
        storage_requirements: 'Standard grain storage, ventilation required',
        preferred_dates: '2025-08-08 to 2025-08-10',
        status: 'approved',
        admin_notes: 'Approved for grain storage. Ensure proper ventilation.',
        rejection_reason: null,
        approved_by: adminId,
        approved_at: '2025-08-10 14:30:00',
        created_at: '2025-08-08 10:15:00'
      },
      {
        farmer_id: lalithId,
        warehouse_id: 3,
        request_type: 'storage',
        item_name: 'Spices Collection',
        quantity: 800.00,
        storage_duration_days: 180,
        storage_requirements: 'Dry storage, airtight containers, away from strong odors',
        preferred_dates: '2025-08-05 to 2025-08-07',
        status: 'approved',
        admin_notes: 'Approved for general storage. Use airtight containers.',
        rejection_reason: null,
        approved_by: adminId,
        approved_at: '2025-08-07 11:20:00',
        created_at: '2025-08-05 13:45:00'
      },

      // Rejected Requests
      {
        farmer_id: nimalId,
        warehouse_id: 2,
        request_type: 'storage',
        item_name: 'Fresh Fruits',
        quantity: 1200.00,
        storage_duration_days: 20,
        storage_requirements: 'Cold storage, daily inspection required',
        preferred_dates: '2025-08-12 to 2025-08-14',
        status: 'rejected',
        admin_notes: 'Cold storage capacity full for requested dates.',
        rejection_reason: 'Insufficient cold storage capacity for the requested period. Please try alternative dates.',
        approved_by: adminId,
        approved_at: '2025-08-14 15:30:00',
        created_at: '2025-08-12 09:20:00'
      },
      {
        farmer_id: ranjithId,
        warehouse_id: 1,
        request_type: 'storage',
        item_name: 'Pulses Mix',
        quantity: 1800.00,
        storage_duration_days: 60,
        storage_requirements: 'Standard storage, pest control',
        preferred_dates: '2025-08-15 to 2025-08-17',
        status: 'rejected',
        admin_notes: 'Warehouse undergoing maintenance.',
        rejection_reason: 'Warehouse temporarily unavailable due to scheduled maintenance.',
        approved_by: adminId,
        approved_at: '2025-08-17 10:15:00',
        created_at: '2025-08-15 16:30:00'
      },

      // Completed Requests
      {
        farmer_id: kamalId,
        warehouse_id: 3,
        request_type: 'storage',
        item_name: 'Green Tea',
        quantity: 1000.00,
        storage_duration_days: 45,
        storage_requirements: 'Dry storage, away from moisture',
        preferred_dates: '2025-07-20 to 2025-07-22',
        status: 'completed',
        admin_notes: 'Successfully completed. All items stored properly.',
        rejection_reason: null,
        approved_by: adminId,
        approved_at: '2025-07-22 08:00:00',
        created_at: '2025-07-20 10:00:00'
      },
      {
        farmer_id: sunilId,
        warehouse_id: 1,
        request_type: 'storage',
        item_name: 'Barley Grain',
        quantity: 2200.00,
        storage_duration_days: 90,
        storage_requirements: 'Standard grain storage',
        preferred_dates: '2025-07-15 to 2025-07-17',
        status: 'completed',
        admin_notes: 'Storage completed successfully. Regular monitoring in place.',
        rejection_reason: null,
        approved_by: adminId,
        approved_at: '2025-07-17 14:00:00',
        created_at: '2025-07-15 11:30:00'
      },

      // Retrieval Requests
      {
        farmer_id: kamalId,
        warehouse_id: 2,
        request_type: 'retrieval',
        item_name: 'Basmati Rice',
        quantity: 2000.00,
        storage_duration_days: 0,
        storage_requirements: 'Retrieve 2000kg from existing storage',
        preferred_dates: '2025-08-18 to 2025-08-19',
        status: 'pending',
        admin_notes: null,
        rejection_reason: null,
        approved_by: null,
        approved_at: null,
        created_at: '2025-08-16 09:00:00'
      },
      {
        farmer_id: sunilId,
        warehouse_id: 1,
        request_type: 'retrieval',
        item_name: 'Wheat Grain',
        quantity: 1500.00,
        storage_duration_days: 0,
        storage_requirements: 'Retrieve 1500kg for immediate sale',
        preferred_dates: '2025-08-20 to 2025-08-21',
        status: 'approved',
        admin_notes: 'Approved for retrieval. Ensure proper documentation.',
        rejection_reason: null,
        approved_by: adminId,
        approved_at: '2025-08-21 10:00:00',
        created_at: '2025-08-18 14:30:00'
      },

      // Inspection Requests
      {
        farmer_id: nimalId,
        warehouse_id: 2,
        request_type: 'inspection',
        item_name: 'Fresh Vegetables',
        quantity: 0.00,
        storage_duration_days: 0,
        storage_requirements: 'Inspect current storage conditions and quality',
        preferred_dates: '2025-08-25 to 2025-08-25',
        status: 'pending',
        admin_notes: null,
        rejection_reason: null,
        approved_by: null,
        approved_at: null,
        created_at: '2025-08-17 16:00:00'
      },
      {
        farmer_id: lalithId,
        warehouse_id: 1,
        request_type: 'inspection',
        item_name: 'Grain Storage',
        quantity: 0.00,
        storage_duration_days: 0,
        storage_requirements: 'Quality inspection of stored grains',
        preferred_dates: '2025-08-26 to 2025-08-26',
        status: 'approved',
        admin_notes: 'Approved for inspection. Warehouse staff will assist.',
        rejection_reason: null,
        approved_by: adminId,
        approved_at: '2025-08-26 09:00:00',
        created_at: '2025-08-18 11:15:00'
      },

      // Additional Storage Requests
      {
        farmer_id: kamalId,
        warehouse_id: 1,
        request_type: 'storage',
        item_name: 'Premium Rice',
        quantity: 3500.00,
        storage_duration_days: 75,
        storage_requirements: 'Climate controlled, premium quality storage',
        preferred_dates: '2025-08-30 to 2025-09-01',
        status: 'pending',
        admin_notes: null,
        rejection_reason: null,
        approved_by: null,
        approved_at: null,
        created_at: '2025-08-19 10:30:00'
      },
      {
        farmer_id: sunilId,
        warehouse_id: 3,
        request_type: 'storage',
        item_name: 'Herbal Collection',
        quantity: 600.00,
        storage_duration_days: 120,
        storage_requirements: 'Dry storage, away from direct sunlight',
        preferred_dates: '2025-09-02 to 2025-09-04',
        status: 'pending',
        admin_notes: null,
        rejection_reason: null,
        approved_by: null,
        approved_at: null,
        created_at: '2025-08-19 15:45:00'
      },
      {
        farmer_id: nimalId,
        warehouse_id: 1,
        request_type: 'storage',
        item_name: 'Mixed Grains',
        quantity: 2800.00,
        storage_duration_days: 90,
        storage_requirements: 'Standard grain storage, pest control',
        preferred_dates: '2025-09-05 to 2025-09-07',
        status: 'pending',
        admin_notes: null,
        rejection_reason: null,
        approved_by: null,
        approved_at: null,
        created_at: '2025-08-20 08:20:00'
      }
    ];

    for (const request of requests) {
      await connection.execute(
        `INSERT IGNORE INTO farmer_warehouse_requests (
          farmer_id, warehouse_id, request_type, item_name, quantity, storage_duration_days,
          storage_requirements, preferred_dates, status, admin_notes, rejection_reason,
          approved_by, approved_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          request.farmer_id, request.warehouse_id, request.request_type, request.item_name,
          request.quantity, request.storage_duration_days, request.storage_requirements,
          request.preferred_dates, request.status, request.admin_notes, request.rejection_reason,
          request.approved_by, request.approved_at, request.created_at
        ]
      );
    }
    console.log('Farmer warehouse requests seeded');
  } catch (error) {
    console.error('Failed to seed farmer warehouse requests:', error);
  }
};

export { seedDatabase };
