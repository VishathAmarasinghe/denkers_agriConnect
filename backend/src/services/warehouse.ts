import WarehouseModel from '../models/Warehouse';
import WarehouseImageModel from '../models/WarehouseImage';
import WarehouseInventoryModel from '../models/WarehouseInventory';
import WarehouseAvailabilityModel from '../models/WarehouseAvailability';
import WarehouseTimeSlotModel from '../models/WarehouseTimeSlot';
import WarehouseBookingModel from '../models/WarehouseBooking';
import { 
  WarehouseCreateData, 
  WarehouseUpdateData, 
  WarehouseSearchParams,
  WarehouseImageCreate,
  WarehouseInventoryCreate,
  WarehouseInventoryUpdate,
  WarehouseAvailabilityCreate,
  WarehouseTimeSlotCreate,
  WarehouseBookingCreate,
  WarehouseAvailableDatesResponse,
  WarehouseAvailableTimeSlotsResponse
} from '../types';
import NotificationService from './notification';

class WarehouseService {
  /**
   * Create a new warehouse
   */
  static async createWarehouse(data: WarehouseCreateData): Promise<number> {
    // Check if warehouse name already exists
    const nameExists = await WarehouseModel.nameExists(data.name);
    if (nameExists) {
      throw new Error('Warehouse name already exists');
    }

    return await WarehouseModel.create(data);
  }

  /**
   * Get warehouse by ID
   */
  static async getWarehouse(id: number) {
    const warehouse = await WarehouseModel.findById(id);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    // Get warehouse images
    const images = await WarehouseImageModel.getByWarehouse(id);
    const primaryImage = await WarehouseImageModel.getPrimaryByWarehouse(id);

    return {
      ...warehouse,
      images,
      primary_image: primaryImage
    };
  }

  /**
   * Update warehouse
   */
  static async updateWarehouse(id: number, data: WarehouseUpdateData): Promise<boolean> {
    // Check if warehouse exists
    const existingWarehouse = await WarehouseModel.findById(id);
    if (!existingWarehouse) {
      throw new Error('Warehouse not found');
    }

    // Check if name already exists (if name is being updated)
    if (data.name && data.name !== existingWarehouse.name) {
      const nameExists = await WarehouseModel.nameExists(data.name, id);
      if (nameExists) {
        throw new Error('Warehouse name already exists');
      }
    }

    return await WarehouseModel.update(id, data);
  }

  /**
   * Delete warehouse
   */
  static async deleteWarehouse(id: number): Promise<boolean> {
    // Check if warehouse exists
    const existingWarehouse = await WarehouseModel.findById(id);
    if (!existingWarehouse) {
      throw new Error('Warehouse not found');
    }

    return await WarehouseModel.delete(id);
  }

  /**
   * Search warehouses
   */
  static async searchWarehouses(params: WarehouseSearchParams) {
    return await WarehouseModel.search(params);
  }

  /**
   * Get all warehouses
   */
  static async getAllWarehouses(page: number = 1, limit: number = 10) {
    return await WarehouseModel.getAll(page, limit);
  }

  /**
   * Get available warehouses
   */
  static async getAvailableWarehouses(page: number = 1, limit: number = 10) {
    return await WarehouseModel.getAvailable(page, limit);
  }

  /**
   * Get warehouses by category
   */
  static async getWarehousesByCategory(categoryId: number, page: number = 1, limit: number = 10) {
    return await WarehouseModel.getByCategory(categoryId, page, limit);
  }

  /**
   * Get warehouses by province
   */
  static async getWarehousesByProvince(provinceId: number, page: number = 1, limit: number = 10) {
    return await WarehouseModel.getByProvince(provinceId, page, limit);
  }

  /**
   * Get warehouses by district
   */
  static async getWarehousesByDistrict(districtId: number, page: number = 1, limit: number = 10) {
    return await WarehouseModel.getByDistrict(districtId, page, limit);
  }

  /**
   * Get warehouses by security level
   */
  static async getWarehousesBySecurityLevel(securityLevel: string, page: number = 1, limit: number = 10) {
    return await WarehouseModel.getBySecurityLevel(securityLevel, page, limit);
  }

  /**
   * Get warehouses by status
   */
  static async getWarehousesByStatus(status: string, page: number = 1, limit: number = 10) {
    return await WarehouseModel.getByStatus(status, page, limit);
  }

  // Warehouse Images
  /**
   * Add image to warehouse
   */
  static async addWarehouseImage(data: WarehouseImageCreate): Promise<number> {
    // Check if warehouse exists
    const warehouse = await WarehouseModel.findById(data.warehouse_id);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    return await WarehouseImageModel.create(data);
  }

