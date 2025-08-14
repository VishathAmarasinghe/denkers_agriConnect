#!/usr/bin/env node

import { initializeDatabase } from '../config/database';
import { seedDatabase } from '../config/seeder';

const initDatabase = async (): Promise<void> => {
  console.log('Starting AgriConnect Database Initialization...\n');
  
  try {
    // Initialize database tables
    console.log('Creating database tables...');
    const tablesCreated = await initializeDatabase();
    
    if (!tablesCreated) {
      console.error('Failed to create database tables');
      process.exit(1);
    }
    
    console.log('Database tables created successfully\n');
    
    // Seed database with initial data
    console.log('Seeding database with initial data...');
    const dataSeeded = await seedDatabase();
    
    if (!dataSeeded) {
      console.error('Failed to seed database');
      process.exit(1);
    }
    
    console.log('Database seeded successfully\n');
    
    console.log('AgriConnect Database initialization completed successfully!');
    console.log('\nWhat was created:');
    console.log('   • Users table with admin user');
    console.log('   • Locations table with Sri Lankan provinces and districts');
    console.log('   • Equipment categories and sample machines');
    console.log('   • Warehouse categories and sample warehouses');
    console.log('   • Field officers and soil collection centers');
    console.log('   • Sample market rates');
    console.log('\nYou can now start the server with: npm start');
    
  } catch (error) {
    console.error('Database initialization failed:', (error as Error).message);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  initDatabase();
}

export { initDatabase };
