import validator from 'validator';
import { UserCreateData, LoginData, PasswordChangeData, ForgotPasswordData, ResetPasswordData, ValidationError, ValidationServiceInterface, LanguageUpdateData, ProfileUpdateData, SoilCollectionCenterCreateData, SoilCollectionCenterUpdateData } from '../types';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class ValidationService implements ValidationServiceInterface {
  /**
   * Validate user registration data
   */
  validateUserRegistration(data: UserCreateData): ValidationError[] {
    const errors: ValidationError[] = [];

    // Username validation
    if (!data.username || data.username.trim().length < 3) {
      errors.push({ field: 'username', message: 'Username must be at least 3 characters long' });
    }

    // Allow usernames with letters, numbers, underscores, and hyphens (no dots)
    if (data.username && !/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      errors.push({ field: 'username', message: 'Username can only contain letters, numbers, underscores, and hyphens' });
    }

    // Email validation (optional)
    if (data.email && !validator.isEmail(data.email)) {
      errors.push({ field: 'email', message: 'Please provide a valid email address' });
    }

    // Phone validation
    if (!data.phone || !this.isValidPhoneNumber(data.phone)) {
      errors.push({ field: 'phone', message: 'Please provide a valid phone number' });
    }

    // Password validation
    if (!data.password || data.password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
    }

    // Make password strength validation optional for now
    // if (data.password && !this.isStrongPassword(data.password)) {
    //   console.log('Password strength validation failed');
    //   errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' });
    // }

    // Name validation
    if (!data.first_name || data.first_name.trim().length < 2) {
      errors.push({ field: 'first_name', message: 'First name must be at least 2 characters long' });
    }

    // Make last name optional - if not provided, use first name
    if (data.last_name && data.last_name.trim().length < 2) {
      errors.push({ field: 'last_name', message: 'Last name must be at least 2 characters long if provided' });
    }

    // Role validation
    if (!data.role || !['admin', 'farmer', 'field_officer'].includes(data.role)) {
      errors.push({ field: 'role', message: 'Please select a valid role' });
    }

    return errors;
  }

  /**
   * Validate login data
   */
  validateLogin(data: LoginData): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check if either username, email, phone, or NIC is provided
    if ((!data.username || data.username.trim().length === 0) && 
        (!data.email || data.email.trim().length === 0) &&
        (!data.phone || data.phone.trim().length === 0) &&
        (!data.nic || data.nic.trim().length === 0)) {
      errors.push({ field: 'username', message: 'Username, email, phone, or NIC is required' });
    }

    if (!data.password || data.password.length === 0) {
      errors.push({ field: 'password', message: 'Password is required' });
    }

    return errors;
  }

  /**
   * Validate password change data
   */
  validatePasswordChange(data: PasswordChangeData): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data.current_password || data.current_password.length === 0) {
      errors.push({ field: 'current_password', message: 'Current password is required' });
    }

    if (!data.new_password || data.new_password.length < 8) {
      errors.push({ field: 'new_password', message: 'New password must be at least 8 characters long' });
    }

    if (data.new_password && !this.isStrongPassword(data.new_password)) {
      errors.push({ field: 'new_password', message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' });
    }

    if (data.current_password === data.new_password) {
      errors.push({ field: 'new_password', message: 'New password must be different from current password' });
    }

    return errors;
  }

  /**
   * Validate forgot password data
   */
  validateForgotPassword(data: ForgotPasswordData): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data.nic || data.nic.length !== 12 || !validator.isNumeric(data.nic)) {
      errors.push({ field: 'nic', message: 'Please provide a valid 12-digit NIC number' });
    }

    return errors;
  }

  /**
   * Validate reset password data
   */
  validateResetPassword(data: ResetPasswordData): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data.nic || data.nic.length !== 12 || !validator.isNumeric(data.nic)) {
      errors.push({ field: 'nic', message: 'Please provide a valid 12-digit NIC number' });
    }

    if (!data.otp || data.otp.length !== 6 || !validator.isNumeric(data.otp)) {
      errors.push({ field: 'otp', message: 'Please provide a valid 6-digit OTP' });
    }

    if (!data.new_password || data.new_password.length < 6) {
      errors.push({ field: 'new_password', message: 'New password must be at least 6 characters long' });
    }

    return errors;
  }

  /**
   * Validate language update data
   */
  validateLanguageUpdate(data: LanguageUpdateData): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data.language || !['si', 'ta', 'en'].includes(data.language)) {
      errors.push({ field: 'language', message: 'Please select a valid language: si (Sinhala), ta (Tamil), or en (English)' });
    }

    // Check that either userId or nic is provided
    if (!data.userId && !data.nic) {
      errors.push({ field: 'userId', message: 'Either userId or nic is required' });
    }

    // If both are provided, that's fine, but if only one is provided, validate it
    if (data.userId && (!Number.isInteger(data.userId) || data.userId <= 0)) {
      errors.push({ field: 'userId', message: 'userId must be a positive integer' });
    }

    if (data.nic && (data.nic.length !== 12 || !validator.isNumeric(data.nic))) {
      errors.push({ field: 'nic', message: 'NIC must be a valid 12-digit number' });
    }

    return errors;
  }

  /**
   * Validate profile update data
   */
  validateProfileUpdate(data: ProfileUpdateData): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate first name
    if (data.first_name !== undefined) {
      if (!data.first_name || data.first_name.trim().length === 0) {
        errors.push({ field: 'first_name', message: 'First name is required' });
      } else if (data.first_name.trim().length < 2) {
        errors.push({ field: 'first_name', message: 'First name must be at least 2 characters long' });
      } else if (data.first_name.trim().length > 50) {
        errors.push({ field: 'first_name', message: 'First name must be less than 50 characters' });
      }
    }

    // Validate last name
    if (data.last_name !== undefined) {
      if (data.last_name.trim().length > 50) {
        errors.push({ field: 'last_name', message: 'Last name must be less than 50 characters' });
      }
    }

    // Validate email
    if (data.email !== undefined) {
      if (!data.email || data.email.trim().length === 0) {
        errors.push({ field: 'email', message: 'Email is required' });
      } else if (!validator.isEmail(data.email.trim())) {
        errors.push({ field: 'email', message: 'Please provide a valid email address' });
      }
    }

    // Validate phone
    if (data.phone !== undefined) {
      if (!data.phone || data.phone.trim().length === 0) {
        errors.push({ field: 'phone', message: 'Phone number is required' });
      } else if (!validator.isMobilePhone(data.phone.trim(), 'any')) {
        errors.push({ field: 'phone', message: 'Please provide a valid phone number' });
      }
    }

    // Validate language
    if (data.language !== undefined) {
      if (!['si', 'ta', 'en'].includes(data.language)) {
        errors.push({ field: 'language', message: 'Please select a valid language: si (Sinhala), ta (Tamil), or en (English)' });
      }
    }

    // Validate location_id
    if (data.location_id !== undefined) {
      if (!Number.isInteger(data.location_id) || data.location_id <= 0) {
        errors.push({ field: 'location_id', message: 'Location ID must be a positive integer' });
      }
    }

    // Validate profile_image_url
    if (data.profile_image_url !== undefined) {
      if (data.profile_image_url && !validator.isURL(data.profile_image_url)) {
        errors.push({ field: 'profile_image_url', message: 'Please provide a valid URL for profile image' });
      }
    }

    return errors;
  }

  /**
   * Validate Google signup data
   */
  validateGoogleSignup(data: { idToken: string; accessToken: string; user: any }): ValidationError[] {
    const errors: ValidationError[] = [];

    // ID token validation
    if (!data.idToken || data.idToken.trim().length === 0) {
      errors.push({ field: 'idToken', message: 'Google ID token is required' });
    }

    // Access token validation
    if (!data.accessToken || data.accessToken.trim().length === 0) {
      errors.push({ field: 'accessToken', message: 'Google access token is required' });
    }

    // User data validation
    if (!data.user || !data.user.email || !data.user.name) {
      errors.push({ field: 'user', message: 'User information is required' });
    }

    // Email validation
    if (data.user?.email && !validator.isEmail(data.user.email)) {
      errors.push({ field: 'email', message: 'Please provide a valid email address' });
    }

    // Name validation
    if (data.user?.name && data.user.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
    }

    return errors;
  }

  /**
   * Validate soil collection center creation data
   */
  validateSoilCollectionCenter(data: SoilCollectionCenterCreateData): ValidationError[] {
    const errors: ValidationError[] = [];

    // Name validation
    if (!data.name || data.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Center name must be at least 2 characters long' });
    }

    // Location ID validation
    if (!data.location_id || !Number.isInteger(data.location_id) || data.location_id <= 0) {
      errors.push({ field: 'location_id', message: 'Valid location ID is required' });
    }

    // Address validation
    if (!data.address || data.address.trim().length < 5) {
      errors.push({ field: 'address', message: 'Address must be at least 5 characters long' });
    }

    // Contact number validation
    if (!data.contact_number || !this.isValidPhoneNumber(data.contact_number)) {
      errors.push({ field: 'contact_number', message: 'Please provide a valid contact number' });
    }

    // Contact person validation (optional)
    if (data.contact_person && data.contact_person.trim().length < 2) {
      errors.push({ field: 'contact_person', message: 'Contact person name must be at least 2 characters long if provided' });
    }

    // Description validation (optional)
    if (data.description && data.description.trim().length < 10) {
      errors.push({ field: 'description', message: 'Description must be at least 10 characters long if provided' });
    }

    // Image URL validation (optional)
    if (data.image_url && !validator.isURL(data.image_url)) {
      errors.push({ field: 'image_url', message: 'Please provide a valid image URL' });
    }

    // Latitude validation (optional)
    if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
      errors.push({ field: 'latitude', message: 'Latitude must be between -90 and 90' });
    }

    // Longitude validation (optional)
    if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
      errors.push({ field: 'longitude', message: 'Longitude must be between -180 and 180' });
    }

    // Place ID validation (optional)
    if (data.place_id && data.place_id.trim().length < 5) {
      errors.push({ field: 'place_id', message: 'Place ID must be at least 5 characters long if provided' });
    }

    return errors;
  }

  /**
   * Validate soil collection center update data
   */
  validateSoilCollectionCenterUpdate(data: SoilCollectionCenterUpdateData): ValidationError[] {
    const errors: ValidationError[] = [];

    // Name validation (optional in updates)
    if (data.name !== undefined && (!data.name || data.name.trim().length < 2)) {
      errors.push({ field: 'name', message: 'Center name must be at least 2 characters long' });
    }

    // Location ID validation (optional in updates)
    if (data.location_id !== undefined && (!Number.isInteger(data.location_id) || data.location_id <= 0)) {
      errors.push({ field: 'location_id', message: 'Valid location ID is required' });
    }

    // Address validation (optional in updates)
    if (data.address !== undefined && (!data.address || data.address.trim().length < 5)) {
      errors.push({ field: 'address', message: 'Address must be at least 5 characters long' });
    }

    // Contact number validation (optional in updates)
    if (data.contact_number !== undefined && (!data.contact_number || !this.isValidPhoneNumber(data.contact_number))) {
      errors.push({ field: 'contact_number', message: 'Please provide a valid contact number' });
    }

    // Contact person validation (optional)
    if (data.contact_person !== undefined && data.contact_person && data.contact_person.trim().length < 2) {
      errors.push({ field: 'contact_person', message: 'Contact person name must be at least 2 characters long if provided' });
    }

    // Description validation (optional)
    if (data.description !== undefined && data.description && data.description.trim().length < 10) {
      errors.push({ field: 'description', message: 'Description must be at least 10 characters long if provided' });
    }

    // Image URL validation (optional)
    if (data.image_url !== undefined && data.image_url && !validator.isURL(data.image_url)) {
      errors.push({ field: 'image_url', message: 'Please provide a valid image URL' });
    }

    // Latitude validation (optional)
    if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
      errors.push({ field: 'latitude', message: 'Latitude must be between -90 and 90' });
    }

    // Longitude validation (optional)
    if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
      errors.push({ field: 'longitude', message: 'Longitude must be between -180 and 180' });
    }

    // Place ID validation (optional)
    if (data.place_id !== undefined && data.place_id && data.place_id.trim().length < 5) {
      errors.push({ field: 'place_id', message: 'Place ID must be at least 5 characters long if provided' });
    }

    return errors;
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's a valid Sri Lankan phone number
    // Sri Lankan numbers start with 7 and are 9 digits long
    if (cleanPhone.length === 9 && cleanPhone.startsWith('7')) {
      return true;
    }
    
    // Check if it's a valid Sri Lankan phone number with leading 0 (10 digits)
    if (cleanPhone.length === 10 && cleanPhone.startsWith('07')) {
      return true;
    }
    
    // Check if it's a valid international format with country code
    if (cleanPhone.length === 12 && cleanPhone.startsWith('94')) {
      return true;
    }
    
    // Check if it's a valid international format with +94
    if (phone.startsWith('+94') && cleanPhone.length === 12) {
      return true;
    }
    
    // Allow any 10-digit number for flexibility
    if (cleanPhone.length === 10) {
      return true;
    }
    
    // Allow the format used in the database (+9411XXXXXXXX)
    if (phone.startsWith('+94') && cleanPhone.length === 13) {
      return true;
    }
    
    // Allow any 11-digit number for flexibility (including +94XXXXXXXXX)
    if (cleanPhone.length === 11) {
      return true;
    }
    
    return false;
  }

  /**
   * Validate password strength
   */
  private isStrongPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  /**
   * Sanitize input data
   */
  sanitizeInput(input: string): string {
    return validator.escape(validator.trim(input));
  }

  /**
   * Validate and sanitize email
   */
  validateAndSanitizeEmail(email: string): string | null {
    if (!validator.isEmail(email)) {
      return null;
    }
    return validator.normalizeEmail(email) || email;
  }

  /**
   * Validate and sanitize phone number
   */
  validateAndSanitizePhone(phone: string): string | null {
    if (!this.isValidPhoneNumber(phone)) {
      return null;
    }
    
    // Normalize to international format
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 9 && cleanPhone.startsWith('7')) {
      return `+94${cleanPhone}`;
    }
    
    return phone;
  }

  // ==================== SOIL TESTING SCHEDULING VALIDATION ====================

  /**
   * Validate soil testing request data
   */
  validateSoilTestingRequest(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data.soil_collection_center_id || isNaN(data.soil_collection_center_id) || data.soil_collection_center_id <= 0) {
      errors.push({ field: 'soil_collection_center_id', message: 'Valid soil collection center ID is required' });
    }

    if (!data.preferred_date || !this.isValidDate(data.preferred_date)) {
      errors.push({ field: 'preferred_date', message: 'Valid preferred date is required' });
    }

    if (!data.farmer_phone || !this.isValidPhoneNumber(data.farmer_phone)) {
      errors.push({ field: 'farmer_phone', message: 'Valid farmer phone number is required' });
    }

    if (data.farmer_location_address && data.farmer_location_address.trim().length < 5) {
      errors.push({ field: 'farmer_location_address', message: 'Location address must be at least 5 characters long' });
    }

    if (data.farmer_latitude !== undefined && data.farmer_latitude !== null && (data.farmer_latitude < -90 || data.farmer_latitude > 90)) {
      errors.push({ field: 'farmer_latitude', message: 'Latitude must be between -90 and 90' });
    }

    if (data.farmer_longitude !== undefined && data.farmer_longitude !== null && (data.farmer_longitude < -180 || data.farmer_longitude > 180)) {
      errors.push({ field: 'farmer_longitude', message: 'Longitude must be between -180 and 180' });
    }

    return errors;
  }

  /**
   * Validate soil testing request update data
   */
  validateSoilTestingRequestUpdate(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (data.status && !['pending', 'approved', 'rejected', 'cancelled'].includes(data.status)) {
      errors.push({ field: 'status', message: 'Invalid status value' });
    }

    if (data.approved_date && !this.isValidDate(data.approved_date)) {
      errors.push({ field: 'approved_date', message: 'Valid approved date is required' });
    }

    if (data.approved_start_time && !this.isValidTime(data.approved_start_time)) {
      errors.push({ field: 'approved_start_time', message: 'Valid start time is required' });
    }

    if (data.approved_end_time && !this.isValidTime(data.approved_end_time)) {
      errors.push({ field: 'approved_end_time', message: 'Valid end time is required' });
    }

    if (data.field_visitor_id !== undefined && (isNaN(data.field_visitor_id) || data.field_visitor_id <= 0)) {
      errors.push({ field: 'field_visitor_id', message: 'Valid field visitor ID is required' });
    }

    return errors;
  }

  /**
   * Validate soil testing time slot data
   */
  validateSoilTestingTimeSlot(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data.soil_collection_center_id || isNaN(data.soil_collection_center_id) || data.soil_collection_center_id <= 0) {
      errors.push({ field: 'soil_collection_center_id', message: 'Valid soil collection center ID is required' });
    }

    if (!data.date || !this.isValidDate(data.date)) {
      errors.push({ field: 'date', message: 'Valid date is required' });
    }

    if (!data.start_time || !this.isValidTime(data.start_time)) {
      errors.push({ field: 'start_time', message: 'Valid start time is required' });
    }

    if (!data.end_time || !this.isValidTime(data.end_time)) {
      errors.push({ field: 'end_time', message: 'Valid end time is required' });
    }

    if (data.max_bookings !== undefined && (isNaN(data.max_bookings) || data.max_bookings <= 0)) {
      errors.push({ field: 'max_bookings', message: 'Max bookings must be a positive number' });
    }

    return errors;
  }

  /**
   * Validate soil testing time slot update data
   */
  validateSoilTestingTimeSlotUpdate(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (data.is_available !== undefined && typeof data.is_available !== 'boolean') {
      errors.push({ field: 'is_available', message: 'is_available must be a boolean value' });
    }

    if (data.max_bookings !== undefined && (isNaN(data.max_bookings) || data.max_bookings <= 0)) {
      errors.push({ field: 'max_bookings', message: 'Max bookings must be a positive number' });
    }

    if (data.current_bookings !== undefined && (isNaN(data.current_bookings) || data.current_bookings < 0)) {
      errors.push({ field: 'current_bookings', message: 'Current bookings must be a non-negative number' });
    }

    return errors;
  }

  /**
   * Validate field officer data
   */
  validateFieldOfficer(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data.user_id || isNaN(data.user_id) || data.user_id <= 0) {
      errors.push({ field: 'user_id', message: 'Valid user ID is required' });
    }

    if (data.specialization && data.specialization.trim().length < 2) {
      errors.push({ field: 'specialization', message: 'Specialization must be at least 2 characters long' });
    }

    if (data.assigned_province_id !== undefined && (isNaN(data.assigned_province_id) || data.assigned_province_id <= 0)) {
      errors.push({ field: 'assigned_province_id', message: 'Valid province ID is required' });
    }

    if (data.assigned_district_id !== undefined && (isNaN(data.assigned_district_id) || data.assigned_district_id <= 0)) {
      errors.push({ field: 'assigned_district_id', message: 'Valid district ID is required' });
    }

    return errors;
  }

  /**
   * Validate field officer update data
   */
  validateFieldOfficerUpdate(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (data.specialization !== undefined && data.specialization && data.specialization.trim().length < 2) {
      errors.push({ field: 'specialization', message: 'Specialization must be at least 2 characters long' });
    }

    if (data.assigned_province_id !== undefined && (isNaN(data.assigned_province_id) || data.assigned_province_id <= 0)) {
      errors.push({ field: 'assigned_province_id', message: 'Valid province ID is required' });
    }

    if (data.assigned_district_id !== undefined && (isNaN(data.assigned_district_id) || data.assigned_district_id <= 0)) {
      errors.push({ field: 'assigned_district_id', message: 'Valid district ID is required' });
    }

    return errors;
  }

  /**
   * Validate soil testing schedule data
   */
  validateSoilTestingSchedule(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data.soil_collection_center_id || isNaN(data.soil_collection_center_id) || data.soil_collection_center_id <= 0) {
      errors.push({ field: 'soil_collection_center_id', message: 'Valid soil collection center ID is required' });
    }

    if (!data.scheduled_date || !this.isValidDate(data.scheduled_date)) {
      errors.push({ field: 'scheduled_date', message: 'Valid scheduled date is required' });
    }

    if (!data.farmer_phone || !this.isValidPhoneNumber(data.farmer_phone)) {
      errors.push({ field: 'farmer_phone', message: 'Valid farmer phone number is required' });
    }

    if (data.start_time && !this.isValidTime(data.start_time)) {
      errors.push({ field: 'start_time', message: 'Valid start time is required' });
    }

    if (data.end_time && !this.isValidTime(data.end_time)) {
      errors.push({ field: 'end_time', message: 'Valid end time is required' });
    }

    if (data.farmer_location_address && data.farmer_location_address.trim().length < 5) {
      errors.push({ field: 'farmer_location_address', message: 'Location address must be at least 5 characters long' });
    }

    if (data.farmer_latitude !== undefined && data.farmer_latitude !== null && (data.farmer_latitude < -90 || data.farmer_latitude > 90)) {
      errors.push({ field: 'farmer_latitude', message: 'Latitude must be between -90 and 90' });
    }

    if (data.farmer_longitude !== undefined && data.farmer_longitude !== null && (data.farmer_longitude < -180 || data.farmer_longitude > 180)) {
      errors.push({ field: 'farmer_longitude', message: 'Longitude must be between -180 and 180' });
    }

    if (data.field_visitor_id !== undefined && (isNaN(data.field_visitor_id) || data.field_visitor_id <= 0)) {
      errors.push({ field: 'field_visitor_id', message: 'Valid field visitor ID is required' });
    }

    return errors;
  }

  /**
   * Validate soil testing schedule update data
   */
  validateSoilTestingScheduleUpdate(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (data.status && !['pending', 'approved', 'rejected', 'completed', 'cancelled'].includes(data.status)) {
      errors.push({ field: 'status', message: 'Invalid status value' });
    }

    if (data.start_time && !this.isValidTime(data.start_time)) {
      errors.push({ field: 'start_time', message: 'Valid start time is required' });
    }

    if (data.end_time && !this.isValidTime(data.end_time)) {
      errors.push({ field: 'end_time', message: 'Valid end time is required' });
    }

    if (data.field_visitor_id !== undefined && (isNaN(data.field_visitor_id) || data.field_visitor_id <= 0)) {
      errors.push({ field: 'field_visitor_id', message: 'Valid field visitor ID is required' });
    }

    return errors;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Validate date format (YYYY-MM-DD)
   */
  private isValidDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  }

  /**
   * Validate time format (HH:MM:SS or HH:MM)
   */
  private isValidTime(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return timeRegex.test(time);
  }

  // ==================== SOIL TESTING REPORTS ====================

  /**
   * Validate soil testing report creation
   */
  validateSoilTestingReport(reportData: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!reportData.soil_testing_id || isNaN(reportData.soil_testing_id)) {
      errors.push({ field: 'soil_testing_id', message: 'Valid soil testing ID is required' });
    }

    if (!reportData.farmer_id || isNaN(reportData.farmer_id)) {
      errors.push({ field: 'farmer_id', message: 'Valid farmer ID is required' });
    }

    if (!reportData.soil_collection_center_id || isNaN(reportData.soil_collection_center_id)) {
      errors.push({ field: 'soil_collection_center_id', message: 'Valid soil collection center ID is required' });
    }

    if (!reportData.field_officer_id || isNaN(reportData.field_officer_id)) {
      errors.push({ field: 'field_officer_id', message: 'Valid field officer ID is required' });
    }

    if (!reportData.report_title || reportData.report_title.trim().length === 0) {
      errors.push({ field: 'report_title', message: 'Report title is required' });
    }

    if (reportData.report_title && reportData.report_title.length > 255) {
      errors.push({ field: 'report_title', message: 'Report title must be less than 255 characters' });
    }

    if (reportData.report_summary && reportData.report_summary.length > 1000) {
      errors.push({ field: 'report_summary', message: 'Report summary must be less than 1000 characters' });
    }

    if (reportData.soil_ph !== undefined && (isNaN(reportData.soil_ph) || reportData.soil_ph < 0 || reportData.soil_ph > 14)) {
      errors.push({ field: 'soil_ph', message: 'Soil pH must be between 0 and 14' });
    }

    if (reportData.soil_nitrogen !== undefined && (isNaN(reportData.soil_nitrogen) || reportData.soil_nitrogen < 0)) {
      errors.push({ field: 'soil_nitrogen', message: 'Soil nitrogen must be a positive number' });
    }

    if (reportData.soil_phosphorus !== undefined && (isNaN(reportData.soil_phosphorus) || reportData.soil_phosphorus < 0)) {
      errors.push({ field: 'soil_phosphorus', message: 'Soil phosphorus must be a positive number' });
    }

    if (reportData.soil_potassium !== undefined && (isNaN(reportData.soil_potassium) || reportData.soil_potassium < 0)) {
      errors.push({ field: 'soil_potassium', message: 'Soil potassium must be a positive number' });
    }

    if (reportData.soil_organic_matter !== undefined && (isNaN(reportData.soil_organic_matter) || reportData.soil_organic_matter < 0 || reportData.soil_organic_matter > 100)) {
      errors.push({ field: 'soil_organic_matter', message: 'Soil organic matter must be between 0 and 100' });
    }

    if (reportData.soil_texture && reportData.soil_texture.length > 50) {
      errors.push({ field: 'soil_texture', message: 'Soil texture must be less than 50 characters' });
    }

    if (reportData.recommendations && reportData.recommendations.length > 1000) {
      errors.push({ field: 'recommendations', message: 'Recommendations must be less than 1000 characters' });
    }

    if (!reportData.testing_date || !this.isValidDate(reportData.testing_date)) {
      errors.push({ field: 'testing_date', message: 'Valid testing date is required' });
    }

    if (!reportData.report_date || !this.isValidDate(reportData.report_date)) {
      errors.push({ field: 'report_date', message: 'Valid report date is required' });
    }

    return errors;
  }

  /**
   * Validate soil testing report update
   */
  validateSoilTestingReportUpdate(reportData: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (reportData.report_title !== undefined && reportData.report_title.trim().length === 0) {
      errors.push({ field: 'report_title', message: 'Report title cannot be empty' });
    }

    if (reportData.report_title && reportData.report_title.length > 255) {
      errors.push({ field: 'report_title', message: 'Report title must be less than 255 characters' });
    }

    if (reportData.report_summary !== undefined && reportData.report_summary.length > 1000) {
      errors.push({ field: 'report_summary', message: 'Report summary must be less than 1000 characters' });
    }

    if (reportData.soil_ph !== undefined && (isNaN(reportData.soil_ph) || reportData.soil_ph < 0 || reportData.soil_ph > 14)) {
      errors.push({ field: 'soil_ph', message: 'Soil pH must be between 0 and 14' });
    }

    if (reportData.soil_nitrogen !== undefined && (isNaN(reportData.soil_nitrogen) || reportData.soil_nitrogen < 0)) {
      errors.push({ field: 'soil_nitrogen', message: 'Soil nitrogen must be a positive number' });
    }

    if (reportData.soil_phosphorus !== undefined && (isNaN(reportData.soil_phosphorus) || reportData.soil_phosphorus < 0)) {
      errors.push({ field: 'soil_phosphorus', message: 'Soil phosphorus must be a positive number' });
    }

    if (reportData.soil_potassium !== undefined && (isNaN(reportData.soil_potassium) || reportData.soil_potassium < 0)) {
      errors.push({ field: 'soil_potassium', message: 'Soil potassium must be a positive number' });
    }

    if (reportData.soil_organic_matter !== undefined && (isNaN(reportData.soil_organic_matter) || reportData.soil_organic_matter < 0 || reportData.soil_organic_matter > 100)) {
      errors.push({ field: 'soil_organic_matter', message: 'Soil organic matter must be between 0 and 100' });
    }

    if (reportData.soil_texture !== undefined && reportData.soil_texture.length > 50) {
      errors.push({ field: 'soil_texture', message: 'Soil texture must be less than 50 characters' });
    }

    if (reportData.recommendations !== undefined && reportData.recommendations.length > 1000) {
      errors.push({ field: 'recommendations', message: 'Recommendations must be less than 1000 characters' });
    }

    if (reportData.testing_date !== undefined && !this.isValidDate(reportData.testing_date)) {
      errors.push({ field: 'testing_date', message: 'Valid testing date is required' });
    }

    if (reportData.report_date !== undefined && !this.isValidDate(reportData.report_date)) {
      errors.push({ field: 'report_date', message: 'Valid report date is required' });
    }

    return errors;
  }

  // ==================== EQUIPMENT RENTAL SYSTEM ====================

  /**
   * Validate equipment category creation
   */
  validateEquipmentCategory(categoryData: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!categoryData.name || categoryData.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Category name is required' });
    }

    if (categoryData.name && categoryData.name.length > 100) {
      errors.push({ field: 'name', message: 'Category name must be less than 100 characters' });
    }

    if (categoryData.description && categoryData.description.length > 500) {
      errors.push({ field: 'description', message: 'Description must be less than 500 characters' });
    }

    return errors;
  }

  /**
   * Validate equipment category update
   */
  validateEquipmentCategoryUpdate(categoryData: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (categoryData.name !== undefined && categoryData.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Category name cannot be empty' });
    }

    if (categoryData.name && categoryData.name.length > 100) {
      errors.push({ field: 'name', message: 'Category name must be less than 100 characters' });
    }

    if (categoryData.description !== undefined && categoryData.description.length > 500) {
      errors.push({ field: 'description', message: 'Description must be less than 500 characters' });
    }

    return errors;
  }

  /**
   * Validate equipment creation
   */
  validateEquipment(equipmentData: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!equipmentData.name || equipmentData.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Equipment name is required' });
    }

    if (equipmentData.name && equipmentData.name.length > 150) {
      errors.push({ field: 'name', message: 'Equipment name must be less than 150 characters' });
    }

    if (!equipmentData.category_id || isNaN(equipmentData.category_id) || equipmentData.category_id <= 0) {
      errors.push({ field: 'category_id', message: 'Valid category ID is required' });
    }

    if (!equipmentData.daily_rate || isNaN(equipmentData.daily_rate) || equipmentData.daily_rate <= 0) {
      errors.push({ field: 'daily_rate', message: 'Valid daily rate is required' });
    }

    if (!equipmentData.weekly_rate || isNaN(equipmentData.weekly_rate) || equipmentData.weekly_rate <= 0) {
      errors.push({ field: 'weekly_rate', message: 'Valid weekly rate is required' });
    }

    if (equipmentData.monthly_rate !== undefined && (isNaN(equipmentData.monthly_rate) || equipmentData.monthly_rate <= 0)) {
      errors.push({ field: 'monthly_rate', message: 'Monthly rate must be a positive number' });
    }

    if (!equipmentData.contact_number || !this.isValidPhoneNumber(equipmentData.contact_number)) {
      errors.push({ field: 'contact_number', message: 'Valid contact number is required' });
    }

    if (equipmentData.delivery_fee !== undefined && (isNaN(equipmentData.delivery_fee) || equipmentData.delivery_fee < 0)) {
      errors.push({ field: 'delivery_fee', message: 'Delivery fee must be a non-negative number' });
    }

    if (equipmentData.security_deposit !== undefined && (isNaN(equipmentData.security_deposit) || equipmentData.security_deposit < 0)) {
      errors.push({ field: 'security_deposit', message: 'Security deposit must be a non-negative number' });
    }

    if (equipmentData.description && equipmentData.description.length > 1000) {
      errors.push({ field: 'description', message: 'Description must be less than 1000 characters' });
    }

    if (equipmentData.maintenance_notes && equipmentData.maintenance_notes.length > 1000) {
      errors.push({ field: 'maintenance_notes', message: 'Maintenance notes must be less than 1000 characters' });
    }

    return errors;
  }

  /**
   * Validate equipment update
   */
  validateEquipmentUpdate(equipmentData: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (equipmentData.name !== undefined && equipmentData.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Equipment name cannot be empty' });
    }

    if (equipmentData.name && equipmentData.name.length > 150) {
      errors.push({ field: 'name', message: 'Equipment name must be less than 150 characters' });
    }

    if (equipmentData.category_id !== undefined && (isNaN(equipmentData.category_id) || equipmentData.category_id <= 0)) {
      errors.push({ field: 'category_id', message: 'Valid category ID is required' });
    }

    if (equipmentData.daily_rate !== undefined && (isNaN(equipmentData.daily_rate) || equipmentData.daily_rate <= 0)) {
      errors.push({ field: 'daily_rate', message: 'Daily rate must be a positive number' });
    }

    if (equipmentData.weekly_rate !== undefined && (isNaN(equipmentData.weekly_rate) || equipmentData.weekly_rate <= 0)) {
      errors.push({ field: 'weekly_rate', message: 'Weekly rate must be a positive number' });
    }

    if (equipmentData.monthly_rate !== undefined && (isNaN(equipmentData.monthly_rate) || equipmentData.monthly_rate <= 0)) {
      errors.push({ field: 'monthly_rate', message: 'Monthly rate must be a positive number' });
    }

    if (equipmentData.contact_number !== undefined && !this.isValidPhoneNumber(equipmentData.contact_number)) {
      errors.push({ field: 'contact_number', message: 'Valid contact number is required' });
    }

    if (equipmentData.delivery_fee !== undefined && (isNaN(equipmentData.delivery_fee) || equipmentData.delivery_fee < 0)) {
      errors.push({ field: 'delivery_fee', message: 'Delivery fee must be a non-negative number' });
    }

    if (equipmentData.security_deposit !== undefined && (isNaN(equipmentData.security_deposit) || equipmentData.security_deposit < 0)) {
      errors.push({ field: 'security_deposit', message: 'Security deposit must be a non-negative number' });
    }

    if (equipmentData.description !== undefined && equipmentData.description.length > 1000) {
      errors.push({ field: 'description', message: 'Description must be less than 1000 characters' });
    }

    if (equipmentData.maintenance_notes !== undefined && equipmentData.maintenance_notes.length > 1000) {
      errors.push({ field: 'maintenance_notes', message: 'Maintenance notes must be less than 1000 characters' });
    }

    return errors;
  }

  /**
   * Validate equipment rental request creation
   */
  validateEquipmentRentalRequest(requestData: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!requestData.equipment_id || isNaN(requestData.equipment_id) || requestData.equipment_id <= 0) {
      errors.push({ field: 'equipment_id', message: 'Valid equipment ID is required' });
    }

    if (!requestData.start_date || !this.isValidDate(requestData.start_date)) {
      errors.push({ field: 'start_date', message: 'Valid start date is required' });
    }

    if (!requestData.end_date || !this.isValidDate(requestData.end_date)) {
      errors.push({ field: 'end_date', message: 'Valid end date is required' });
    }

    if (requestData.start_date && requestData.end_date) {
      const startDate = new Date(requestData.start_date);
      const endDate = new Date(requestData.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        errors.push({ field: 'start_date', message: 'Start date cannot be in the past' });
      }

      if (endDate <= startDate) {
        errors.push({ field: 'end_date', message: 'End date must be after start date' });
      }
    }

    if (!requestData.receiver_name || requestData.receiver_name.trim().length === 0) {
      errors.push({ field: 'receiver_name', message: 'Receiver name is required' });
    }

    if (requestData.receiver_name && requestData.receiver_name.length > 100) {
      errors.push({ field: 'receiver_name', message: 'Receiver name must be less than 100 characters' });
    }

    if (!requestData.receiver_phone || !this.isValidPhoneNumber(requestData.receiver_phone)) {
      errors.push({ field: 'receiver_phone', message: 'Valid receiver phone number is required' });
    }

    if (!requestData.delivery_address || requestData.delivery_address.trim().length === 0) {
      errors.push({ field: 'delivery_address', message: 'Delivery address is required' });
    }

    if (requestData.delivery_address && requestData.delivery_address.length > 500) {
      errors.push({ field: 'delivery_address', message: 'Delivery address must be less than 500 characters' });
    }

    if (requestData.delivery_latitude !== undefined && (isNaN(requestData.delivery_latitude) || requestData.delivery_latitude < -90 || requestData.delivery_latitude > 90)) {
      errors.push({ field: 'delivery_latitude', message: 'Latitude must be between -90 and 90' });
    }

    if (requestData.delivery_longitude !== undefined && (isNaN(requestData.delivery_longitude) || requestData.delivery_longitude < -180 || requestData.delivery_longitude > 180)) {
      errors.push({ field: 'delivery_longitude', message: 'Longitude must be between -180 and 180' });
    }

    if (requestData.additional_notes && requestData.additional_notes.length > 500) {
      errors.push({ field: 'additional_notes', message: 'Additional notes must be less than 500 characters' });
    }

    return errors;
  }

  /**
   * Validate equipment availability
   */
  validateEquipmentAvailability(availabilityData: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!availabilityData.equipment_id || isNaN(availabilityData.equipment_id) || availabilityData.equipment_id <= 0) {
      errors.push({ field: 'equipment_id', message: 'Valid equipment ID is required' });
    }

    if (!availabilityData.date || !this.isValidDate(availabilityData.date)) {
      errors.push({ field: 'date', message: 'Valid date is required' });
    }

    if (availabilityData.reason && availabilityData.reason.length > 255) {
      errors.push({ field: 'reason', message: 'Reason must be less than 255 characters' });
    }

    return errors;
  }

  /**
   * Validate warehouse creation
   */
  validateWarehouse(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Warehouse name is required');
    }

    if (!data.contact_person_name || data.contact_person_name.trim().length === 0) {
      errors.push('Contact person name is required');
    }

    if (!data.contact_person_number || data.contact_person_number.trim().length === 0) {
      errors.push('Contact person number is required');
    }

    if (!data.fixed_space_amount || data.fixed_space_amount <= 0) {
      errors.push('Fixed space amount is required and must be greater than 0');
    }

    if (!data.category_id || data.category_id <= 0) {
      errors.push('Category ID is required');
    }

    if (!data.address || data.address.trim().length === 0) {
      errors.push('Address is required');
    }

    if (!data.province_id || data.province_id <= 0) {
      errors.push('Province ID is required');
    }

    if (!data.district_id || data.district_id <= 0) {
      errors.push('District ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate warehouse update
   */
  validateWarehouseUpdate(data: any): ValidationResult {
    const errors: string[] = [];

    if (data.name !== undefined && (!data.name || data.name.trim().length === 0)) {
      errors.push('Warehouse name cannot be empty');
    }

    if (data.contact_person_name !== undefined && (!data.contact_person_name || data.contact_person_name.trim().length === 0)) {
      errors.push('Contact person name cannot be empty');
    }

    if (data.contact_person_number !== undefined && (!data.contact_person_number || data.contact_person_number.trim().length === 0)) {
      errors.push('Contact person number cannot be empty');
    }

    if (data.fixed_space_amount !== undefined && data.fixed_space_amount <= 0) {
      errors.push('Fixed space amount must be greater than 0');
    }

    if (data.warehouse_status !== undefined && !['open', 'closed'].includes(data.warehouse_status)) {
      errors.push('Invalid warehouse status');
    }

    if (data.security_level !== undefined && !['high', 'medium', 'low'].includes(data.security_level)) {
      errors.push('Invalid security level');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate warehouse inventory
   */
  validateWarehouseInventory(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.item_name || data.item_name.trim().length === 0) {
      errors.push('Item name is required');
    }

    if (!data.quantity || data.quantity <= 0) {
      errors.push('Quantity is required and must be greater than 0');
    }

    if (!data.stored_date) {
      errors.push('Stored date is required');
    }

    if (data.item_condition !== undefined && !['good', 'moderate', 'poor'].includes(data.item_condition)) {
      errors.push('Invalid item condition');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate warehouse inventory update
   */
  validateWarehouseInventoryUpdate(data: any): ValidationResult {
    const errors: string[] = [];

    if (data.item_name !== undefined && (!data.item_name || data.item_name.trim().length === 0)) {
      errors.push('Item name cannot be empty');
    }

    if (data.quantity !== undefined && data.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (data.item_condition !== undefined && !['good', 'moderate', 'poor'].includes(data.item_condition)) {
      errors.push('Invalid item condition');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate warehouse availability
   */
  validateWarehouseAvailability(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.date) {
      errors.push('Date is required');
    }

    if (data.is_available === undefined) {
      errors.push('Availability status is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate warehouse time slot
   */
  validateWarehouseTimeSlot(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.date) {
      errors.push('Date is required');
    }

    if (!data.start_time) {
      errors.push('Start time is required');
    }

    if (!data.end_time) {
      errors.push('End time is required');
    }

    if (data.max_bookings !== undefined && data.max_bookings <= 0) {
      errors.push('Max bookings must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate warehouse booking
   */
  validateWarehouseBooking(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.warehouse_id || data.warehouse_id <= 0) {
      errors.push('Warehouse ID is required');
    }

    if (!data.time_slot_id || data.time_slot_id <= 0) {
      errors.push('Time slot ID is required');
    }

    if (!data.farmer_name || data.farmer_name.trim().length === 0) {
      errors.push('Farmer name is required');
    }

    if (!data.farmer_mobile || data.farmer_mobile.trim().length === 0) {
      errors.push('Farmer mobile is required');
    }

    if (!data.farmer_contact || data.farmer_contact.trim().length === 0) {
      errors.push('Farmer contact is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate farmer warehouse request
   */
  validateFarmerWarehouseRequest(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.warehouse_id || data.warehouse_id <= 0) {
      errors.push('Warehouse ID is required');
    }

    if (!data.request_type || !['storage', 'retrieval', 'inspection'].includes(data.request_type)) {
      errors.push('Valid request type is required (storage, retrieval, or inspection)');
    }

    if (!data.item_name || data.item_name.trim() === '') {
      errors.push('Item name is required');
    }

    if (!data.quantity || data.quantity <= 0) {
      errors.push('Valid quantity is required');
    }

    if (!data.storage_duration_days || data.storage_duration_days <= 0) {
      errors.push('Storage duration is required');
    }

    if (data.storage_duration_days > 90) {
      errors.push('Storage duration cannot exceed 90 days');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate market price
   */
  validateMarketPrice(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.item_name || data.item_name.trim() === '') {
      errors.push('Item name is required');
    }

    if (!data.current_price || data.current_price <= 0) {
      errors.push('Valid current price is required');
    }

    if (!data.unit || data.unit.trim() === '') {
      errors.push('Unit is required');
    }

    if (!data.price_date) {
      errors.push('Price date is required');
    }

    if (!data.source || data.source.trim() === '') {
      errors.push('Source is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate field officer contact request
   */
  validateFieldOfficerContactRequest(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.field_officer_id || data.field_officer_id <= 0) {
      errors.push('Field officer ID is required');
    }

    if (!data.farmer_name || data.farmer_name.trim() === '') {
      errors.push('Farmer name is required');
    }

    if (!data.farmer_mobile || data.farmer_mobile.trim() === '') {
      errors.push('Farmer mobile number is required');
    }

    if (!data.farmer_address || data.farmer_address.trim() === '') {
      errors.push('Farmer address is required');
    }

    if (!data.current_issues || data.current_issues.trim() === '') {
      errors.push('Current issues description is required');
    }

    if (!data.urgency_level || !['low', 'medium', 'high', 'critical'].includes(data.urgency_level)) {
      errors.push('Valid urgency level is required (low, medium, high, or critical)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new ValidationService();
