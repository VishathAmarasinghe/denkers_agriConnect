-- AgriConnect Location Updates Migration
-- This file adds location-related fields and tables for storing Google Places API data

USE agriconnect;

-- 1. Add location coordinates to users table
ALTER TABLE users 
ADD COLUMN latitude DECIMAL(10,8) NULL AFTER location_id,
ADD COLUMN longitude DECIMAL(11,8) NULL AFTER latitude,
ADD COLUMN place_id VARCHAR(255) NULL AFTER longitude,
ADD COLUMN location_name VARCHAR(255) NULL AFTER place_id,
ADD COLUMN location_address TEXT NULL AFTER location_name;

-- 2. Create user_locations table for multiple locations per user
CREATE TABLE IF NOT EXISTS user_locations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  location_type ENUM('farm', 'field', 'warehouse', 'market', 'other') NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  place_id VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  address TEXT NULL,
  notes TEXT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_location_type (location_type),
  INDEX idx_coordinates (latitude, longitude),
  INDEX idx_place_id (place_id),
  INDEX idx_active (is_active)
);

-- 3. Create location_history table for tracking location changes
CREATE TABLE IF NOT EXISTS location_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  location_id BIGINT NULL,
  action ENUM('created', 'updated', 'deleted') NOT NULL,
  old_data JSON NULL,
  new_data JSON NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES user_locations(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_location_id (location_id),
  INDEX idx_action (action),
  INDEX idx_changed_at (changed_at)
);

-- 4. Update locations table to include Google Places data
ALTER TABLE locations 
ADD COLUMN place_id VARCHAR(255) NULL AFTER longitude,
ADD COLUMN google_places_data JSON NULL AFTER place_id,
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE AFTER google_places_data;

-- 5. Create indexes for better performance
CREATE INDEX idx_users_coordinates ON users(latitude, longitude);
CREATE INDEX idx_users_place_id ON users(place_id);
CREATE INDEX idx_user_locations_coordinates ON user_locations(latitude, longitude);

-- 6. Insert sample data for testing (optional)
-- INSERT INTO user_locations (user_id, location_type, name, description, place_id, latitude, longitude, address, is_primary) 
-- VALUES (1, 'farm', 'Main Farm', 'Primary farming location', 'ChIJqWYFlV5m4zoR3WpuNi6ZtHE', 7.2810008, 80.6727451, 'A26, Kundasala, Sri Lanka', TRUE);

-- 7. Create view for user location summary
CREATE OR REPLACE VIEW user_location_summary AS
SELECT 
  u.id as user_id,
  u.username,
  u.first_name,
  u.last_name,
  COUNT(ul.id) as total_locations,
  SUM(CASE WHEN ul.location_type = 'farm' THEN 1 ELSE 0 END) as farm_count,
  SUM(CASE WHEN ul.location_type = 'field' THEN 1 ELSE 0 END) as field_count,
  SUM(CASE WHEN ul.location_type = 'warehouse' THEN 1 ELSE 0 END) as warehouse_count,
  SUM(CASE WHEN ul.location_type = 'market' THEN 1 ELSE 0 END) as market_count,
  SUM(CASE WHEN ul.location_type = 'other' THEN 1 ELSE 0 END) as other_count
FROM users u
LEFT JOIN user_locations ul ON u.id = ul.user_id AND ul.is_active = TRUE
WHERE u.is_active = TRUE
GROUP BY u.id, u.username, u.first_name, u.last_name;

