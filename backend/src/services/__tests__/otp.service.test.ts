import { expect, jest, it, beforeEach, describe } from '@jest/globals';
import OTPService from '../otp';

describe('OTPService', () => {
  const testPhone = '+1234567890';

  beforeEach(() => {
    // Clear all OTPs before each test
    OTPService.clearAllOTPs();
    jest.clearAllMocks();
  });

  describe('generateOTP', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = OTPService.generateOTP(testPhone);
      
      expect(otp).toMatch(/^\d{6}$/);
      expect(otp.length).toBe(6);
    });

    it('should store OTP with expiry time', () => {
      const otp = OTPService.generateOTP(testPhone);
      const expiryTime = OTPService.getOTPExpiryTime(testPhone);
      
      expect(expiryTime).toBeTruthy();
      expect(expiryTime).toBeInstanceOf(Date);
      
      // Check if expiry is set to future time
      const now = new Date();
      expect(expiryTime!.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should generate different OTPs for different phone numbers', () => {
      const otp1 = OTPService.generateOTP('+1111111111');
      const otp2 = OTPService.generateOTP('+2222222222');
      
      expect(otp1).not.toBe(otp2);
    });
  });

  describe('storeOTP', () => {
    it('should store OTP for a phone number', () => {
      const testOTP = '123456';
      OTPService.storeOTP(testPhone, testOTP);
      
      expect(OTPService.hasOTP(testPhone)).toBe(true);
    });

    it('should overwrite existing OTP when storing new one', () => {
      const firstOTP = '111111';
      const secondOTP = '222222';
      
      OTPService.storeOTP(testPhone, firstOTP);
      OTPService.storeOTP(testPhone, secondOTP);
      
      expect(OTPService.verifyOTP(testPhone, firstOTP)).toBe(false);
      expect(OTPService.verifyOTP(testPhone, secondOTP)).toBe(true);
    });
  });

  describe('verifyOTP', () => {
    it('should return true for valid OTP', () => {
      const otp = OTPService.generateOTP(testPhone);
      const result = OTPService.verifyOTP(testPhone, otp);
      
      expect(result).toBe(true);
    });

    it('should return false for invalid OTP', () => {
      OTPService.generateOTP(testPhone);
      const result = OTPService.verifyOTP(testPhone, '999999');
      
      expect(result).toBe(false);
    });

    it('should return false for non-existent phone number', () => {
      const result = OTPService.verifyOTP('+9999999999', '123456');
      
      expect(result).toBe(false);
    });

    it('should remove OTP after successful verification', () => {
      const otp = OTPService.generateOTP(testPhone);
      
      // First verification should succeed
      expect(OTPService.verifyOTP(testPhone, otp)).toBe(true);
      
      // Second verification should fail (OTP removed)
      expect(OTPService.verifyOTP(testPhone, otp)).toBe(false);
      expect(OTPService.hasOTP(testPhone)).toBe(false);
    });
  });

  describe('clearOTP', () => {
    it('should remove OTP for a phone number', () => {
      OTPService.generateOTP(testPhone);
      expect(OTPService.hasOTP(testPhone)).toBe(true);
      
      OTPService.clearOTP(testPhone);
      expect(OTPService.hasOTP(testPhone)).toBe(false);
    });

    it('should not throw error when clearing non-existent OTP', () => {
      expect(() => OTPService.clearOTP(testPhone)).not.toThrow();
    });
  });

  describe('getOTPExpiryTime', () => {
    it('should return expiry time for existing OTP', () => {
      OTPService.generateOTP(testPhone);
      const expiryTime = OTPService.getOTPExpiryTime(testPhone);
      
      expect(expiryTime).toBeInstanceOf(Date);
      expect(expiryTime!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return null for non-existent OTP', () => {
      const expiryTime = OTPService.getOTPExpiryTime(testPhone);
      
      expect(expiryTime).toBeNull();
    });
  });

  describe('hasOTP', () => {
    it('should return true for existing valid OTP', () => {
      OTPService.generateOTP(testPhone);
      expect(OTPService.hasOTP(testPhone)).toBe(true);
    });

    it('should return false for non-existent OTP', () => {
      expect(OTPService.hasOTP(testPhone)).toBe(false);
    });
  });

    describe('resendOTP', () => {
    it('should return null when trying to resend too quickly', () => {
      const firstOTP = OTPService.generateOTP(testPhone);
      const secondOTP = OTPService.resendOTP(testPhone);
      
      // Should return null because not enough time has passed
      expect(secondOTP).toBeNull();
    });

    it('should return null for non-existent phone number', () => {
      const result = OTPService.resendOTP(testPhone);
      
      expect(result).toBeNull();
    });
  });

  describe('OTP format and validation', () => {
    it('should always generate numeric OTPs', () => {
      for (let i = 0; i < 10; i++) {
        const otp = OTPService.generateOTP(testPhone);
        expect(otp).toMatch(/^\d+$/);
        expect(parseInt(otp)).toBeGreaterThanOrEqual(100000);
        expect(parseInt(otp)).toBeLessThanOrEqual(999999);
      }
    });

    it('should handle multiple phone numbers independently', () => {
      const phone1 = '+1111111111';
      const phone2 = '+2222222222';
      
      const otp1 = OTPService.generateOTP(phone1);
      const otp2 = OTPService.generateOTP(phone2);
      
      expect(OTPService.verifyOTP(phone1, otp1)).toBe(true);
      expect(OTPService.verifyOTP(phone2, otp2)).toBe(true);
      expect(OTPService.verifyOTP(phone1, otp2)).toBe(false);
      expect(OTPService.verifyOTP(phone2, otp1)).toBe(false);
    });
  });
});
