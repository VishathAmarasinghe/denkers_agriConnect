import { pool } from '../config/database';
import { EquipmentRentalRequest, EquipmentRentalRequestCreate, EquipmentRentalRequestUpdate, EquipmentRentalRequestSearchParams } from '../types';

export class EquipmentRentalRequestModel {
  /**
   * Create a new equipment rental request
   */
  static async create(requestData: EquipmentRentalRequestCreate, farmerId: number): Promise<EquipmentRentalRequest> {
    // Calculate rental duration and total amount
    const startDate = new Date(requestData.start_date);
    const endDate = new Date(requestData.end_date);
    const rentalDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Get equipment details for pricing
    const [equipmentRows] = await pool.execute(`
      SELECT daily_rate, delivery_fee, security_deposit FROM equipment WHERE id = ?
    `, [requestData.equipment_id]);

    const equipment = (equipmentRows as any[])[0];
    if (!equipment) {
      throw new Error('Equipment not found');
    }

    const totalAmount = (equipment.daily_rate * rentalDuration) + (equipment.delivery_fee || 0);
    const deliveryFee = equipment.delivery_fee || 0;
    const securityDeposit = equipment.security_deposit || 0;

    const [result] = await pool.execute(`
      INSERT INTO equipment_rental_requests (
        farmer_id, equipment_id, start_date, end_date, rental_duration,
        total_amount, delivery_fee, security_deposit, receiver_name,
        receiver_phone, delivery_address, delivery_latitude, delivery_longitude,
        additional_notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      farmerId,
      requestData.equipment_id,
      requestData.start_date,
      requestData.end_date,
      rentalDuration,
      totalAmount,
      deliveryFee,
      securityDeposit,
      requestData.receiver_name,
      requestData.receiver_phone,
      requestData.delivery_address,
      requestData.delivery_latitude || null,
      requestData.delivery_longitude || null,
      requestData.additional_notes || null
    ]);

    const requestId = (result as any).insertId;
    return this.findById(requestId);
  }

  /**
   * Find rental request by ID
   */
  static async findById(id: number): Promise<EquipmentRentalRequest> {
    const [rows] = await pool.execute(`
      SELECT 
        r.*,
        CONCAT(u.first_name, ' ', u.last_name) as farmer_name,
        e.name as equipment_name,
        ec.name as category_name,
        CONCAT(admin.first_name, ' ', admin.last_name) as approved_by_name
      FROM equipment_rental_requests r
      LEFT JOIN users u ON r.farmer_id = u.id
      LEFT JOIN equipment e ON r.equipment_id = e.id
      LEFT JOIN equipment_categories ec ON e.category_id = ec.id
      LEFT JOIN users admin ON r.approved_by = admin.id
      WHERE r.id = ?
    `, [id]);

    const requests = rows as any[];
    if (requests.length === 0) {
      throw new Error('Equipment rental request not found');
    }

    return this.mapRowToRequest(requests[0]);
  }

  /**
   * Update rental request
   */
  static async update(id: number, updateData: EquipmentRentalRequestUpdate): Promise<EquipmentRentalRequest> {
    const fields = [];
    const values = [];

    if (updateData.status !== undefined) {
      fields.push('status = ?');
      values.push(updateData.status);
    }
    if (updateData.admin_notes !== undefined) {
      fields.push('admin_notes = ?');
      values.push(updateData.admin_notes);
    }
    if (updateData.rejection_reason !== undefined) {
      fields.push('rejection_reason = ?');
      values.push(updateData.rejection_reason);
    }
    if (updateData.approved_by !== undefined) {
      fields.push('approved_by = ?');
      values.push(updateData.approved_by);
    }
    if (updateData.approved_at !== undefined) {
      fields.push('approved_at = ?');
      values.push(updateData.approved_at);
    }
    if (updateData.pickup_qr_code_url !== undefined) {
      fields.push('pickup_qr_code_url = ?');
      values.push(updateData.pickup_qr_code_url);
    }
    if (updateData.pickup_qr_code_data !== undefined) {
      fields.push('pickup_qr_code_data = ?');
      values.push(updateData.pickup_qr_code_data);
    }
    if (updateData.return_qr_code_url !== undefined) {
      fields.push('return_qr_code_url = ?');
      values.push(updateData.return_qr_code_url);
    }
    if (updateData.return_qr_code_data !== undefined) {
      fields.push('return_qr_code_data = ?');
      values.push(updateData.return_qr_code_data);
    }
    if (updateData.pickup_confirmed_at !== undefined) {
      fields.push('pickup_confirmed_at = ?');
      values.push(updateData.pickup_confirmed_at);
    }
    if (updateData.return_confirmed_at !== undefined) {
      fields.push('return_confirmed_at = ?');
      values.push(updateData.return_confirmed_at);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await pool.execute(`
      UPDATE equipment_rental_requests 
      SET ${fields.join(', ')}
      WHERE id = ?
    `, values);

    return this.findById(id);
  }

  /**
   * Update pickup QR code
   */
  static async updatePickupQRCode(id: number, qrCodeUrl: string, qrCodeData: string): Promise<EquipmentRentalRequest> {
    return this.update(id, {
      pickup_qr_code_url: qrCodeUrl,
      pickup_qr_code_data: qrCodeData
    });
  }

  /**
   * Update return QR code
   */
  static async updateReturnQRCode(id: number, qrCodeUrl: string, qrCodeData: string): Promise<EquipmentRentalRequest> {
    return this.update(id, {
      return_qr_code_url: qrCodeUrl,
      return_qr_code_data: qrCodeData
    });
  }

  /**
   * Confirm pickup
   */
  static async confirmPickup(id: number): Promise<EquipmentRentalRequest> {
    return this.update(id, {
      pickup_confirmed_at: new Date().toISOString().split('T')[0],
      status: 'active'
    });
  }

  /**
   * Confirm return
   */
  static async confirmReturn(id: number): Promise<EquipmentRentalRequest> {
    return this.update(id, {
      return_confirmed_at: new Date().toISOString().split('T')[0],
      status: 'returned'
    });
  }

  /**
   * Search rental requests with pagination
   */
  static async search(params: EquipmentRentalRequestSearchParams): Promise<{
    data: EquipmentRentalRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = Math.max(1, parseInt(String(params.page || 1)));
    const limit = Math.max(1, Math.min(100, parseInt(String(params.limit || 10))));
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];

    if (params.farmer_id) {
      whereClause += ' AND r.farmer_id = ?';
      queryParams.push(parseInt(String(params.farmer_id)));
    }

    if (params.equipment_id) {
      whereClause += ' AND r.equipment_id = ?';
      queryParams.push(parseInt(String(params.equipment_id)));
    }

    if (params.status) {
      whereClause += ' AND r.status = ?';
      queryParams.push(params.status);
    }

    if (params.start_date_from) {
      whereClause += ' AND r.start_date >= ?';
      queryParams.push(params.start_date_from);
    }

    if (params.start_date_to) {
      whereClause += ' AND r.start_date <= ?';
      queryParams.push(params.start_date_to);
    }

    if (params.end_date_from) {
      whereClause += ' AND r.end_date >= ?';
      queryParams.push(params.end_date_from);
    }

    if (params.end_date_to) {
      whereClause += ' AND r.end_date <= ?';
      queryParams.push(params.end_date_to);
    }

    if (params.search) {
      whereClause += ' AND (r.receiver_name LIKE ? OR r.delivery_address LIKE ? OR r.additional_notes LIKE ?)';
      const searchTerm = `%${params.search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM equipment_rental_requests r
      ${whereClause}
    `, queryParams);

    const total = (countResult as any[])[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get requests with pagination
    const [rows] = await pool.execute(`
      SELECT 
        r.*,
        CONCAT(u.first_name, ' ', u.last_name) as farmer_name,
        e.name as equipment_name,
        ec.name as category_name,
        CONCAT(admin.first_name, ' ', admin.last_name) as approved_by_name
      FROM equipment_rental_requests r
      LEFT JOIN users u ON r.farmer_id = u.id
      LEFT JOIN equipment e ON r.equipment_id = e.id
      LEFT JOIN equipment_categories ec ON e.category_id = ec.id
      LEFT JOIN users admin ON r.approved_by = admin.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ${parseInt(String(limit))} OFFSET ${parseInt(String(offset))}
    `, queryParams);

    const requests = (rows as any[]).map(row => this.mapRowToRequest(row));

    return {
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  /**
   * Get all rental requests
   */
  static async getAll(page: number = 1, limit: number = 10): Promise<{
    data: EquipmentRentalRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.search({ page, limit });
  }

  /**
   * Get requests by farmer ID
   */
  static async getByFarmer(farmerId: number, page: number = 1, limit: number = 10): Promise<{
    data: EquipmentRentalRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.search({ farmer_id: farmerId, page, limit });
  }

  /**
   * Get requests by equipment ID
   */
  static async getByEquipment(equipmentId: number, page: number = 1, limit: number = 10): Promise<{
    data: EquipmentRentalRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.search({ equipment_id: equipmentId, page, limit });
  }

  /**
   * Get requests by status
   */
  static async getByStatus(status: string, page: number = 1, limit: number = 10): Promise<{
    data: EquipmentRentalRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.search({ status, page, limit });
  }

  /**
   * Get pending requests
   */
  static async getPending(page: number = 1, limit: number = 10): Promise<{
    data: EquipmentRentalRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.getByStatus('pending', page, limit);
  }

  /**
   * Get active requests
   */
  static async getActive(page: number = 1, limit: number = 10): Promise<{
    data: EquipmentRentalRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.getByStatus('active', page, limit);
  }

  /**
   * Map database row to EquipmentRentalRequest object
   */
  private static mapRowToRequest(row: any): EquipmentRentalRequest {
    return {
      id: row.id,
      farmer_id: row.farmer_id,
      equipment_id: row.equipment_id,
      start_date: row.start_date,
      end_date: row.end_date,
      rental_duration: row.rental_duration,
      total_amount: row.total_amount,
      delivery_fee: row.delivery_fee,
      security_deposit: row.security_deposit,
      receiver_name: row.receiver_name,
      receiver_phone: row.receiver_phone,
      delivery_address: row.delivery_address,
      delivery_latitude: row.delivery_latitude,
      delivery_longitude: row.delivery_longitude,
      additional_notes: row.additional_notes,
      status: row.status,
      admin_notes: row.admin_notes,
      rejection_reason: row.rejection_reason,
      approved_by: row.approved_by,
      approved_at: row.approved_at,
      pickup_qr_code_url: row.pickup_qr_code_url,
      pickup_qr_code_data: row.pickup_qr_code_data,
      return_qr_code_url: row.return_qr_code_url,
      return_qr_code_data: row.return_qr_code_data,
      pickup_confirmed_at: row.pickup_confirmed_at,
      return_confirmed_at: row.return_confirmed_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      farmer_name: row.farmer_name,
      equipment_name: row.equipment_name,
      category_name: row.category_name,
      approved_by_name: row.approved_by_name
    };
  }
}