-- 8. Create stored procedure for adding user location
DELIMITER //
CREATE PROCEDURE AddUserLocation(
  IN p_user_id BIGINT,
  IN p_location_type VARCHAR(20),
  IN p_name VARCHAR(255),
  IN p_description TEXT,
  IN p_place_id VARCHAR(255),
  IN p_latitude DECIMAL(10,8),
  IN p_longitude DECIMAL(11,8),
  IN p_address TEXT,
  IN p_notes TEXT,
  IN p_is_primary BOOLEAN
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
  
  -- If this is a primary location, unset other primary locations for this user
  IF p_is_primary = TRUE THEN
    UPDATE user_locations 
    SET is_primary = FALSE 
    WHERE user_id = p_user_id AND is_active = TRUE;
  END IF;
  
  -- Insert new location
  INSERT INTO user_locations (
    user_id, location_type, name, description, place_id, 
    latitude, longitude, address, notes, is_primary
  ) VALUES (
    p_user_id, p_location_type, p_name, p_description, p_place_id,
    p_latitude, p_longitude, p_address, p_notes, p_is_primary
  );
  
  -- Log the action
  INSERT INTO location_history (user_id, location_id, action, new_data)
  VALUES (p_user_id, LAST_INSERT_ID(), 'created', 
    JSON_OBJECT(
      'location_type', p_location_type,
      'name', p_name,
      'place_id', p_place_id,
      'latitude', p_latitude,
      'longitude', p_longitude
    )
  );
  
  COMMIT;
END //
DELIMITER ;

-- 9. Create stored procedure for updating user location
DELIMITER //
CREATE PROCEDURE UpdateUserLocation(
  IN p_location_id BIGINT,
  IN p_name VARCHAR(255),
  IN p_description TEXT,
  IN p_address TEXT,
  IN p_notes TEXT,
  IN p_is_primary BOOLEAN
)
BEGIN
  DECLARE v_user_id BIGINT;
  DECLARE v_old_data JSON;
  
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
  
  -- Get current data for history
  SELECT user_id, JSON_OBJECT(
    'name', name,
    'description', description,
    'address', address,
    'notes', notes,
    'is_primary', is_primary
  ) INTO v_user_id, v_old_data
  FROM user_locations WHERE id = p_location_id;
  
  -- If this is a primary location, unset other primary locations for this user
  IF p_is_primary = TRUE THEN
    UPDATE user_locations 
    SET is_primary = FALSE 
    WHERE user_id = v_user_id AND id != p_location_id AND is_active = TRUE;
  END IF;
  
  -- Update location
  UPDATE user_locations 
  SET name = p_name,
      description = p_description,
      address = p_address,
      notes = p_notes,
      is_primary = p_is_primary,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_location_id;
  
  -- Log the action
  INSERT INTO location_history (user_id, location_id, action, old_data, new_data)
  VALUES (v_user_id, p_location_id, 'updated', v_old_data,
    JSON_OBJECT(
      'name', p_name,
      'description', p_description,
      'address', p_address,
      'notes', p_notes,
      'is_primary', p_is_primary
    )
  );
  
  COMMIT;
END //
DELIMITER ;

-- 10. Create stored procedure for deleting user location
DELIMITER //
CREATE PROCEDURE DeleteUserLocation(
  IN p_location_id BIGINT
)
BEGIN
  DECLARE v_user_id BIGINT;
  DECLARE v_old_data JSON;
  
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
  
  -- Get current data for history
  SELECT user_id, JSON_OBJECT(
    'location_type', location_type,
    'name', name,
    'place_id', place_id,
    'latitude', latitude,
    'longitude', longitude
  ) INTO v_user_id, v_old_data
  FROM user_locations WHERE id = p_location_id;
  
  -- Soft delete the location
  UPDATE user_locations 
  SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
  WHERE id = p_location_id;
  
  -- Log the action
  INSERT INTO location_history (user_id, location_id, action, old_data)
  VALUES (v_user_id, p_location_id, 'deleted', v_old_data);
  
  COMMIT;
END //
DELIMITER ;

-- 11. Create function to calculate distance between two coordinates (Haversine formula)
DELIMITER //
CREATE FUNCTION CalculateDistance(
  lat1 DECIMAL(10,8),
  lon1 DECIMAL(11,8),
  lat2 DECIMAL(10,8),
  lon2 DECIMAL(11,8)
) RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE R DECIMAL(10,2) DEFAULT 6371; -- Earth's radius in kilometers
  DECLARE dlat DECIMAL(10,8);
  DECLARE dlon DECIMAL(11,8);
  DECLARE a DECIMAL(10,8);
  DECLARE c DECIMAL(10,8);
  
  SET dlat = RADIANS(lat2 - lat1);
  SET dlon = RADIANS(lon2 - lon1);
  SET a = SIN(dlat/2) * SIN(dlat/2) + 
          COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * 
          SIN(dlon/2) * SIN(dlon/2);
  SET c = 2 * ATAN2(SQRT(a), SQRT(1-a));
  
  RETURN R * c;
END //
DELIMITER ;

-- 12. Create view for nearby locations
CREATE OR REPLACE VIEW nearby_locations AS
SELECT 
  ul1.id as location_id,
  ul1.user_id,
  ul1.name as location_name,
  ul1.location_type,
  ul1.latitude,
  ul1.longitude,
  ul1.address,
  ul2.id as nearby_location_id,
  ul2.name as nearby_location_name,
  ul2.location_type as nearby_location_type,
  ul2.user_id as nearby_user_id,
  CalculateDistance(ul1.latitude, ul1.longitude, ul2.latitude, ul2.longitude) as distance_km
FROM user_locations ul1
JOIN user_locations ul2 ON ul1.id != ul2.id 
  AND ul1.is_active = TRUE 
  AND ul2.is_active = TRUE
WHERE CalculateDistance(ul1.latitude, ul1.longitude, ul2.latitude, ul2.longitude) <= 10; -- Within 10km

-- Show the updated structure
DESCRIBE users;
DESCRIBE user_locations;
DESCRIBE location_history;
DESCRIBE locations;

-- Show the created views
SHOW CREATE VIEW user_location_summary;
SHOW CREATE VIEW nearby_locations;

-- Show the created procedures
SHOW CREATE PROCEDURE AddUserLocation;
SHOW CREATE PROCEDURE UpdateUserLocation;
SHOW CREATE PROCEDURE DeleteUserLocation;

-- Show the created function
SHOW CREATE FUNCTION CalculateDistance;