  /**
   * Get warehouse images
   */
  static async getWarehouseImages(warehouseId: number) {
    return await WarehouseImageModel.getByWarehouse(warehouseId);
  }

  /**
   * Get primary warehouse image
   */
  static async getPrimaryWarehouseImage(warehouseId: number) {
    return await WarehouseImageModel.getPrimaryByWarehouse(warehouseId);
  }

  /**
   * Update warehouse image
   */
  static async updateWarehouseImage(id: number, data: Partial<WarehouseImageCreate>): Promise<boolean> {
    return await WarehouseImageModel.update(id, data);
  }

  /**
   * Delete warehouse image
   */
  static async deleteWarehouseImage(id: number): Promise<boolean> {
    return await WarehouseImageModel.delete(id);
  }

  /**
   * Set warehouse image as primary
   */
  static async setPrimaryWarehouseImage(id: number): Promise<boolean> {
    return await WarehouseImageModel.setPrimary(id);
  }

  // Warehouse Inventory
  /**
   * Add inventory item
   */
  static async addInventoryItem(data: WarehouseInventoryCreate): Promise<number> {
    // Check if warehouse exists
    const warehouse = await WarehouseModel.findById(data.warehouse_id);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    return await WarehouseInventoryModel.create(data);
  }

  /**
   * Get inventory item by ID
   */
  static async getInventoryItem(id: number) {
    const item = await WarehouseInventoryModel.findById(id);
    if (!item) {
      throw new Error('Inventory item not found');
    }

    return item;
  }

  /**
   * Update inventory item
   */
  static async updateInventoryItem(id: number, data: WarehouseInventoryUpdate): Promise<boolean> {
    return await WarehouseInventoryModel.update(id, data);
  }

  /**
   * Delete inventory item
   */
  static async deleteInventoryItem(id: number): Promise<boolean> {
    return await WarehouseInventoryModel.delete(id);
  }

  /**
   * Search inventory items
   */
  static async searchInventoryItems(params: any) {
    return await WarehouseInventoryModel.search(params);
  }

  /**
   * Get inventory by warehouse
   */
  static async getInventoryByWarehouse(warehouseId: number, page: number = 1, limit: number = 10) {
    return await WarehouseInventoryModel.getByWarehouse(warehouseId, page, limit);
  }

  /**
   * Get expiring items
   */
  static async getExpiringItems(days: number = 30) {
    return await WarehouseInventoryModel.getExpiringItems(days);
  }

  /**
   * Get inventory summary
   */
  static async getInventorySummary(warehouseId: number) {
    return await WarehouseInventoryModel.getByWarehouse(warehouseId, 1, 1000);
  }

  // Warehouse Availability
  /**
   * Set warehouse availability
   */
  static async setWarehouseAvailability(data: WarehouseAvailabilityCreate): Promise<number> {
    // Check if warehouse exists
    const warehouse = await WarehouseModel.findById(data.warehouse_id);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    return await WarehouseAvailabilityModel.create(data);
  }

  /**
   * Get warehouse availability
   */
  static async getWarehouseAvailability(warehouseId: number, startDate: Date, endDate: Date) {
    return await WarehouseAvailabilityModel.getAvailabilityForWarehouse({
      warehouse_id: warehouseId,
      start_date: startDate,
      end_date: endDate
    });
  }

  /**
   * Set warehouse as unavailable
   */
  static async setWarehouseUnavailable(warehouseId: number, date: Date, reason?: string): Promise<boolean> {
    return await WarehouseAvailabilityModel.setUnavailable(warehouseId, date, reason);
  }

  /**
   * Set warehouse as available
   */
  static async setWarehouseAvailable(warehouseId: number, date: Date): Promise<boolean> {
    return await WarehouseAvailabilityModel.setAvailable(warehouseId, date);
  }

  /**
   * Check warehouse availability
   */
  static async checkWarehouseAvailability(warehouseId: number, date: Date): Promise<boolean> {
    return await WarehouseAvailabilityModel.checkAvailability(warehouseId, date);
  }

  /**
   * Get available dates for a warehouse
   */
  static async getWarehouseAvailableDates(warehouseId: number, startDate: Date, endDate: Date): Promise<WarehouseAvailableDatesResponse> {
    // Check if warehouse exists
    const warehouse = await WarehouseModel.findById(warehouseId);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    const availability = await WarehouseAvailabilityModel.getAvailabilityForWarehouse({
      warehouse_id: warehouseId,
      start_date: startDate,
      end_date: endDate
    });

    const availableDates: Date[] = [];
    const unavailableDates: Date[] = [];

    // Generate all dates in range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dateAvailability = availability.find(a => a.date.toISOString().split('T')[0] === dateStr);
      
      if (dateAvailability) {
        if (dateAvailability.is_available) {
          availableDates.push(new Date(currentDate));
        } else {
          unavailableDates.push(new Date(currentDate));
        }
      } else {
        // Default to available if no specific availability record
        availableDates.push(new Date(currentDate));
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      warehouse_id: warehouseId,
      warehouse_name: warehouse.name,
      available_dates: availableDates,
      unavailable_dates: unavailableDates
    };
  }

