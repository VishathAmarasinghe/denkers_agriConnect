import { ValidationError } from '../../utils/errors';
import { ValidationServiceInterface, UserCreateData, LanguageUpdateData, ProfileUpdateData, SoilCollectionCenterCreateData, SoilCollectionCenterUpdateData } from '../../types';
import ValidationService from '../validation';

describe('ValidationService', () => {
  let validationService: ValidationServiceInterface;

  beforeEach(() => {
    validationService = ValidationService;
  });

  describe('validateUserRegistration', () => {
    it('should validate correct user registration data', () => {
      const validData: UserCreateData = {
        username: 'testuser',
        email: 'test@example.com',
        phone: '0771234567',
        nic: '123456789012',
        password: 'Password123!',
        role: 'farmer' as const,
        first_name: 'Test',
        last_name: 'User'
      };

      const errors = validationService.validateUserRegistration(validData);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid user registration data', () => {
      const invalidData: UserCreateData = {
        username: 'te',
        email: 'invalid-email',
        phone: '123',
        nic: '123',
        password: 'weak',
        role: 'farmer' as const,
        first_name: '',
        last_name: ''
      };

      const errors = validationService.validateUserRegistration(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'username',
        message: expect.any(String)
      }));
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'email',
        message: expect.any(String)
      }));
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'phone',
        message: expect.any(String)
      }));
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'password',
        message: expect.any(String)
      }));
    });
  });

  describe('validateLogin', () => {
    it('should validate correct login data', () => {
      const validData = {
        username: 'testuser',
        password: 'Password123!'
      };

      const errors = validationService.validateLogin(validData);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid login data', () => {
      const invalidData = {
        username: '',
        password: ''
      };

      const errors = validationService.validateLogin(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'username',
        message: expect.any(String)
      }));
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'password',
        message: expect.any(String)
      }));
    });
  });

  describe('validatePasswordChange', () => {
    it('should validate correct password change data', () => {
      const validData = {
        current_password: 'OldPassword123!',
        new_password: 'NewPassword123!'
      };

      const errors = validationService.validatePasswordChange(validData);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid password change data', () => {
      const invalidData = {
        current_password: '',
        new_password: 'weak'
      };

      const errors = validationService.validatePasswordChange(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'current_password',
        message: expect.any(String)
      }));
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'new_password',
        message: expect.any(String)
      }));
    });
  });

  describe('validateForgotPassword', () => {
    it('should validate correct forgot password data', () => {
      const validData = {
        nic: '123456789012'
      };

      const errors = validationService.validateForgotPassword(validData);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid forgot password data', () => {
      const invalidData = {
        nic: ''
      };

      const errors = validationService.validateForgotPassword(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'nic',
        message: expect.any(String)
      }));
    });
  });

  describe('validateResetPassword', () => {
    it('should validate correct reset password data', () => {
      const validData = {
        nic: '123456789012',
        otp: '123456',
        new_password: 'NewPassword123!'
      };

      const errors = validationService.validateResetPassword(validData);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid reset password data', () => {
      const invalidData = {
        nic: '',
        otp: '',
        new_password: 'weak'
      };

      const errors = validationService.validateResetPassword(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'nic',
        message: expect.any(String)
      }));
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'otp',
        message: expect.any(String)
      }));
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'new_password',
        message: expect.any(String)
      }));
    });
  });

  describe('validateLanguageUpdate', () => {
    it('should validate correct language update data', () => {
      const validData: LanguageUpdateData = {
        language: 'si' as const,
        userId: 1
      };

      const errors = validationService.validateLanguageUpdate(validData);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid language update data', () => {
      const invalidData: LanguageUpdateData = {
        language: 'si' as const,
        userId: -1
      };

      const errors = validationService.validateLanguageUpdate(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'userId',
        message: expect.any(String)
      }));
    });
  });

  describe('validateProfileUpdate', () => {
    it('should validate correct profile update data', () => {
      const validData: ProfileUpdateData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone: '0771234567',
        language: 'si' as const
      };

      const errors = validationService.validateProfileUpdate(validData);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid profile update data', () => {
      const invalidData: ProfileUpdateData = {
        first_name: '',
        last_name: '',
        email: 'invalid-email',
        phone: '123',
        language: 'si' as const
      };

      const errors = validationService.validateProfileUpdate(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'email',
        message: expect.any(String)
      }));
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'phone',
        message: expect.any(String)
      }));
    });
  });

  describe('validateSoilCollectionCenter', () => {
    it('should validate correct soil collection center data', () => {
      const validData: SoilCollectionCenterCreateData = {
        name: 'Test Center',
        location_id: 1,
        address: 'Test Address',
        contact_number: '0771234567',
        contact_person: 'Test Person',
        operating_hours: '09:00-17:00'
      };

      const errors = validationService.validateSoilCollectionCenter(validData);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid soil collection center data', () => {
      const invalidData: SoilCollectionCenterCreateData = {
        name: '',
        location_id: -1,
        address: '',
        contact_number: '123',
        contact_person: '',
        operating_hours: 'invalid'
      };

      const errors = validationService.validateSoilCollectionCenter(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'name',
        message: expect.any(String)
      }));
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'contact_number',
        message: expect.any(String)
      }));
    });
  });

  describe('validateSoilCollectionCenterUpdate', () => {
    it('should validate correct soil collection center update data', () => {
      const validData: SoilCollectionCenterUpdateData = {
        name: 'Updated Center',
        contact_number: '0771234567',
        operating_hours: '09:00-17:00',
        is_active: true
      };

      const errors = validationService.validateSoilCollectionCenterUpdate(validData);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid soil collection center update data', () => {
      const invalidData: SoilCollectionCenterUpdateData = {
        name: '',
        contact_number: '123',
        operating_hours: 'invalid',
        is_active: true
      };

      const errors = validationService.validateSoilCollectionCenterUpdate(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'contact_number',
        message: expect.any(String)
      }));
    });
  });
});