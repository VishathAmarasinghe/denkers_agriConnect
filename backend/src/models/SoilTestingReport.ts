import { pool } from '../config/database';
import { SoilTestingReport, SoilTestingReportCreate, SoilTestingReportUpdate, SoilTestingReportSearchParams } from '../types';

export class SoilTestingReportModel {
  /**
   * Create a new soil testing report
   */
  static async create(reportData: SoilTestingReportCreate): Promise<SoilTestingReport> {
    const [result] = await pool.execute(`
      INSERT INTO soil_testing_reports (
        soil_testing_id, farmer_id, soil_collection_center_id, field_officer_id,
        report_file_name, report_file_path, report_file_size, report_file_type,
        report_title, report_summary, soil_ph, soil_nitrogen, soil_phosphorus,
        soil_potassium, soil_organic_matter, soil_texture, recommendations,
        testing_date, report_date, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      reportData.soil_testing_id,
      reportData.farmer_id,
      reportData.soil_collection_center_id,
      reportData.field_officer_id,
      reportData.report_file_name,
      reportData.report_file_path,
      reportData.report_file_size,
      reportData.report_file_type,
      reportData.report_title,
      reportData.report_summary || null,
      reportData.soil_ph || null,
      reportData.soil_nitrogen || null,
      reportData.soil_phosphorus || null,
      reportData.soil_potassium || null,
      reportData.soil_organic_matter || null,
      reportData.soil_texture || null,
      reportData.recommendations || null,
      reportData.testing_date,
      reportData.report_date,
      reportData.is_public || false
    ]);

    const reportId = (result as any).insertId;
    return this.findById(reportId);
  }

  /**
   * Find soil testing report by ID
   */
  static async findById(id: number): Promise<SoilTestingReport> {
    const [rows] = await pool.execute(`
      SELECT 
        r.*,
        CONCAT(u.first_name, ' ', u.last_name) as farmer_name,
        scc.name as center_name,
        CONCAT(fo.first_name, ' ', fo.last_name) as field_officer_name
      FROM soil_testing_reports r
      LEFT JOIN users u ON r.farmer_id = u.id
      LEFT JOIN soil_collection_centers scc ON r.soil_collection_center_id = scc.id
      LEFT JOIN users fo ON r.field_officer_id = fo.id
      WHERE r.id = ?
    `, [id]);

    const reports = rows as any[];
    if (reports.length === 0) {
      throw new Error('Soil testing report not found');
    }

    return this.mapRowToReport(reports[0]);
  }

  /**
   * Find soil testing report by soil testing ID
   */
  static async findBySoilTestingId(soilTestingId: number): Promise<SoilTestingReport | null> {
    const [rows] = await pool.execute(`
      SELECT 
        r.*,
        CONCAT(u.first_name, ' ', u.last_name) as farmer_name,
        scc.name as center_name,
        CONCAT(fo.first_name, ' ', fo.last_name) as field_officer_name
      FROM soil_testing_reports r
      LEFT JOIN users u ON r.farmer_id = u.id
      LEFT JOIN soil_collection_centers scc ON r.soil_collection_center_id = scc.id
      LEFT JOIN users fo ON r.field_officer_id = fo.id
      WHERE r.soil_testing_id = ?
    `, [soilTestingId]);

    const reports = rows as any[];
    if (reports.length === 0) {
      return null;
    }

    return this.mapRowToReport(reports[0]);
  }

  /**
   * Update soil testing report
   */
  static async update(id: number, updateData: SoilTestingReportUpdate): Promise<SoilTestingReport> {
    const fields = [];
    const values = [];

    if (updateData.report_title !== undefined) {
      fields.push('report_title = ?');
      values.push(updateData.report_title);
    }
    if (updateData.report_summary !== undefined) {
      fields.push('report_summary = ?');
      values.push(updateData.report_summary);
    }
    if (updateData.soil_ph !== undefined) {
      fields.push('soil_ph = ?');
      values.push(updateData.soil_ph);
    }
    if (updateData.soil_nitrogen !== undefined) {
      fields.push('soil_nitrogen = ?');
      values.push(updateData.soil_nitrogen);
    }
    if (updateData.soil_phosphorus !== undefined) {
      fields.push('soil_phosphorus = ?');
      values.push(updateData.soil_phosphorus);
    }
    if (updateData.soil_potassium !== undefined) {
      fields.push('soil_potassium = ?');
      values.push(updateData.soil_potassium);
    }
    if (updateData.soil_organic_matter !== undefined) {
      fields.push('soil_organic_matter = ?');
      values.push(updateData.soil_organic_matter);
    }
    if (updateData.soil_texture !== undefined) {
      fields.push('soil_texture = ?');
      values.push(updateData.soil_texture);
    }
    if (updateData.recommendations !== undefined) {
      fields.push('recommendations = ?');
      values.push(updateData.recommendations);
    }
    if (updateData.testing_date !== undefined) {
      fields.push('testing_date = ?');
      values.push(updateData.testing_date);
    }
    if (updateData.report_date !== undefined) {
      fields.push('report_date = ?');
      values.push(updateData.report_date);
    }
    if (updateData.is_public !== undefined) {
      fields.push('is_public = ?');
      values.push(updateData.is_public);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await pool.execute(`
      UPDATE soil_testing_reports 
      SET ${fields.join(', ')}
      WHERE id = ?
    `, values);

    return this.findById(id);
  }

  /**
   * Delete soil testing report
   */
  static async delete(id: number): Promise<void> {
    const [result] = await pool.execute(`
      DELETE FROM soil_testing_reports WHERE id = ?
    `, [id]);

    if ((result as any).affectedRows === 0) {
      throw new Error('Soil testing report not found');
    }
  }

  /**
   * Search soil testing reports with pagination
   */
  static async search(params: SoilTestingReportSearchParams): Promise<{
    data: SoilTestingReport[];
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

    if (params.soil_collection_center_id) {
      whereClause += ' AND r.soil_collection_center_id = ?';
      queryParams.push(parseInt(String(params.soil_collection_center_id)));
    }

    if (params.field_officer_id) {
      whereClause += ' AND r.field_officer_id = ?';
      queryParams.push(parseInt(String(params.field_officer_id)));
    }

    if (params.testing_date_from) {
      whereClause += ' AND r.testing_date >= ?';
      queryParams.push(params.testing_date_from);
    }

    if (params.testing_date_to) {
      whereClause += ' AND r.testing_date <= ?';
      queryParams.push(params.testing_date_to);
    }

    if (params.report_date_from) {
      whereClause += ' AND r.report_date >= ?';
      queryParams.push(params.report_date_from);
    }

    if (params.report_date_to) {
      whereClause += ' AND r.report_date <= ?';
      queryParams.push(params.report_date_to);
    }

    if (params.is_public !== undefined) {
      whereClause += ' AND r.is_public = ?';
      queryParams.push(params.is_public);
    }

    if (params.search) {
      whereClause += ' AND (r.report_title LIKE ? OR r.report_summary LIKE ? OR r.recommendations LIKE ?)';
      const searchTerm = `%${params.search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM soil_testing_reports r
      ${whereClause}
    `, queryParams);

    const total = (countResult as any[])[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get reports with pagination
    const [rows] = await pool.execute(`
      SELECT 
        r.*,
        CONCAT(u.first_name, ' ', u.last_name) as farmer_name,
        scc.name as center_name,
        CONCAT(fo.first_name, ' ', fo.last_name) as field_officer_name
      FROM soil_testing_reports r
      LEFT JOIN users u ON r.farmer_id = u.id
      LEFT JOIN soil_collection_centers scc ON r.soil_collection_center_id = scc.id
      LEFT JOIN users fo ON r.field_officer_id = fo.id
      ${whereClause}
      ORDER BY r.report_date DESC, r.created_at DESC
      LIMIT ${parseInt(String(limit))} OFFSET ${parseInt(String(offset))}
    `, queryParams);

    const reports = (rows as any[]).map(row => this.mapRowToReport(row));

    return {
      data: reports,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  /**
   * Get all soil testing reports
   */
  static async getAll(page: number = 1, limit: number = 10): Promise<{
    data: SoilTestingReport[];
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
   * Get reports by farmer ID
   */
  static async getByFarmer(farmerId: number, page: number = 1, limit: number = 10): Promise<{
    data: SoilTestingReport[];
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
   * Get reports by soil collection center ID
   */
  static async getByCenter(centerId: number, page: number = 1, limit: number = 10): Promise<{
    data: SoilTestingReport[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.search({ soil_collection_center_id: centerId, page, limit });
  }

  /**
   * Get public reports
   */
  static async getPublicReports(page: number = 1, limit: number = 10): Promise<{
    data: SoilTestingReport[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.search({ is_public: true, page, limit });
  }

  /**
   * Map database row to SoilTestingReport object
   */
  private static mapRowToReport(row: any): SoilTestingReport {
    return {
      id: row.id,
      soil_testing_id: row.soil_testing_id,
      farmer_id: row.farmer_id,
      soil_collection_center_id: row.soil_collection_center_id,
      field_officer_id: row.field_officer_id,
      report_file_name: row.report_file_name,
      report_file_path: row.report_file_path,
      report_file_size: row.report_file_size,
      report_file_type: row.report_file_type,
      report_title: row.report_title,
      report_summary: row.report_summary,
      soil_ph: row.soil_ph,
      soil_nitrogen: row.soil_nitrogen,
      soil_phosphorus: row.soil_phosphorus,
      soil_potassium: row.soil_potassium,
      soil_organic_matter: row.soil_organic_matter,
      soil_texture: row.soil_texture,
      recommendations: row.recommendations,
      testing_date: row.testing_date,
      report_date: row.report_date,
      is_public: Boolean(row.is_public),
      created_at: row.created_at,
      updated_at: row.updated_at,
      farmer_name: row.farmer_name,
      center_name: row.center_name,
      field_officer_name: row.field_officer_name
    };
  }
}
