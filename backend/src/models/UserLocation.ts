import { pool } from '../config/database';
import { UserLocation, UserLocationCreateData, UserLocationUpdateData, UserLocationSummary, NearbyLocation } from '../types';

class UserLocationModel {
  /**
   * Create a new user location
   */
  static async create(locationData: UserLocationCreateData): Promise<UserLocation> {
    try {
      const connection = await pool.getConnection();
      
      // If this is a primary location, unset other primary locations for this user
      if (locationData.is_primary) {
        await connection.execute(`
          UPDATE user_locations 
          SET is_primary = FALSE 
          WHERE user_id = ? AND is_active = TRUE
        `, [locationData.user_id]);
      }
      
      const query = `
        INSERT INTO user_locations (
          user_id, location_type, name, description, place_id,
          latitude, longitude, address, notes, is_primary
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        locationData.user_id,
        locationData.location_type,
        locationData.name,
        locationData.description || null,
        locationData.place_id,
        locationData.latitude,
        locationData.longitude,
        locationData.address || null,
        locationData.notes || null,
        locationData.is_primary || false
      ];
      
      const [result] = await connection.execute(query, values);
      const locationId = (result as any).insertId;
      
      // Log the action in location_history
      await connection.execute(`
        INSERT INTO location_history (user_id, location_id, action, new_data)
        VALUES (?, ?, 'created', ?)
      `, [locationData.user_id, locationId, JSON.stringify({
        location_type: locationData.location_type,
        name: locationData.name,
        place_id: locationData.place_id,
        latitude: locationData.latitude,
        longitude: locationData.longitude
      })]);
      
      connection.release();
      
      return this.findById(locationId);
    } catch (error) {
      throw new Error(`Error creating user location: ${(error as Error).message}`);
    }
  }

  /**
   * Find location by ID
   */
  static async findById(id: number): Promise<UserLocation | null> {
    try {
      const connection = await pool.getConnection();
      
      const query = 'SELECT * FROM user_locations WHERE id = ? AND is_active = TRUE';
      const [rows] = await connection.execute(query, [id]);
      connection.release();
      
      return (rows as UserLocation[])[0] || null;
    } catch (error) {
      throw new Error(`Error finding user location by ID: ${(error as Error).message}`);
    }
  }

  /**
   * Get all locations for a user
   */
  static async findByUserId(userId: number): Promise<UserLocation[]> {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        SELECT * FROM user_locations 
        WHERE user_id = ? AND is_active = TRUE 
        ORDER BY is_primary DESC, created_at DESC
      `;
      const [rows] = await connection.execute(query, [userId]);
      connection.release();
      
      return rows as UserLocation[];
    } catch (error) {
      throw new Error(`Error finding user locations: ${(error as Error).message}`);
    }
  }

  /**
   * Update a user location
   */
  static async update(id: number, updateData: UserLocationUpdateData): Promise<UserLocation | null> {
    try {
      const connection = await pool.getConnection();
      
      // Get current data for history
      const currentLocation = await this.findById(id);
      if (!currentLocation) {
        connection.release();
        return null;
      }
      
      // If this is a primary location, unset other primary locations for this user
      if (updateData.is_primary) {
        await connection.execute(`
          UPDATE user_locations 
          SET is_primary = FALSE 
          WHERE user_id = ? AND id != ? AND is_active = TRUE
        `, [currentLocation.user_id, id]);
      }
      
      const allowedFields = ['name', 'description', 'address', 'notes', 'is_primary'];
      const updates: string[] = [];
      const values: any[] = [];
      
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (updates.length === 0) {
        connection.release();
        return null;
      }
      
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      const query = `UPDATE user_locations SET ${updates.join(', ')} WHERE id = ?`;
      await connection.execute(query, values);
      
      // Log the action in location_history
      await connection.execute(`
        INSERT INTO location_history (user_id, location_id, action, old_data, new_data)
        VALUES (?, ?, 'updated', ?, ?)
      `, [currentLocation.user_id, id, JSON.stringify(currentLocation), JSON.stringify(updateData)]);
      
      connection.release();
      
      return this.findById(id);
    } catch (error) {
      throw new Error(`Error updating user location: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a user location (soft delete)
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const connection = await pool.getConnection();
      
      // Get current data for history
      const currentLocation = await this.findById(id);
      if (!currentLocation) {
        connection.release();
        return false;
      }
      
      // Soft delete
      const query = 'UPDATE user_locations SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      const [result] = await connection.execute(query, [id]);
      
      // Log the action in location_history
      await connection.execute(`
        INSERT INTO location_history (user_id, location_id, action, old_data)
        VALUES (?, ?, 'deleted', ?)
      `, [currentLocation.user_id, id, JSON.stringify({
        location_type: currentLocation.location_type,
        name: currentLocation.name,
        place_id: currentLocation.place_id,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      })]);
      
      connection.release();
      
      return (result as any).affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting user location: ${(error as Error).message}`);
    }
  }

  /**
   * Get user location summary
   */
  static async getUserLocationSummary(userId: number): Promise<UserLocationSummary | null> {
    try {
      const connection = await pool.getConnection();
      
      const query = `
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
        WHERE u.id = ? AND u.is_active = TRUE
        GROUP BY u.id, u.username, u.first_name, u.last_name
      `;
      
      const [rows] = await connection.execute(query, [userId]);
      connection.release();
      
      return (rows as UserLocationSummary[])[0] || null;
    } catch (error) {
      throw new Error(`Error getting user location summary: ${(error as Error).message}`);
    }
  }

  /**
   * Get nearby locations within a radius
   */
  static async getNearbyLocations(latitude: number, longitude: number, radiusKm: number = 10): Promise<NearbyLocation[]> {
    try {
      const connection = await pool.getConnection();
      
      const query = `
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
        WHERE CalculateDistance(?, ?, ul2.latitude, ul2.longitude) <= ?
        ORDER BY distance_km ASC
      `;
      
      const [rows] = await connection.execute(query, [latitude, longitude, radiusKm]);
      connection.release();
      
      return rows as NearbyLocation[];
    } catch (error) {
      throw new Error(`Error getting nearby locations: ${(error as Error).message}`);
    }
  }

  /**
   * Get locations by type for a user
   */
  static async findByUserIdAndType(userId: number, locationType: string): Promise<UserLocation[]> {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        SELECT * FROM user_locations 
        WHERE user_id = ? AND location_type = ? AND is_active = TRUE 
        ORDER BY is_primary DESC, created_at DESC
      `;
      const [rows] = await connection.execute(query, [userId, locationType]);
      connection.release();
      
      return rows as UserLocation[];
    } catch (error) {
      throw new Error(`Error finding user locations by type: ${(error as Error).message}`);
    }
  }

  /**
   * Get primary location for a user
   */
  static async getPrimaryLocation(userId: number): Promise<UserLocation | null> {
    try {
      const connection = await pool.getConnection();
      
      const query = 'SELECT * FROM user_locations WHERE user_id = ? AND is_primary = TRUE AND is_active = TRUE';
      const [rows] = await connection.execute(query, [userId]);
      connection.release();
      
      return (rows as UserLocation[])[0] || null;
    } catch (error) {
      throw new Error(`Error getting primary location: ${(error as Error).message}`);
    }
  }
}

export default UserLocationModel;
