import { QRCodeData, EquipmentRentalQRCodeData } from '../types';

class QRCodeService {
  private readonly APP_URL: string;
  private readonly FRONTEND_URL: string;

  constructor() {
    this.APP_URL = process.env.APP_URL || 'http://localhost:3000';
    this.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
  }

  /**
   * Generate a unique application URL for soil testing verification
   */
  generateSoilTestingURL(data: QRCodeData): {
    verificationUrl: string;
    apiUrl: string;
    uniqueId: string;
    data: {
      id: string;
      schedule_id: number;
      farmer_id: number;
      center_id: number;
      date: string;
      timestamp: string;
    };
  } {
    const uniqueId = this.generateUniqueId(data.schedule_id, data.farmer_id);
    const verificationData = {
      id: uniqueId,
      schedule_id: data.schedule_id,
      farmer_id: data.farmer_id,
      center_id: data.center_id,
      date: data.scheduled_date,
      timestamp: data.timestamp
    };

    // Create a verification URL that the field officer can use
    const verificationUrl = `${this.FRONTEND_URL}/soil-verification/${uniqueId}`;
    
    // Also create an API endpoint for verification
    const apiUrl = `${this.APP_URL}/api/v1/soil-testing/verify/${uniqueId}`;
    
    return {
      verificationUrl,
      apiUrl,
      uniqueId,
      data: verificationData
    };
  }

  /**
   * Generate a QR code URL that contains the verification data
   */
  generateQRCodeURL(data: QRCodeData): string {
    const verificationData = this.generateSoilTestingURL(data);
    
    // Create a QR code that contains the verification URL
    const qrCodeData = encodeURIComponent(verificationData.verificationUrl);
    
    // Use a reliable QR code service
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrCodeData}&format=png&margin=10`;
  }

  /**
   * Generate a unique identifier for the soil testing case
   */
  private generateUniqueId(scheduleId: number, farmerId: number): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `ST-${scheduleId}-${farmerId}-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Verify a QR code ID and extract the data
   */
  verifyQRCodeId(uniqueId: string): { schedule_id: number; farmer_id: number; center_id: number } | null {
    try {
      // Parse the unique ID format: ST-{schedule_id}-{farmer_id}-{timestamp}-{random}
      const parts = uniqueId.split('-');
      if (parts.length !== 5 || parts[0] !== 'ST') {
        return null;
      }

      const scheduleId = parseInt(parts[1]);
      const farmerId = parseInt(parts[2]);

      if (isNaN(scheduleId) || isNaN(farmerId)) {
        return null;
      }

      return {
        schedule_id: scheduleId,
        farmer_id: farmerId,
        center_id: 0 // This will be filled from the database
      };
    } catch (error) {
      console.error('Error parsing QR code ID:', error);
      return null;
    }
  }

  /**
   * Generate a simple text-based QR code for SMS (fallback)
   */
  generateTextQRCode(data: QRCodeData): string {
    const uniqueId = this.generateUniqueId(data.schedule_id, data.farmer_id);
    return `ST-${uniqueId}`;
  }

  /**
   * Generate equipment rental QR code data
   */
  generateEquipmentRentalQRCodeData(
    requestId: number, 
    farmerId: number, 
    equipmentId: number, 
    type: 'pickup' | 'return'
  ): EquipmentRentalQRCodeData {
    return {
      requestId,
      farmerId,
      equipmentId,
      type,
      timestamp: new Date().toISOString(),
      qrCode: `${type.toUpperCase()}_${requestId}_${Date.now()}`
    };
  }

  /**
   * Generate equipment rental QR code URL
   */
  generateEquipmentRentalQRCodeURL(data: EquipmentRentalQRCodeData): string {
    const qrCodeData = encodeURIComponent(JSON.stringify(data));
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrCodeData}&format=png&margin=10`;
  }

  /**
   * Generate equipment rental verification URL
   */
  generateEquipmentRentalVerificationURL(data: EquipmentRentalQRCodeData): string {
    const uniqueId = `${data.type}_${data.requestId}_${data.farmerId}`;
    return `${this.FRONTEND_URL}/equipment-verification/${uniqueId}`;
  }

  /**
   * Generate simple text-based QR code for equipment rental SMS (fallback)
   */
  generateEquipmentRentalTextQRCode(data: EquipmentRentalQRCodeData): string {
    return `${data.type.toUpperCase()}_${data.requestId}_${data.farmerId}`;
  }
}

export default new QRCodeService();
