import { OTPServiceInterface } from '../types';

class OTPService implements OTPServiceInterface {
  private otpStore: Map<string, { otp: string; expiry: Date }> = new Map();
  private readonly OTP_LENGTH: number = 6;
  private readonly OTP_EXPIRY_MINUTES: number = 10;

  /**
   * Generate a random OTP
   */
  generateOTP(phone: string): string {
    // Generate a random 6-digit number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiry
    const expiry = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);
    this.otpStore.set(phone, { otp, expiry });
    
    // Clean up expired OTPs
    this.cleanupExpiredOTPs();
    
    return otp;
  }

  /**
   * Store OTP for a phone number
   */
  storeOTP(phone: string, otp: string): void {
    const expiry = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);
    this.otpStore.set(phone, { otp, expiry });
    
    // Clean up expired OTPs
    this.cleanupExpiredOTPs();
  }

  /**
   * Verify OTP for a phone number
   */
  verifyOTP(phone: string, otp: string): boolean {
    const storedData = this.otpStore.get(phone);
    
    if (!storedData) {
      return false;
    }
    
    // Check if OTP has expired
    if (new Date() > storedData.expiry) {
      this.otpStore.delete(phone);
      return false;
    }
    
    // Check if OTP matches
    if (storedData.otp === otp) {
      // Remove OTP after successful verification
      this.otpStore.delete(phone);
      return true;
    }
    
    return false;
  }

  /**
   * Clear OTP for a phone number
   */
  clearOTP(phone: string): void {
    this.otpStore.delete(phone);
  }

  /**
   * Get remaining time for OTP expiry
   */
  getOTPExpiryTime(phone: string): Date | null {
    const storedData = this.otpStore.get(phone);
    return storedData ? storedData.expiry : null;
  }

  /**
   * Check if OTP exists for a phone number
   */
  hasOTP(phone: string): boolean {
    const storedData = this.otpStore.get(phone);
    
    if (!storedData) {
      return false;
    }
    
    // Check if OTP has expired
    if (new Date() > storedData.expiry) {
      this.otpStore.delete(phone);
      return false;
    }
    
    return true;
  }

  /**
   * Resend OTP for a phone number
   */
  resendOTP(phone: string): string | null {
    const storedData = this.otpStore.get(phone);
    
    if (!storedData) {
      return null;
    }
    
    // Check if enough time has passed since last OTP (prevent spam)
    const timeSinceLastOTP = Date.now() - (storedData.expiry.getTime() - (this.OTP_EXPIRY_MINUTES * 60 * 1000));
    const minInterval = 60 * 1000; // 1 minute minimum interval
    
    if (timeSinceLastOTP < minInterval) {
      return null;
    }
    
    // Generate new OTP
    return this.generateOTP(phone);
  }

  /**
   * Get OTP statistics
   */
  getOTPStats(): { total: number; active: number; expired: number } {
    const now = new Date();
    let active = 0;
    let expired = 0;
    
    for (const [phone, data] of this.otpStore.entries()) {
      if (now > data.expiry) {
        expired++;
      } else {
        active++;
      }
    }
    
    return {
      total: this.otpStore.size,
      active,
      expired
    };
  }

  /**
   * Clean up expired OTPs
   */
  private cleanupExpiredOTPs(): void {
    const now = new Date();
    
    for (const [phone, data] of this.otpStore.entries()) {
      if (now > data.expiry) {
        this.otpStore.delete(phone);
      }
    }
  }

  /**
   * Clear all OTPs (useful for testing)
   */
  clearAllOTPs(): void {
    this.otpStore.clear();
  }

  /**
   * Get OTP store size (useful for monitoring)
   */
  getStoreSize(): number {
    return this.otpStore.size;
  }
}

export default new OTPService();
