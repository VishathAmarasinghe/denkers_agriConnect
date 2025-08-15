import { PoolConnection } from 'mysql2/promise';
import { pool } from '../config/database';
import { 
  SoilCollectionCenter, 
  SoilCollectionCenterCreateData, 
  SoilCollectionCenterUpdateData,
  SoilCollectionCenterSearchParams,
  PaginatedResponse
} from '../types';

class SoilCollectionCenterModel {
  /**
   * Create a new soil collection center
   */
  static async create(data: SoilCollectionCenterCreateData): Promise<SoilCollectionCenter> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO soil_collection_centers (
          name, location_id, address, contact_number, contact_person, 
          description, image_url, latitude, longitude, place_id, 
          operating_hours, services_offered, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())
      `, [
        data.name, data.location_id, data.address, data.contact_number, 
        data.contact_person || null, data.description || null, data.image_url || null, 
        data.latitude || null, data.longitude || null, data.place_id || null,
        data.operating_hours || null, data.services_offered || null
      ]);

      const insertId = (result as any).insertId;
      return this.findById(insertId) as Promise<SoilCollectionCenter>;
    } finally {
      connection.release();
    }
  }

  /**
   * Find soil collection center by ID
   */
  static async findById(id: number): Promise<SoilCollectionCenter | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          scc.id, scc.name, scc.location_id, scc.address, scc.contact_number,
          scc.contact_person, scc.description, scc.image_url, scc.latitude,
          scc.longitude, scc.place_id, scc.operating_hours, scc.services_offered,
          scc.is_active, scc.created_at, scc.updated_at,
          l.name as location_name, l.district, l.province
        FROM soil_collection_centers scc
        LEFT JOIN locations l ON scc.location_id = l.id
        WHERE scc.id = ? AND scc.is_active = TRUE
      `, [id]);

      const centers = rows as any[];
      if (centers.length === 0) return null;

      const center = centers[0];
      return {
        id: center.id,
        name: center.name,
        location_id: center.location_id,
        address: center.address,
        contact_number: center.contact_number,
        contact_person: center.contact_person,
        description: center.description,
        image_url: center.image_url,
        latitude: center.latitude,
        longitude: center.longitude,
        place_id: center.place_id,
        operating_hours: center.operating_hours,
        services_offered: center.services_offered,
        is_active: center.is_active,
        created_at: center.created_at,
        updated_at: center.updated_at
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Update soil collection center
   */
  static async update(id: number, data: SoilCollectionCenterUpdateData): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      // Build dynamic update query
      if (data.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(data.name);
      }
      if (data.location_id !== undefined) {
        updateFields.push('location_id = ?');
        updateValues.push(data.location_id);
      }
      if (data.address !== undefined) {
        updateFields.push('address = ?');
        updateValues.push(data.address);
      }
      if (data.contact_number !== undefined) {
        updateFields.push('contact_number = ?');
        updateValues.push(data.contact_number);
      }
      if (data.contact_person !== undefined) {
        updateFields.push('contact_person = ?');
        updateValues.push(data.contact_person);
      }
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(data.description);
      }
      if (data.image_url !== undefined) {
        updateFields.push('image_url = ?');
        updateValues.push(data.image_url);
      }
      if (data.latitude !== undefined) {
        updateFields.push('latitude = ?');
        updateValues.push(data.latitude);
      }
      if (data.longitude !== undefined) {
        updateFields.push('longitude = ?');
        updateValues.push(data.longitude);
      }
      if (data.place_id !== undefined) {
        updateFields.push('place_id = ?');
        updateValues.push(data.place_id);
      }
      if (data.operating_hours !== undefined) {
        updateFields.push('operating_hours = ?');
        updateValues.push(data.operating_hours);
      }
      if (data.services_offered !== undefined) {
        updateFields.push('services_offered = ?');
        updateValues.push(data.services_offered);
      }
      if (data.is_active !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(data.is_active);
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      const [result] = await connection.execute(`
        UPDATE soil_collection_centers 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Soft delete soil collection center (deactivate)
   */
  static async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        UPDATE soil_collection_centers 
        SET is_active = FALSE, updated_at = NOW()
        WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Search soil collection centers with filters and pagination
   */
  static async search(params: SoilCollectionCenterSearchParams): Promise<PaginatedResponse<SoilCollectionCenter>> {
    const connection = await pool.getConnection();
    try {
      const page = Math.max(1, parseInt(String(params.page || 1)));
      const limit = Math.max(1, Math.min(100, parseInt(String(params.limit || 10))));
      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereClause = 'WHERE scc.is_active = TRUE';
      const queryParams: any[] = [];

      if (params.name && params.name.trim()) {
        whereClause += ' AND scc.name LIKE ?';
        queryParams.push(`%${params.name.trim()}%`);
      }

      if (params.location_id && params.location_id > 0) {
        whereClause += ' AND scc.location_id = ?';
        queryParams.push(parseInt(String(params.location_id)));
      }

      // Note: Province and district filtering disabled until locations table is properly populated
      // if (params.province) {
      //   whereClause += ' AND l.province LIKE ?';
      //   queryParams.push(`%${params.province}%`);
      // }

      // if (params.district) {
      //   whereClause += ' AND l.district LIKE ?';
      //   queryParams.push(`%${params.district}%`);
      // }

      if (params.is_active !== undefined) {
        whereClause += ' AND scc.is_active = ?';
        queryParams.push(Boolean(params.is_active));
      }

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total 
        FROM soil_collection_centers scc
        ${whereClause}
      `, queryParams);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get centers with pagination
      const [rows] = await connection.execute(`
        SELECT 
          scc.id, scc.name, scc.location_id, scc.address, scc.contact_number,
          scc.contact_person, scc.description, scc.image_url, scc.latitude,
          scc.longitude, scc.place_id, scc.operating_hours, scc.services_offered,
          scc.is_active, scc.created_at, scc.updated_at
        FROM soil_collection_centers scc
        ${whereClause}
        ORDER BY scc.created_at DESC
        LIMIT ${parseInt(String(limit))} OFFSET ${parseInt(String(offset))}
      `, queryParams);

      const centers = (rows as any[]).map(center => ({
        id: center.id,
        name: center.name,
        location_id: center.location_id,
        address: center.address,
        contact_number: center.contact_number,
        contact_person: center.contact_person,
        description: center.description,
        image_url: center.image_url,
        latitude: center.latitude,
        longitude: center.longitude,
        place_id: center.place_id,
        operating_hours: center.operating_hours,
        services_offered: center.services_offered,
        is_active: center.is_active,
        created_at: center.created_at,
        updated_at: center.updated_at
      }));

      return {
        data: centers,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Get all soil collection centers with pagination
   */
  static async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<SoilCollectionCenter>> {
    const connection = await pool.getConnection();
    try {
      const pageNum = Math.max(1, parseInt(String(page || 1)));
      const limitNum = Math.max(1, Math.min(100, parseInt(String(limit || 10))));
      const offset = (pageNum - 1) * limitNum;

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total 
        FROM soil_collection_centers scc
        WHERE scc.is_active = TRUE
      `);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limitNum);

      // Get centers with pagination
      const [rows] = await connection.execute(`
        SELECT 
          scc.id, scc.name, scc.location_id, scc.address, scc.contact_number,
          scc.contact_person, scc.description, scc.image_url, scc.latitude,
          scc.longitude, scc.place_id, scc.operating_hours, scc.services_offered,
          scc.is_active, scc.created_at, scc.updated_at
        FROM soil_collection_centers scc
        WHERE scc.is_active = TRUE
        ORDER BY scc.created_at DESC
        LIMIT ${parseInt(String(limitNum))} OFFSET ${parseInt(String(offset))}
      `);

      const centers = (rows as any[]).map(center => ({
        id: center.id,
        name: center.name,
        location_id: center.location_id,
        address: center.address,
        contact_number: center.contact_number,
        contact_person: center.contact_person,
        description: center.description,
        image_url: center.image_url,
        latitude: center.latitude,
        longitude: center.longitude,
        place_id: center.place_id,
        operating_hours: center.operating_hours,
        services_offered: center.services_offered,
        is_active: center.is_active,
        created_at: center.created_at,
        updated_at: center.updated_at
      }));

      return {
        data: centers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages
        }
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Get centers by location
   */
  static async getByLocation(locationId: number): Promise<SoilCollectionCenter[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          scc.id, scc.name, scc.location_id, scc.address, scc.contact_number,
          scc.contact_person, scc.description, scc.image_url, scc.latitude,
          scc.longitude, scc.place_id, scc.operating_hours, scc.services_offered,
          scc.is_active, scc.created_at, scc.updated_at
        FROM soil_collection_centers scc
        WHERE scc.location_id = ? AND scc.is_active = TRUE
        ORDER BY scc.name
      `, [locationId]);

      return (rows as any[]).map(center => ({
        id: center.id,
        name: center.name,
        location_id: center.location_id,
        address: center.address,
        contact_number: center.contact_number,
        contact_person: center.contact_person,
        description: center.description,
        image_url: center.image_url,
        latitude: center.latitude,
        longitude: center.longitude,
        place_id: center.place_id,
        operating_hours: center.operating_hours,
        services_offered: center.services_offered,
        is_active: center.is_active,
        created_at: center.created_at,
        updated_at: center.updated_at
      }));
    } finally {
      connection.release();
    }
  }
}

export default SoilCollectionCenterModel;
