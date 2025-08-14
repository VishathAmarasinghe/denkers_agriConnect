import { pool } from '../config/database';
import { PoolConnection } from 'mysql2/promise';
import { User as UserType, UserCreateData, UserUpdateData } from '../types';

class User {
  static async create(userData: UserCreateData): Promise<UserType> {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        INSERT INTO users (
          role, username, email, password_hash, google_oauth_id,
          first_name, last_name, profile_image_url, language,
          phone, nic, location_id, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        userData.role,
        userData.username,
        userData.email,
        userData.password_hash,
        userData.google_oauth_id || null,
        userData.first_name,
        userData.last_name || null,
        userData.profile_image_url || null,
        userData.language || 'si',
        userData.phone,
        userData.nic,
        userData.location_id || null,
        userData.is_active !== undefined ? userData.is_active : true
      ];
      
      const [result] = await connection.execute(query, values);
      connection.release();
      
      return { 
        id: (result as any).insertId, 
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        nic: userData.nic,
        password_hash: userData.password_hash || '',
        role: userData.role,
        first_name: userData.first_name,
        last_name: userData.last_name,
        google_oauth_id: userData.google_oauth_id,
        profile_image_url: userData.profile_image_url,
        language: userData.language || 'si',
        location_id: userData.location_id,
        is_active: userData.is_active ?? true
      };
    } catch (error) {
      throw new Error(`Error creating user: ${(error as Error).message}`);
    }
  }

  static async findById(id: number): Promise<UserType | null> {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        SELECT u.*, l.name as location_name, l.district, l.province
        FROM users u
        LEFT JOIN locations l ON u.location_id = l.id
        WHERE u.id = ?
      `;
      
      const [rows] = await connection.execute(query, [id]);
      connection.release();
      
      return (rows as any[])[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by ID: ${(error as Error).message}`);
    }
  }

  static async findByEmail(email: string): Promise<UserType | null> {
    try {
      const connection = await pool.getConnection();
      
      const query = 'SELECT * FROM users WHERE email = ?';
      const [rows] = await connection.execute(query, [email]);
      connection.release();
      
      return (rows as any[])[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by email: ${(error as Error).message}`);
    }
  }

  static async findByUsername(username: string): Promise<UserType | null> {
    try {
      const connection = await pool.getConnection();
      
      const query = 'SELECT * FROM users WHERE username = ?';
      const [rows] = await connection.execute(query, [username]);
      connection.release();
      
      return (rows as any[])[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by username: ${(error as Error).message}`);
    }
  }

  static async findByGoogleOAuthId(googleOAuthId: string): Promise<UserType | null> {
    try {
      const connection = await pool.getConnection();
      
      const query = 'SELECT * FROM users WHERE google_oauth_id = ?';
      const [rows] = await connection.execute(query, [googleOAuthId]);
      connection.release();
      
      return (rows as any[])[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by Google OAuth ID: ${(error as Error).message}`);
    }
  }

  static async findByPhone(phone: string): Promise<UserType | null> {
    try {
      const connection = await pool.getConnection();
      
      const query = 'SELECT * FROM users WHERE phone = ?';
      const [rows] = await connection.execute(query, [phone]);
      connection.release();
      
      return (rows as any[])[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by phone: ${(error as Error).message}`);
    }
  }

  static async findAll(filters: any = {}, page: number = 1, limit: number = 10): Promise<{
    users: UserType[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const connection = await pool.getConnection();
      
      let query = `
        SELECT u.*, l.name as location_name, l.district, l.province
        FROM users u
        LEFT JOIN locations l ON u.location_id = l.id
        WHERE 1=1
      `;
      
      const values: any[] = [];
      
      if (filters.role) {
        query += ' AND u.role = ?';
        values.push(filters.role);
      }
      
      if (filters.is_active !== undefined) {
        query += ' AND u.is_active = ?';
        values.push(filters.is_active);
      }
      
      if (filters.location_id) {
        query += ' AND u.location_id = ?';
        values.push(filters.location_id);
      }
      
      if (filters.search) {
        query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        values.push(searchTerm, searchTerm, searchTerm);
      }
      
      // Add pagination
      const offset = (page - 1) * limit;
      query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
      values.push(limit, offset);
      
      const [rows] = await connection.execute(query, values);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
      const countValues: any[] = [];
      
      if (filters.role) {
        countQuery += ' AND role = ?';
        countValues.push(filters.role);
      }
      
      if (filters.is_active !== undefined) {
        countQuery += ' AND is_active = ?';
        countValues.push(filters.is_active);
      }
      
      if (filters.location_id) {
        countQuery += ' AND location_id = ?';
        countValues.push(filters.location_id);
      }
      
      const [countResult] = await connection.execute(countQuery, countValues);
      const total = (countResult as any[])[0].total;
      
      connection.release();
      
      return {
        users: rows as UserType[],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error finding users: ${(error as Error).message}`);
    }
  }

  static async update(id: number, updateData: UserUpdateData): Promise<UserType | null> {
    try {
      const connection = await pool.getConnection();
      
      const allowedFields = [
        'username', 'email', 'password_hash', 'google_oauth_id',
        'first_name', 'last_name', 'profile_image_url', 'language',
        'phone', 'location_id', 'is_active', 'reset_otp', 'reset_otp_expiry'
      ];
      
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
      
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await connection.execute(query, values);
      
      connection.release();
      
      if ((result as any).affectedRows === 0) {
        return null;
      }
      
      return this.findById(id);
    } catch (error) {
      throw new Error(`Error updating user: ${(error as Error).message}`);
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const connection = await pool.getConnection();
      
      const query = 'DELETE FROM users WHERE id = ?';
      const [result] = await connection.execute(query, [id]);
      
      connection.release();
      
      return (result as any).affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting user: ${(error as Error).message}`);
    }
  }

  static async deactivate(id: number): Promise<boolean> {
    try {
      const connection = await pool.getConnection();
      
      const query = 'UPDATE users SET is_active = FALSE WHERE id = ?';
      const [result] = await connection.execute(query, [id]);
      
      connection.release();
      
      return (result as any).affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deactivating user: ${(error as Error).message}`);
    }
  }

  static async getStats(): Promise<any[]> {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        SELECT 
          role,
          COUNT(*) as count,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count
        FROM users 
        GROUP BY role
      `;
      
      const [rows] = await connection.execute(query);
      connection.release();
      
      return rows as any[];
    } catch (error) {
      throw new Error(`Error getting user stats: ${(error as Error).message}`);
    }
  }
}

export default User;
