import { FarmerWarehouseRequest as FarmerWarehouseRequestType, FarmerWarehouseRequestCreate, FarmerWarehouseRequestUpdate, FarmerWarehouseRequestSearchParams, PaginatedResponse } from '../types';
import { pool } from '../config/database';

class FarmerWarehouseRequestModel {
  /**
   * Create a new farmer warehouse request
   */
  static async create(data: FarmerWarehouseRequestCreate): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO farmer_warehouse_requests (
          farmer_id, warehouse_id, request_type, item_name, quantity,
          storage_duration_days, storage_requirements, preferred_dates, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `, [
        data.farmer_id,
        data.warehouse_id,
        data.request_type,
        data.item_name,
        data.quantity,
        data.storage_duration_days,
        data.storage_requirements || null,
        data.preferred_dates || null
      ]);

      return (result as any).insertId;
    } finally {
      connection.release();
    }
  }

  /**
   * Find farmer warehouse request by ID
   */
  static async findById(id: number): Promise<FarmerWarehouseRequestType | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          fwr.*,
          w.name as warehouse_name,
          w.address as warehouse_address,
          w.contact_person_name as warehouse_contact_person,
          w.contact_person_number as warehouse_contact_number,
          u.username as farmer_username,
          u.first_name as farmer_first_name,
          u.last_name as farmer_last_name,
          u.phone as farmer_phone,
          admin.username as admin_username
        FROM farmer_warehouse_requests fwr
        LEFT JOIN warehouses w ON fwr.warehouse_id = w.id
        LEFT JOIN users u ON fwr.farmer_id = u.id
        LEFT JOIN users admin ON fwr.approved_by = admin.id
        WHERE fwr.id = ?
      `, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return this.mapRowToFarmerWarehouseRequest((rows as any[])[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Update farmer warehouse request
   */
  static async update(id: number, data: FarmerWarehouseRequestUpdate): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(data.status);
      }

      if (data.admin_notes !== undefined) {
        updateFields.push('admin_notes = ?');
        updateValues.push(data.admin_notes);
      }

      if (data.rejection_reason !== undefined) {
        updateFields.push('rejection_reason = ?');
        updateValues.push(data.rejection_reason);
      }

      if (data.approved_by !== undefined) {
        updateFields.push('approved_by = ?');
        updateValues.push(data.approved_by);
      }

      if (data.approved_at !== undefined) {
        updateFields.push('approved_at = ?');
        updateValues.push(data.approved_at);
      }

      if (updateFields.length === 0) {
        return false;
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      const [result] = await connection.execute(`
        UPDATE farmer_warehouse_requests 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete farmer warehouse request
   */
  static async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        DELETE FROM farmer_warehouse_requests WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Search farmer warehouse requests with filters and pagination
   */
  static async search(params: FarmerWarehouseRequestSearchParams): Promise<PaginatedResponse<FarmerWarehouseRequestType>> {
    const connection = await pool.getConnection();
    try {
      const page = Math.max(1, parseInt(String(params.page || 1)));
      const limit = Math.max(1, Math.min(100, parseInt(String(params.limit || 10))));
      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];

      if (params.farmer_id) {
        whereClause += ' AND fwr.farmer_id = ?';
        queryParams.push(parseInt(String(params.farmer_id)));
      }

      if (params.warehouse_id) {
        whereClause += ' AND fwr.warehouse_id = ?';
        queryParams.push(parseInt(String(params.warehouse_id)));
      }

      if (params.request_type) {
        whereClause += ' AND fwr.request_type = ?';
        queryParams.push(params.request_type);
      }

      if (params.status) {
        whereClause += ' AND fwr.status = ?';
        queryParams.push(params.status);
      }

      if (params.start_date) {
        whereClause += ' AND fwr.created_at >= ?';
        queryParams.push(params.start_date);
      }

      if (params.end_date) {
        whereClause += ' AND fwr.created_at <= ?';
        queryParams.push(params.end_date);
      }

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total 
        FROM farmer_warehouse_requests fwr
        ${whereClause}
      `, queryParams);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get requests with pagination
      const [rows] = await connection.execute(`
        SELECT 
          fwr.*,
          w.name as warehouse_name,
          w.address as warehouse_address,
          w.contact_person_name as warehouse_contact_person,
          w.contact_person_number as warehouse_contact_number,
          u.username as farmer_username,
          u.first_name as farmer_first_name,
          u.last_name as farmer_last_name,
          u.phone as farmer_phone,
          admin.username as admin_username
        FROM farmer_warehouse_requests fwr
        LEFT JOIN warehouses w ON fwr.warehouse_id = w.id
        LEFT JOIN users u ON fwr.farmer_id = u.id
        LEFT JOIN users admin ON fwr.approved_by = admin.id
        ${whereClause}
        ORDER BY fwr.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `, queryParams);

      const requests = (rows as any[]).map(row => this.mapRowToFarmerWarehouseRequest(row));

      return {
        data: requests,
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
   * Get all requests by farmer
   */
  static async getByFarmer(farmerId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<FarmerWarehouseRequestType>> {
    return this.search({ farmer_id: farmerId, page, limit });
  }

  /**
   * Get all requests by warehouse
   */
  static async getByWarehouse(warehouseId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<FarmerWarehouseRequestType>> {
    return this.search({ warehouse_id: warehouseId, page, limit });
  }

  /**
   * Get pending requests
   */
  static async getPending(page: number = 1, limit: number = 10): Promise<PaginatedResponse<FarmerWarehouseRequestType>> {
    return this.search({ status: 'pending', page, limit });
  }

  /**
   * Get approved requests
   */
  static async getApproved(page: number = 1, limit: number = 10): Promise<PaginatedResponse<FarmerWarehouseRequestType>> {
    return this.search({ status: 'approved', page, limit });
  }

  /**
   * Get completed requests
   */
  static async getCompleted(page: number = 1, limit: number = 10): Promise<PaginatedResponse<FarmerWarehouseRequestType>> {
    return this.search({ status: 'completed', page, limit });
  }

  /**
   * Get all requests (Admin only)
   */
  static async getAll(page: number = 1, limit: number = 10, status?: string): Promise<PaginatedResponse<FarmerWarehouseRequestType>> {
    const searchParams: any = { page, limit };
    if (status) {
      searchParams.status = status;
    }
    return this.search(searchParams);
  }

  /**
   * Map database row to FarmerWarehouseRequest object
   */
  private static mapRowToFarmerWarehouseRequest(row: any): FarmerWarehouseRequestType {
    return {
      id: row.id,
      farmer_id: row.farmer_id,
      warehouse_id: row.warehouse_id,
      request_type: row.request_type,
      item_name: row.item_name,
      quantity: row.quantity,
      storage_duration_days: row.storage_duration_days,
      storage_requirements: row.storage_requirements,
      preferred_dates: row.preferred_dates,
      status: row.status,
      admin_notes: row.admin_notes,
      rejection_reason: row.rejection_reason,
      approved_by: row.approved_by,
      approved_at: row.approved_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

export default FarmerWarehouseRequestModel;
