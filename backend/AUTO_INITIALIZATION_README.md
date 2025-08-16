# 🚀 Auto-Initialization Feature

## Overview

The AgriConnect backend now includes an **automatic database initialization** feature that creates all necessary database tables and seeds initial data when the application starts. This eliminates the need for manual database setup and ensures the application is ready to use immediately.

## ✨ Features

### 🔄 **Automatic Table Creation**
- Creates all required tables if they don't exist
- Uses `CREATE TABLE IF NOT EXISTS` for safe execution
- Handles foreign key relationships automatically
- Creates proper indexes for performance

### 🌱 **Automatic Data Seeding**
- Seeds provinces and districts data
- Creates admin user account
- Seeds equipment categories and machines
- Seeds warehouse categories and warehouses
- Seeds soil collection centers with sample data
- Seeds field officers and market rates

### 🛡️ **Safe Execution**
- Checks if database is already initialized
- Only runs initialization when needed
- Continues server startup even if initialization fails
- Provides detailed logging of the process

## 🗄️ **Database Tables Created**

### **Core Tables**
- `users` - User accounts (farmers, admins, field officers)
- `provinces` - Sri Lankan provinces
- `districts` - Districts within provinces
- `locations` - Geographic locations with coordinates

### **Service Tables**
- `soil_collection_centers` - Soil testing laboratories
- `equipment_categories` - Equipment classification
- `machines` - Available machinery for rental
- `warehouse_categories` - Storage facility types
- `warehouses` - Storage facilities
- `field_officers` - Agricultural field officers

### **Business Logic Tables**
- `user_locations` - User-defined locations (farms, fields, etc.)
- `location_history` - Audit trail for location changes
- `soil_testing` - Soil testing appointments
- `field_visit_requests` - Field officer visit requests
- `machine_rentals` - Equipment rental bookings
- `warehouse_bookings` - Storage facility bookings

### **System Tables**
- `notifications` - User notifications
- `audit_logs` - System audit trail

## 🚀 **How to Use**

### **Option 1: Automatic Startup (Recommended)**
```bash
# Simply start the server - it will auto-initialize
npm start
```

### **Option 2: Using the Startup Script**
```bash
# Use the provided startup script
./start-with-auto-init.sh
```

### **Option 3: Manual Initialization**
```bash
# Test database connection
curl http://localhost:3000/api/test-db

# Manually trigger initialization
curl -X POST http://localhost:3000/api/init-db
```

## 📊 **What Happens on Startup**

1. **Database Connection Check**
   ```
   🔍 Checking database initialization status...
   ```

2. **Table Creation (if needed)**
   ```
   📊 Database not initialized. Starting initialization...
   📊 Creating tables...
   ✅ Database initialized successfully
   ```

3. **Data Seeding (if needed)**
   ```
   🌱 Seeding database with initial data...
   ✅ Database initialization and seeding completed successfully!
   ```

4. **Server Start**
   ```
   🚀 Starting AgriConnect Backend Server...
   ✅ AgriConnect Backend server running on port 3000
   🔗 Health check: http://localhost:3000/health
   🔗 API Docs: http://localhost:3000/docs
   🔗 Soil Collection Centers: http://localhost:3000/api/v1/soil-collection-centers
   ```

## 🔧 **Configuration**

### **Environment Variables**
Make sure your `.env` file contains the necessary database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=agriconnect
DB_PORT=3306

# Other configurations...
NOTIFY_LK_API_KEY=your_api_key
NOTIFY_LK_SENDER_ID=your_sender_id
NOTIFY_LK_USER_ID=your_user_id
JWT_SECRET=your_jwt_secret
```

### **Database Requirements**
- MySQL 5.7+ or MariaDB 10.2+
- User with CREATE, INSERT, UPDATE, DELETE privileges
- Database will be created automatically if it doesn't exist

## 🧪 **Testing the Auto-Initialization**

### **Run the Complete Test Suite**
```bash
# Test all endpoints after auto-initialization
npx ts-node test-auto-init-complete.ts
```

### **Manual Testing with cURL**

#### **1. Check Database Status**
```bash
curl http://localhost:3000/api/test-db
```

#### **2. Get Admin Token**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

#### **3. Test Soil Collection Centers**
```bash
# Get all centers
curl http://localhost:3000/api/v1/soil-collection-centers