  // Warehouse Time Slots
  /**
   * Create time slot
   */
  static async createTimeSlot(data: WarehouseTimeSlotCreate): Promise<number> {
    // Check if warehouse exists
    const warehouse = await WarehouseModel.findById(data.warehouse_id);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    return await WarehouseTimeSlotModel.create(data);
  }

  /**
   * Get available time slots for a warehouse on a specific date
   */
  static async getAvailableTimeSlots(warehouseId: number, date: Date): Promise<WarehouseAvailableTimeSlotsResponse> {
    // Check if warehouse exists
    const warehouse = await WarehouseModel.findById(warehouseId);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    // Check if warehouse is available on this date
    const isAvailable = await WarehouseAvailabilityModel.checkAvailability(warehouseId, date);
    if (!isAvailable) {
      throw new Error('Warehouse is not available on this date');
    }

    // Create default time slots if none exist
    await WarehouseTimeSlotModel.createDefaultTimeSlots(warehouseId, date);

    // Get available time slots
    const availableTimeSlots = await WarehouseTimeSlotModel.getAvailableTimeSlots(warehouseId, date);

    return {
      warehouse_id: warehouseId,
      date,
      available_time_slots: availableTimeSlots
    };
  }

  /**
   * Update time slot
   */
  static async updateTimeSlot(id: number, data: any): Promise<boolean> {
    return await WarehouseTimeSlotModel.update(id, data);
  }

  /**
   * Delete time slot
   */
  static async deleteTimeSlot(id: number): Promise<boolean> {
    return await WarehouseTimeSlotModel.delete(id);
  }

  // Warehouse Bookings
  /**
   * Create warehouse booking
   */
  static async createWarehouseBooking(data: WarehouseBookingCreate): Promise<number> {
    // Check if warehouse exists
    const warehouse = await WarehouseModel.findById(data.warehouse_id);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    // Check if time slot exists and is available
    const timeSlot = await WarehouseTimeSlotModel.findById(data.time_slot_id);
    if (!timeSlot) {
      throw new Error('Time slot not found');
    }

    if (!timeSlot.is_available) {
      throw new Error('Time slot is not available');
    }

    if (timeSlot.current_bookings >= timeSlot.max_bookings) {
      throw new Error('Time slot is fully booked');
    }

    // Check if warehouse is available on the booking date
    const isAvailable = await WarehouseAvailabilityModel.checkAvailability(data.warehouse_id, timeSlot.date);
    if (!isAvailable) {
      throw new Error('Warehouse is not available on this date');
    }

    // Create booking
    const bookingId = await WarehouseBookingModel.create(data);

    // Increment current bookings for the time slot
    await WarehouseTimeSlotModel.incrementBookings(data.time_slot_id);

    return bookingId;
  }

  /**
   * Get warehouse booking by ID
   */
  static async getWarehouseBooking(id: number) {
    const booking = await WarehouseBookingModel.findById(id);
    if (!booking) {
      throw new Error('Warehouse booking not found');
    }

    return booking;
  }

  /**
   * Search warehouse bookings
   */
  static async searchWarehouseBookings(params: any) {
    return await WarehouseBookingModel.search(params);
  }

  /**
   * Get warehouse bookings by farmer
   */
  static async getFarmerBookings(farmerId: number, page: number = 1, limit: number = 10) {
    return await WarehouseBookingModel.getByFarmer(farmerId, page, limit);
  }

  /**
   * Get warehouse bookings by warehouse
   */
  static async getWarehouseBookings(warehouseId: number, page: number = 1, limit: number = 10) {
    return await WarehouseBookingModel.getByWarehouse(warehouseId, page, limit);
  }

  /**
   * Get pending warehouse bookings
   */
  static async getPendingBookings(page: number = 1, limit: number = 10) {
    return await WarehouseBookingModel.getPending(page, limit);
  }

