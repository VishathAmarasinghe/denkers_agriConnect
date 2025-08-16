#!/bin/bash

echo "🔄 Resetting AgriConnect Database..."
echo "⚠️  WARNING: This will delete ALL existing data!"
echo ""

# Check if MySQL is accessible
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL command not found. Please install MySQL client or use phpMyAdmin."
    echo ""
    echo "Alternative: You can manually run the SQL commands in your MySQL client:"
    echo "1. Open MySQL client or phpMyAdmin"
    echo "2. Run: DROP DATABASE IF EXISTS agriconnect;"
    echo "3. Run: CREATE DATABASE agriconnect;"
    echo "4. Restart the backend server"
    exit 1
fi

# Get database credentials from environment or prompt user
DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-agriconnect}

echo "📊 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"
echo ""

# Prompt for password
read -s -p "Enter MySQL password for $DB_USER: " DB_PASSWORD
echo ""

# Reset the database
echo "🗑️  Dropping existing database..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "DROP DATABASE IF EXISTS $DB_NAME;"

if [ $? -eq 0 ]; then
    echo "✅ Database dropped successfully"
else
    echo "❌ Failed to drop database"
    exit 1
fi

echo "🆕 Creating fresh database..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE $DB_NAME;"

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully"
else
    echo "❌ Failed to create database"
    exit 1
fi

echo ""
echo "🎉 Database reset completed!"
echo ""
echo "Next steps:"
echo "1. Restart your backend server: npm run dev"
echo "2. The auto-initialization will create all tables and seed data"
echo "3. Test the endpoints: curl http://localhost:3000/api/v1/soil-collection-centers"
echo ""
echo "Default admin credentials:"
echo "   Username: admin"
echo "   Password: admin123"
