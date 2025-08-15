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
    
    // Create contact requests table if it doesn't exist
    await createContactRequestsTable(connection);
    
    // Seed sample contact requests
    await seedContactRequests(connection);

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
  const adminUser = {
    role: 'super_admin',
    username: 'admin',
    email: 'admin@agriconnect.lk',
    password_hash: '$2a$10$qqaFeZMh9bKDFlpXyP6np.sPptIOW4w4swLBlroeLE.yQX7lVuMKS', // admin123
    first_name: 'System',
    last_name: 'Administrator',
    phone: '+94112345678',
    language: 'en'
  };

  await connection.execute(
    `INSERT IGNORE INTO users (role, username, email, password_hash, first_name, last_name, phone, language) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [adminUser.role, adminUser.username, adminUser.email, adminUser.password_hash, 
     adminUser.first_name, adminUser.last_name, adminUser.phone, adminUser.language]
  );
  console.log('Admin user seeded');
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
    // First, let's create a test farmer user if it doesn't exist
    const testFarmer = {
      role: 'farmer',
      username: 'testfarmer',
      email: 'testfarmer@example.com',
      password_hash: '$2a$10$qqaFeZMh9bKDFlpXyP6np.sPptIOW4w4swLBlroeLE.yQX7lVuMKS', // test123
      first_name: 'Test',
      last_name: 'Farmer',
      phone: '+94123456789',
      nic: '123456789012',
      language: 'en'
    };

    // Insert test farmer
    const [farmerResult] = await connection.execute(
      `INSERT IGNORE INTO users (role, username, email, password_hash, first_name, last_name, phone, nic, language) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [testFarmer.role, testFarmer.username, testFarmer.email, testFarmer.password_hash, 
       testFarmer.first_name, testFarmer.last_name, testFarmer.phone, testFarmer.nic, testFarmer.language]
    );

    let farmerId = (farmerResult as any).insertId;
    if (!farmerId) {
      // If user already exists, get their ID
      const [existingUser] = await connection.execute(
        'SELECT id FROM users WHERE username = ?',
        [testFarmer.username]
      );
      farmerId = (existingUser as any[])[0]?.id;
    }

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

export { seedDatabase };