  /**
   * Approve warehouse booking
   */
  static async approveWarehouseBooking(bookingId: number, adminId: number, adminNotes?: string): Promise<boolean> {
    const booking = await WarehouseBookingModel.findById(bookingId);
    if (!booking) {
      throw new Error('Warehouse booking not found');
    }

    if (booking.status !== 'pending') {
      throw new Error('Booking is not in pending status');
    }

    // Generate QR code for pickup
    const qrCodeData = `WAREHOUSE_PICKUP_${bookingId}_${Date.now()}`;
    const qrCodeUrl = `https://example.com/qr/${qrCodeData}`; // Replace with actual QR service

    // Update booking status
    const updated = await WarehouseBookingModel.update(bookingId, {
      status: 'approved',
      admin_notes: adminNotes,
      qr_code_url: qrCodeUrl,
      qr_code_data: qrCodeData,
      approved_by: adminId,
      approved_at: new Date()
    });

    if (updated) {
      // Send SMS notification to farmer
      try {
        await NotificationService.sendSMS({
          recipient: booking.farmer_mobile,
          message: `Your warehouse booking has been approved! QR Code: ${qrCodeUrl}`
        });
      } catch (error) {
        console.error('Failed to send SMS notification:', error);
      }
    }

    return updated;
  }

  /**
   * Reject warehouse booking
   */
  static async rejectWarehouseBooking(bookingId: number, adminId: number, rejectionReason: string, adminNotes?: string): Promise<boolean> {
    const booking = await WarehouseBookingModel.findById(bookingId);
    if (!booking) {
      throw new Error('Warehouse booking not found');
    }

    if (booking.status !== 'pending') {
      throw new Error('Booking is not in pending status');
    }

    // Update booking status
    const updated = await WarehouseBookingModel.update(bookingId, {
      status: 'rejected',
      rejection_reason: rejectionReason,
      admin_notes: adminNotes,
      approved_by: adminId,
      approved_at: new Date()
    });

    if (updated) {
      // Decrement current bookings for the time slot
      await WarehouseTimeSlotModel.decrementBookings(booking.time_slot_id);

      // Send SMS notification to farmer
      try {
        await NotificationService.sendSMS({
          recipient: booking.farmer_mobile,
          message: `Your warehouse booking has been rejected. Reason: ${rejectionReason}`
        });
      } catch (error) {
        console.error('Failed to send SMS notification:', error);
      }
    }

    return updated;
  }

  /**
   * Confirm warehouse pickup (scan QR code)
   */
  static async confirmWarehousePickup(bookingId: number): Promise<boolean> {
    const booking = await WarehouseBookingModel.findById(bookingId);
    if (!booking) {
      throw new Error('Warehouse booking not found');
    }

    if (booking.status !== 'approved') {
      throw new Error('Booking is not in approved status');
    }

    // Generate QR code for return
    const returnQrCodeData = `WAREHOUSE_RETURN_${bookingId}_${Date.now()}`;
    const returnQrCodeUrl = `https://example.com/qr/${returnQrCodeData}`; // Replace with actual QR service

    // Update booking with return QR code
    await WarehouseBookingModel.updateReturnQRCode(bookingId, returnQrCodeUrl, returnQrCodeData);

    // Send SMS notification to farmer with return QR code
    try {
      await NotificationService.sendSMS({
        recipient: booking.farmer_mobile,
        message: `Your warehouse pickup has been confirmed! Return QR Code: ${returnQrCodeUrl}`
      });
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
    }

    return true;
  }

  /**
   * Confirm warehouse return (scan QR code)
   */
  static async confirmWarehouseReturn(bookingId: number): Promise<boolean> {
    const booking = await WarehouseBookingModel.findById(bookingId);
    if (!booking) {
      throw new Error('Warehouse booking not found');
    }

    if (booking.status !== 'approved') {
      throw new Error('Booking is not in approved status');
    }

    // Mark booking as completed
    const completed = await WarehouseBookingModel.confirmReturn(bookingId);

    if (completed) {
      // Decrement current bookings for the time slot
      await WarehouseTimeSlotModel.decrementBookings(booking.time_slot_id);
    }

    return completed;
  }

  /**
   * Get today's warehouse bookings
   */
  static async getTodayBookings(warehouseId?: number) {
    return await WarehouseBookingModel.getTodayBookings(warehouseId);
  }

  /**
   * Get overdue warehouse bookings
   */
  static async getOverdueBookings() {
    return await WarehouseBookingModel.getOverdue();
  }

  /**
   * Get warehouse booking statistics
   */
  static async getBookingStatistics(warehouseId?: number, startDate?: Date, endDate?: Date) {
    return await WarehouseBookingModel.getBookingStatistics(warehouseId, startDate, endDate);
  }

  /**
   * Get time slot statistics
   */
  static async getTimeSlotStatistics(warehouseId: number, startDate: Date, endDate: Date) {
    return await WarehouseTimeSlotModel.getTimeSlotStatistics(warehouseId, startDate, endDate);
  }

  /**
   * Get availability summary
   */
  static async getAvailabilitySummary(warehouseId: number, startDate: Date, endDate: Date) {
    return await WarehouseAvailabilityModel.getAvailabilitySummary(warehouseId, startDate, endDate);
  }
}

export default WarehouseService;