# Search centers
curl "http://localhost:3000/api/v1/soil-collection-centers/search?name=Colombo"

# Get center by ID
curl http://localhost:3000/api/v1/soil-collection-centers/1
```

## 📋 **Initial Data Seeded**

### **Provinces**
- Western Province (WP)
- Central Province (CP)
- Southern Province (SP)
- Northern Province (NP)
- Eastern Province (EP)
- North Western Province (NWP)
- North Central Province (NCP)
- Uva Province (UP)
- Sabaragamuwa Province (SGP)

### **Districts**
- Colombo, Gampaha, Kalutara (Western)
- Kandy, Matale, Nuwara Eliya (Central)
- Galle, Matara, Hambantota (Southern)

### **Admin User**
- Username: `admin`
- Password: `admin123`
- Email: `admin@agriconnect.lk`
- Role: `admin`

### **Sample Soil Collection Centers**
- Colombo Central Soil Testing Lab
- Gampaha Agricultural Laboratory
- Kalutara Soil Analysis Center

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. Database Connection Failed**
```
❌ Database connection failed: Access denied for user 'root'@'localhost'
```
**Solution**: Check your database credentials in `.env` file

#### **2. Tables Already Exist**
```
✅ Database is already initialized and ready.
```
**Status**: This is normal - the system detected existing tables

#### **3. Initialization Failed**
```
❌ Database initialization failed: ER_ACCESS_DENIED_ERROR
```
**Solution**: Ensure your database user has CREATE privileges

#### **4. Seeding Failed**
```
⚠️ Database initialized but seeding failed. Some data may be missing.
```
**Status**: Tables exist but sample data may be incomplete

### **Manual Recovery**
If auto-initialization fails, you can manually run:

```bash
# 1. Check database connection
curl http://localhost:3000/api/test-db

# 2. Manually initialize
curl -X POST http://localhost:3000/api/init-db

# 3. Check server status
curl http://localhost:3000/health
```

## 📈 **Performance Considerations**

### **First Startup**
- Initial startup may take 5-10 seconds
- Table creation and data seeding occur once
- Subsequent startups are much faster

### **Regular Startup**
- Only connection check is performed
- Startup time: 1-2 seconds
- No impact on existing data

### **Database Size**
- Initial database size: ~5-10 MB
- Sample data: ~100-200 records
- Scalable for production use

## 🔒 **Security Features**

### **Admin Account**
- Default admin password should be changed in production
- JWT-based authentication
- Role-based access control

### **Data Validation**
- Input validation on all endpoints
- SQL injection protection
- XSS protection with Helmet

## 🚀 **Production Deployment**

### **Before Deployment**
1. Change default admin password
2. Update JWT secret
3. Configure production database credentials
4. Set up proper SSL certificates

### **Environment Variables**
```env
NODE_ENV=production
JWT_SECRET=very_secure_random_string
DB_PASSWORD=production_password
```

### **Database Backup**
- Enable automatic backups
- Test restore procedures
- Monitor database performance

## 📚 **API Documentation**

After auto-initialization, you can access:
- **API Documentation**: `http://localhost:3000/docs`
- **Health Check**: `http://localhost:3000/health`
- **Database Status**: `http://localhost:3000/api/test-db`

## 🤝 **Contributing**

To add new tables or seed data:

1. **Add table creation** in `src/config/database.ts` → `createTables()`
2. **Add seed data** in `src/config/database.ts` → `seedDatabase()`
3. **Update interfaces** in `src/types/index.ts`
4. **Test thoroughly** with the test suite

## 📞 **Support**

If you encounter issues:

1. Check the console logs for detailed error messages
2. Verify database credentials and permissions
3. Run the test suite to identify specific problems
4. Check the troubleshooting section above

---

**🎉 With auto-initialization, your AgriConnect backend is now truly "zero-config" and ready to use immediately!**
