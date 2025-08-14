-- Database Migration: Update Soil Collection Centers Table
-- This script adds new fields to support enhanced soil collection center functionality

USE agriconnect;

create table soil_collection_centers;


-- Add new columns to soil_collection_centers table
ALTER TABLE soil_collection_centers 
ADD COLUMN contact_person VARCHAR(100) NULL AFTER contact_number,
ADD COLUMN description TEXT NULL AFTER contact_person,
ADD COLUMN image_url VARCHAR(500) NULL AFTER description,
ADD COLUMN latitude DECIMAL(10,8) NULL AFTER image_url,
ADD COLUMN longitude DECIMAL(11,8) NULL AFTER latitude,
ADD COLUMN place_id VARCHAR(255) NULL AFTER longitude,
ADD COLUMN operating_hours VARCHAR(255) NULL AFTER place_id,
ADD COLUMN services_offered TEXT NULL AFTER operating_hours,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER services_offered,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Add indexes for better performance
ALTER TABLE soil_collection_centers 
ADD INDEX idx_contact_person (contact_person),
ADD INDEX idx_latitude (latitude),
ADD INDEX idx_longitude (longitude),
ADD INDEX idx_place_id (place_id),
ADD INDEX idx_created_at (created_at);

-- Update existing records with default values if needed
UPDATE soil_collection_centers 
SET contact_person = 'Contact Person' 
WHERE contact_person IS NULL;

-- Add sample data for testing (optional)
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
);

-- Create a view for easy access to center information with location details
CREATE OR REPLACE VIEW soil_collection_centers_view AS
SELECT 
  scc.id,
  scc.name,
  scc.location_id,
  scc.address,
  scc.contact_number,
  scc.contact_person,
  scc.description,
  scc.image_url,
  scc.latitude,
  scc.longitude,
  scc.place_id,
  scc.operating_hours,
  scc.services_offered,
  scc.is_active,
  scc.created_at,
  scc.updated_at,
  l.name as location_name,
  l.district,
  l.province
FROM soil_collection_centers scc
LEFT JOIN locations l ON scc.location_id = l.id
WHERE scc.is_active = TRUE;

-- Create a stored procedure for searching centers
DELIMITER //
CREATE PROCEDURE SearchSoilCollectionCenters(
  IN p_name VARCHAR(150),
  IN p_location_id INT,
  IN p_province VARCHAR(150),
  IN p_district VARCHAR(150),
  IN p_is_active BOOLEAN,
  IN p_page INT,
  IN p_limit INT
)
BEGIN
  DECLARE v_offset INT DEFAULT 0;
  
  SET v_offset = (p_page - 1) * p_limit;
  
  -- Build dynamic query based on parameters
  SET @sql = CONCAT('
    SELECT 
      scc.id, scc.name, scc.location_id, scc.address, scc.contact_number,
      scc.contact_person, scc.description, scc.image_url, scc.latitude,
      scc.longitude, scc.place_id, scc.operating_hours, scc.services_offered,
      scc.is_active, scc.created_at, scc.updated_at,
      l.name as location_name, l.district, l.province
    FROM soil_collection_centers scc
    LEFT JOIN locations l ON scc.location_id = l.id
    WHERE 1=1
  ');
  
  IF p_name IS NOT NULL THEN
    SET @sql = CONCAT(@sql, ' AND scc.name LIKE ''%', p_name, '%''');
  END IF;
  
  IF p_location_id IS NOT NULL THEN
    SET @sql = CONCAT(@sql, ' AND scc.location_id = ', p_location_id);
  END IF;
  
  IF p_province IS NOT NULL THEN
    SET @sql = CONCAT(@sql, ' AND l.province LIKE ''%', p_province, '%''');
  END IF;
  
  IF p_district IS NOT NULL THEN
    SET @sql = CONCAT(@sql, ' AND l.district LIKE ''%', p_district, '%''');
  END IF;
  
  IF p_is_active IS NOT NULL THEN
    SET @sql = CONCAT(@sql, ' AND scc.is_active = ', p_is_active);
  END IF;
  
  SET @sql = CONCAT(@sql, ' ORDER BY scc.created_at DESC LIMIT ', p_limit, ' OFFSET ', v_offset);
  
  PREPARE stmt FROM @sql;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
END //
DELIMITER ;

-- Create a function to get centers by location
DELIMITER //
CREATE FUNCTION GetCentersByLocation(p_location_id INT) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE v_count INT DEFAULT 0;
  
  SELECT COUNT(*) INTO v_count
  FROM soil_collection_centers
  WHERE location_id = p_location_id AND is_active = TRUE;
  
  RETURN v_count;
END //
DELIMITER ;

-- Create a trigger to update the updated_at timestamp
DELIMITER //
CREATE TRIGGER update_soil_collection_centers_timestamp
BEFORE UPDATE ON soil_collection_centers
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- Grant permissions (adjust as needed for your database setup)
-- GRANT EXECUTE ON PROCEDURE SearchSoilCollectionCenters TO 'your_user'@'localhost';
-- GRANT EXECUTE ON FUNCTION GetCentersByLocation TO 'your_user'@'localhost';

-- Verify the migration
SELECT 'Migration completed successfully' as status;
SELECT COUNT(*) as total_centers FROM soil_collection_centers;
SELECT COUNT(*) as active_centers FROM soil_collection_centers WHERE is_active = TRUE;
