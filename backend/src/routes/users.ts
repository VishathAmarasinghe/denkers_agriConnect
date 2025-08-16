import { Router, Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import ResponseService from '../services/response';
import { authenticateToken, requireAdmin, requireRole } from '../middleware/auth';
import { pool } from '../config/database';

const router = Router();

/**
 * @route   GET /api/v1/users/farmers
 * @desc    Get all farmers (public)
 * @access  Public
 */
router.get('/farmers', async (req: Request, res: Response) => {
  try {
    console.log('Farmers route called - starting simple test');
    
    const connection = await pool.getConnection();
    console.log('Database connection obtained');
    
    try {
      // Simple test - just get all users first
      const [allUsers] = await connection.execute('SELECT id, username, role FROM users LIMIT 5');
      console.log('All users (first 5):', allUsers);
      
      // Now try to get farmers specifically
      const [farmers] = await connection.execute('SELECT id, username, role FROM users WHERE role = ?', ['farmer']);
      console.log('Farmers found:', farmers);
      
      if ((farmers as any[]).length === 0) {
        console.log('No farmers found - returning empty result');
        return ResponseService.success(res, { data: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } }, 'No farmers found');
      }
      
      // If we have farmers, get full details
      const [fullFarmers] = await connection.execute(`
        SELECT id, username, email, phone, nic, role, first_name, last_name, location_id, is_active, created_at, updated_at
        FROM users WHERE role = ?
        ORDER BY created_at DESC
        LIMIT 100
      `, ['farmer']);
      
      console.log('Full farmers data:', fullFarmers);
      
      return ResponseService.success(res, { 
        data: fullFarmers, 
        pagination: { page: 1, limit: 100, total: (farmers as any[]).length, totalPages: 1 } 
      }, 'Farmers retrieved successfully');
      
    } finally {
      connection.release();
      console.log('Database connection released');
    }
  } catch (error) {
    console.error('Get farmers error:', error);
    return ResponseService.error(res, `Failed to retrieve farmers: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
  }
});

/**
 * @route   GET /api/v1/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Get query parameters for pagination and filtering
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const role = req.query.role as string;
      const isActive = req.query.is_active as string;
      
      // Build WHERE clause
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      
      if (role) {
        whereClause += ' AND role = ?';
        params.push(role);
      }
      
      if (isActive !== undefined) {
        whereClause += ' AND is_active = ?';
        params.push(isActive === 'true');
      }
      
      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total FROM users ${whereClause}
      `, params);
      
      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      
      // Get users
      const [users] = await connection.execute(`
        SELECT id, username, email, phone, nic, role, first_name, last_name, location_id, is_active, created_at, updated_at
        FROM users ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, limit, offset]);
      
      const pagination = {
        page,
        limit,
        total,
        totalPages
      };
      
      return ResponseService.paginated(res, users as any, { page, totalPages, total } as any, 'Users retrieved successfully');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get users error:', error);
    return ResponseService.error(res, 'Failed to retrieve users. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin or same user)
 */
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const requestingUser = req.user!;
    
    // Check if user can access this profile
    if (requestingUser.role !== 'admin' && requestingUser.userId !== userId) {
      return ResponseService.error(res, 'Access denied', 403);
    }
    
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.execute(`
        SELECT id, username, email, phone, nic, role, first_name, last_name, location_id, is_active, created_at, updated_at
        FROM users WHERE id = ?
      `, [userId]);
      
      const users = rows as any[];
      if (users.length === 0) {
        return ResponseService.error(res, 'User not found', 404);
      }
      
      const user = users[0];
      return ResponseService.success(res, user, 'User retrieved successfully');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get user error:', error);
    return ResponseService.error(res, 'Failed to retrieve user. Please try again.', 500);
  }
});

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Private (Admin or same user)
 */
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const requestingUser = req.user!;
    let updateData = req.body;
    
    // Check if user can update this profile
    if (requestingUser.role !== 'admin' && requestingUser.userId !== userId) {
      return ResponseService.error(res, 'Access denied', 403);
    }
    
          // Non-admin users can only update certain fields
      if (requestingUser.role !== 'admin') {
        const allowedFields = ['first_name', 'last_name', 'location_id'];
        const filteredData: any = {};
        
        for (const field of allowedFields) {
          if (updateData[field] !== undefined) {
            filteredData[field] = updateData[field];
          }
        }
        
        if (Object.keys(filteredData).length === 0) {
          return ResponseService.error(res, 'No valid fields to update', 400);
        }
        
        updateData = filteredData;
      }
    
    const connection = await pool.getConnection();
    
    try {
      // Check if user exists
      const [existingUsers] = await connection.execute(`
        SELECT id FROM users WHERE id = ?
      `, [userId]);
      
      if ((existingUsers as any[]).length === 0) {
        return ResponseService.error(res, 'User not found', 404);
      }
      
      // Build UPDATE query dynamically
      const fields = Object.keys(updateData);
      if (fields.length === 0) {
        return ResponseService.error(res, 'No fields to update', 400);
      }
      
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = [...fields.map(field => updateData[field]), userId];
      
      await connection.execute(`
        UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, values);
      
      return ResponseService.success(res, null, 'User updated successfully');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update user error:', error);
    return ResponseService.error(res, 'Failed to update user. Please try again.', 500);
  }
});

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user (admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Prevent admin from deleting themselves
    if (userId === 1) { // Assuming ID 1 is the main admin
      return ResponseService.error(res, 'Cannot delete main administrator', 400);
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Check if user exists
      const [existingUsers] = await connection.execute(`
        SELECT id, role FROM users WHERE id = ?
      `, [userId]);
      
      if ((existingUsers as any[]).length === 0) {
        return ResponseService.error(res, 'User not found', 404);
      }
      
      // Soft delete - set is_active to false instead of actually deleting
      await connection.execute(`
        UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [userId]);
      
      return ResponseService.success(res, null, 'User deactivated successfully');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete user error:', error);
    return ResponseService.error(res, 'Failed to delete user. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/users/:id/activate
 * @desc    Activate user (admin only)
 * @access  Private (Admin)
 */
router.post('/:id/activate', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    const connection = await pool.getConnection();
    
    try {
      // Check if user exists
      const [existingUsers] = await connection.execute(`
        SELECT id FROM users WHERE id = ?
      `, [userId]);
      
      if ((existingUsers as any[]).length === 0) {
        return ResponseService.error(res, 'User not found', 404);
      }
      
      // Activate user
      await connection.execute(`
        UPDATE users SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [userId]);
      
      return ResponseService.success(res, null, 'User activated successfully');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Activate user error:', error);
    return ResponseService.error(res, 'Failed to activate user. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/users/search
 * @desc    Search users (admin only)
 * @access  Private (Admin)
 */
router.get('/search', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { q, role } = req.query;
    
    if (!q) {
      return ResponseService.error(res, 'Search query is required', 400);
    }
    
    const connection = await pool.getConnection();
    
    try {
      let whereClause = 'WHERE (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      const params = [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`];
      
      if (role) {
        whereClause += ' AND role = ?';
        params.push(role as string);
      }
      
      const [users] = await connection.execute(`
        SELECT id, username, email, phone, role, first_name, last_name, location_id, is_active, created_at, updated_at
        FROM users ${whereClause}
        ORDER BY created_at DESC
        LIMIT 20
      `, params);
      
      return ResponseService.success(res, users, 'Search completed successfully');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Search users error:', error);
    return ResponseService.error(res, 'Search failed. Please try again.', 500);
  }
});

export default router;
