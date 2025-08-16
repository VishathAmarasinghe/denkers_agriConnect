import { pool } from '../config/database';
import { PoolConnection } from 'mysql2/promise';

interface LocationData {
  name: string;
  district: string;
  province: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface Location extends LocationData {
  id: number;
  created_at?: Date;
  updated_at?: Date;
}

interface LocationFilters {
  district?: string;
  province?: string;
  search?: string;
}

class LocationModel {
  static async create(locationData: LocationData): Promise<Location> {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        INSERT INTO locations (name, district, province, latitude, longitude)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const values = [
        locationData.name,
        locationData.district,
        locationData.province,
        locationData.latitude || null,
        locationData.longitude || null
      ];
      
      const [result] = await connection.execute(query, values);
      connection.release();
      
      return { id: (result as any).insertId, ...locationData };
    } catch (error) {
      throw new Error(`Error creating location: ${(error as Error).message}`);
    }
  }

  static async findById(id: number): Promise<Location | null> {
    try {
      const connection = await pool.getConnection();
      
      const query = 'SELECT * FROM locations WHERE id = ?';
      const [rows] = await connection.execute(query, [id]);
      connection.release();
      
      return (rows as any[])[0] || null;
    } catch (error) {
      throw new Error(`Error finding location by ID: ${(error as Error).message}`);
    }
  }

  static async findByDistrict(district: string): Promise<Location[]> {
    try {
      const connection = await pool.getConnection();
      
      const query = 'SELECT * FROM locations WHERE district = ?';
      const [rows] = await connection.execute(query, [district]);
      connection.release();
      
      return rows as Location[];
    } catch (error) {
      throw new Error(`Error finding locations by district: ${(error as Error).message}`);
    }
  }

  static async findByProvince(province: string): Promise<Location[]> {
    try {
      const connection = await pool.getConnection();
      
      const query = 'SELECT * FROM locations WHERE province = ?';
      const [rows] = await connection.execute(query, [province]);
      connection.release();
      
      return rows as Location[];
    } catch (error) {
      throw new Error(`Error finding locations by province: ${(error as Error).message}`);
    }
  }

  static async findAll(filters: LocationFilters = {}): Promise<Location[]> {
    try {
      const connection = await pool.getConnection();
      
      let query = 'SELECT * FROM locations WHERE 1=1';
      const values: any[] = [];
      
      if (filters.district) {
        query += ' AND district = ?';
        values.push(filters.district);
      }
      
      if (filters.province) {
        query += ' AND province = ?';
        values.push(filters.province);
      }
      
      if (filters.search) {
        query += ' AND (name LIKE ? OR district LIKE ? OR province LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        values.push(searchTerm, searchTerm, searchTerm);
      }
      
      query += ' ORDER BY province, district, name';
      
      const [rows] = await connection.execute(query, values);
      connection.release();
      
      return rows as Location[];
    } catch (error) {
      throw new Error(`Error finding locations: ${(error as Error).message}`);
    }
  }

  static async update(id: number, updateData: Partial<LocationData>): Promise<Location | null> {
    try {
      const connection = await pool.getConnection();
      
      const allowedFields = ['name', 'district', 'province', 'latitude', 'longitude'];
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
      
      values.push(id);
      
      const query = `UPDATE locations SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await connection.execute(query, values);
      
      connection.release();
      
      if ((result as any).affectedRows === 0) {
        return null;
      }
      
      return this.findById(id);
    } catch (error) {
      throw new Error(`Error updating location: ${(error as Error).message}`);
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const connection = await pool.getConnection();
      
      const query = 'DELETE FROM locations WHERE id = ?';
      const [result] = await connection.execute(query, [id]);
      
      connection.release();
      
      return (result as any).affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting location: ${(error as Error).message}`);
    }
  }

  static async getProvinces(): Promise<string[]> {
    try {
      const connection = await pool.getConnection();
      
      const query = 'SELECT DISTINCT province FROM locations ORDER BY province';
      const [rows] = await connection.execute(query);
      connection.release();
      
      return (rows as any[]).map(row => row.province);
    } catch (error) {
      throw new Error(`Error getting provinces: ${(error as Error).message}`);
    }
  }

  static async getDistrictsByProvince(province: string): Promise<string[]> {
    try {
      const connection = await pool.getConnection();
      
      const query = 'SELECT DISTINCT district FROM locations WHERE province = ? ORDER BY district';
      const [rows] = await connection.execute(query, [province]);
      connection.release();
      
      return (rows as any[]).map(row => row.district);
    } catch (error) {
      throw new Error(`Error getting districts by province: ${(error as Error).message}`);
    }
  }

  static async getStats(): Promise<any[]> {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        SELECT 
          province,
          COUNT(*) as location_count,
          COUNT(DISTINCT district) as district_count
        FROM locations 
        GROUP BY province
        ORDER BY province
      `;
      
      const [rows] = await connection.execute(query);
      connection.release();
      
      return rows as any[];
    } catch (error) {
      throw new Error(`Error getting location stats: ${(error as Error).message}`);
    }
  }
}

export default LocationModel;
