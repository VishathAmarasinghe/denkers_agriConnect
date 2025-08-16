import { Request, Response, NextFunction } from 'express';
import { PoolConnection } from 'mysql2/promise';

// User related types
export interface User {
  id?: number;
  username: string;
  email?: string;
  phone: string;
  nic: string;
  password_hash: string;
  role: 'admin' | 'farmer' | 'field_officer';
  first_name: string;
  last_name: string;
  google_oauth_id?: string;
  profile_image_url?: string;
  language?: string;
  location_id?: number;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  location_name?: string;
  location_address?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  reset_otp?: string;
  reset_otp_expiry?: Date;
}

export interface UserCreateData {
  username: string;
  email?: string;
  phone: string;
  nic: string;
  password: string;
  role: 'admin' | 'farmer' | 'field_officer';
  first_name: string;
  last_name: string;
  password_hash?: string;
  google_oauth_id?: string;
  profile_image_url?: string;
  language?: string;
  location_id?: number;
  is_active?: boolean;
}

export interface UserUpdateData {
  username?: string;
  email?: string;
  phone?: string;
  nic?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  reset_otp?: string;
  reset_otp_expiry?: Date;
  google_oauth_id?: string;
  profile_image_url?: string;
  language?: string;
  location_id?: number;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  location_name?: string;
  location_address?: string;
}

// Authentication types
export interface LoginData {
  username?: string;
  email?: string;
  phone?: string;
  nic?: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: Omit<User, 'password_hash'>;
  };
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordData {
  nic: string;
}

export interface ResetPasswordData {
  nic: string;
  otp: string;
  new_password: string;
}

export interface LanguageUpdateData {
  language: 'si' | 'ta' | 'en';
  userId?: number;
  nic?: string;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  profile_image_url?: string;
  language?: 'si' | 'ta' | 'en';
  location_id?: number;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  location_name?: string;
  location_address?: string;
}

// Location related types
export interface GooglePlacesLocation {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport?: {
      northeast: [number, number];
      southwest: [number, number];
    };
  };
}

export interface UserLocation {
  id?: number;
  user_id: number;
  location_type: 'farm' | 'field' | 'warehouse' | 'market' | 'other';
  name: string;
  description?: string;
  place_id: string;
  latitude: number;
  longitude: number;
  address?: string;
  notes?: string;
  is_primary: boolean;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserLocationCreateData {
  user_id: number;
  location_type: 'farm' | 'field' | 'warehouse' | 'market' | 'other';
  name: string;
  description?: string;
  place_id: string;
  latitude: number;
  longitude: number;
  address?: string;
  notes?: string;
  is_primary?: boolean;
}

export interface UserLocationUpdateData {
  name?: string;
  description?: string;
  address?: string;
  notes?: string;
  is_primary?: boolean;
}

export interface LocationHistory {
  id?: number;
  user_id: number;
  location_id?: number;
  action: 'created' | 'updated' | 'deleted';
  old_data?: any;
  new_data?: any;
  changed_at?: Date;
}

export interface UserLocationSummary {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  total_locations: number;
  farm_count: number;
  field_count: number;
  warehouse_count: number;
  market_count: number;
  other_count: number;
}

export interface NearbyLocation {
  location_id: number;
  user_id: number;
  location_name: string;
  location_type: string;
  latitude: number;
  longitude: number;
  address?: string;
  nearby_location_id: number;
  nearby_location_name: string;
  nearby_location_type: string;
  nearby_user_id: number;
  distance_km: number;
}

// JWT payload
export interface JWTPayload {
  userId: number;
  username: string;
  role: string;
  accessRole?: string[];
  iat?: number;
  exp?: number;
}

// Request with user
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Express Request type for compatibility
export interface ExpressRequest extends Request {}

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

// Database types
export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
  acquireTimeoutMillis: number;
  connectTimeout: number;
}

export interface DatabaseConnection {
  connection: PoolConnection;
  release: () => void;
}

// Notification types
export interface SMSData {
  recipient: string;
  message: string;
}

export interface EmailData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// OTP types
export interface OTPData {
  phone: string;
  otp: string;
  expiry: Date;
}

// Location types
export interface Province {
  id: number;
  name: string;
  code: string;
}

export interface District {
  id: number;
  name: string;
  code: string;
  province_id: number;
}

// Equipment types
export interface EquipmentCategory {
  id: number;
  name: string;
  description?: string;
}

export interface Machine {
  id: number;
  name: string;
  description?: string;
  category_id: number;
  daily_rate: number;
  is_available: boolean;
}

// Warehouse types
export interface WarehouseCategory {
  id: number;
  name: string;
  description?: string;
}

export interface Warehouse {
  id?: number;
  name: string;
  contact_person_name: string;
  contact_person_number: string;
  warehouse_status: 'open' | 'closed';
  fixed_space_amount: number;
  temperature_range?: string;
  security_level: 'high' | 'medium' | 'low';
  description?: string;
  category_id: number;
  address: string;
  province_id: number;
  district_id: number;
  is_available: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface WarehouseCreateData {
  name: string;
  contact_person_name: string;
  contact_person_number: string;
  warehouse_status?: 'open' | 'closed';
  fixed_space_amount: number;
  temperature_range?: string;
  security_level?: 'high' | 'medium' | 'low';
  description?: string;
  category_id: number;
  address: string;
  province_id: number;
  district_id: number;
}

export interface WarehouseUpdateData {
  name?: string;
  contact_person_name?: string;
  contact_person_number?: string;
  warehouse_status?: 'open' | 'closed';
  fixed_space_amount?: number;
  temperature_range?: string;
  security_level?: 'high' | 'medium' | 'low';
  description?: string;
  category_id?: number;
  address?: string;
  province_id?: number;
  district_id?: number;
  is_available?: boolean;
}

export interface WarehouseSearchParams {
  name?: string;
  category_id?: number;
  province?: string;
  district?: string;
  warehouse_status?: 'open' | 'closed';
  security_level?: 'high' | 'medium' | 'low';
  is_available?: boolean;
  page?: number;
  limit?: number;
}

// Warehouse Image types
export interface WarehouseImage {
  id: number;
  warehouse_id: number;
  image_url: string;
  image_name?: string;
  image_type?: string;
  image_size?: number;
  is_primary: boolean;
  created_at: Date;
}

export interface WarehouseImageCreate {
  warehouse_id: number;
  image_url: string;
  image_name?: string;
  image_type?: string;
  image_size?: number;
  is_primary?: boolean;
}

// Warehouse Inventory types
export interface WarehouseInventory {
  id: number;
  warehouse_id: number;
  item_name: string;
  quantity: number;
  location?: string;
  stored_date: Date;
  product_owner?: string;
  item_condition: 'good' | 'moderate' | 'poor';
  expiry_date?: Date;
  notes?: string;
  farmer_id?: number;
  farmer_name?: string;
  farmer_phone?: string;
  storage_type?: 'temporary' | 'long_term';
  storage_duration_days?: number;
  current_market_price?: number;
  auto_sell_on_expiry?: boolean;
  expiry_action?: 'auto_sell' | 'notify_farmer' | 'manual_handling';
  last_price_update?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface WarehouseInventoryCreate {
  warehouse_id: number;
  item_name: string;
  quantity: number;
  location?: string;
  stored_date: Date;
  product_owner?: string;
  item_condition?: 'good' | 'moderate' | 'poor';
  expiry_date?: Date;
  notes?: string;
  // New fields for farmer storage
  farmer_id?: number;
  farmer_name?: string;
  farmer_phone?: string;
  storage_type?: 'temporary' | 'long_term';
  storage_duration_days?: number;
  current_market_price?: number;
  auto_sell_on_expiry?: boolean;
  expiry_action?: 'auto_sell' | 'notify_farmer' | 'manual_handling';
}

export interface WarehouseInventoryUpdate {
  item_name?: string;
  quantity?: number;
  location?: string;
  stored_date?: Date;
  product_owner?: string;
  item_condition?: 'good' | 'moderate' | 'poor';
  expiry_date?: Date;
  notes?: string;
  // New fields for farmer storage
  farmer_id?: number;
  farmer_name?: string;
  farmer_phone?: string;
  storage_type?: 'temporary' | 'long_term';
  storage_duration_days?: number;
  current_market_price?: number;
  auto_sell_on_expiry?: boolean;
  expiry_action?: 'auto_sell' | 'notify_farmer' | 'manual_handling';
}

export interface WarehouseInventorySearchParams {
  warehouse_id?: number;
  item_name?: string;
  item_condition?: 'good' | 'moderate' | 'poor';
  product_owner?: string;
  // New search parameters
  farmer_id?: number;
  storage_type?: 'temporary' | 'long_term';
  expiry_status?: 'active' | 'expiring_soon' | 'expired' | 'auto_sold';
  page?: number;
  limit?: number;
}

// New types for farmer warehouse requests
export interface FarmerWarehouseRequest {
  id: number;
  farmer_id: number;
  warehouse_id: number;
  request_type: 'storage' | 'retrieval' | 'inspection';
  item_name: string;
  quantity: number;
  storage_duration_days: number;
  storage_requirements?: string;
  preferred_dates?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
  rejection_reason?: string;
  approved_by?: number;
  approved_at?: Date;
  // QR code fields
  qr_code_url?: string;
  qr_code_data?: string;
  // Additional info fields (populated by joins)
  warehouse_name?: string;
  warehouse_address?: string;
  warehouse_contact_person?: string;
  warehouse_contact_number?: string;
  farmer_username?: string;
  farmer_first_name?: string;
  farmer_last_name?: string;
  farmer_phone?: string;
  admin_username?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FarmerWarehouseRequestCreate {
  farmer_id: number;
  warehouse_id: number;
  request_type: 'storage' | 'retrieval' | 'inspection';
  item_name: string;
  quantity: number;
  storage_duration_days: number;
  storage_requirements?: string;
  preferred_dates?: string;
}

export interface FarmerWarehouseRequestUpdate {
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
  rejection_reason?: string;
  approved_by?: number;
  approved_at?: Date;
  // QR code fields
  qr_code_url?: string;
  qr_code_data?: string;
}

export interface FarmerWarehouseRequestSearchParams {
  farmer_id?: number;
  warehouse_id?: number;
  request_type?: 'storage' | 'retrieval' | 'inspection';
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  start_date?: Date;
  end_date?: Date;
  page?: number;
  limit?: number;
}

// New types for market items
export interface MarketItem {
  id: number;
  name: string;
  description?: string;
  category?: string;
  unit: string;
  image_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MarketItemCreate {
  name: string;
  description?: string;
  category?: string;
  unit?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface MarketItemUpdate {
  name?: string;
  description?: string;
  category?: string;
  unit?: string;
  image_url?: string;
  is_active?: boolean;
}

// New types for market prices
export interface MarketPrice {
  id: number;
  market_item_id: number;
  current_price: number;
  price_date: Date;
  source: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  // Joined fields for display
  item_name?: string;
  item_description?: string;
  item_category?: string;
  item_unit?: string;
}

export interface MarketPriceCreate {
  market_item_id: number;
  current_price: number;
  price_date: Date;
  source: string;
  notes?: string;
}

export interface MarketPriceUpdate {
  current_price?: number;
  price_date?: Date;
  source?: string;
  notes?: string;
}

// New types for expiry notifications
export interface ExpiryNotification {
  id: number;
  inventory_id: number;
  farmer_id: number;
  notification_type: 'expiring_soon' | 'expired' | 'auto_sold';
  message: string;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ExpiryNotificationCreate {
  inventory_id: number;
  farmer_id: number;
  notification_type: 'expiring_soon' | 'expired' | 'auto_sold';
  message: string;
}

// Warehouse Availability types
export interface WarehouseAvailability {
  id: number;
  warehouse_id: number;
  date: Date;
  is_available: boolean;
  reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface WarehouseAvailabilityCreate {
  warehouse_id: number;
  date: Date;
  is_available: boolean;
  reason?: string;
}

export interface WarehouseAvailabilityUpdate {
  is_available?: boolean;
  reason?: string;
}

export interface WarehouseAvailabilitySearchParams {
  warehouse_id: number;
  start_date: Date;
  end_date: Date;
}

// Warehouse Time Slot types
export interface WarehouseTimeSlot {
  id: number;
  warehouse_id: number;
  date: Date;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_bookings: number;
  current_bookings: number;
  created_at: Date;
  updated_at: Date;
}

export interface WarehouseTimeSlotCreate {
  warehouse_id: number;
  date: Date;
  start_time: string;
  end_time: string;
  max_bookings?: number;
}

export interface WarehouseTimeSlotUpdate {
  start_time?: string;
  end_time?: string;
  is_available?: boolean;
  max_bookings?: number;
}

export interface WarehouseTimeSlotSearchParams {
  warehouse_id: number;
  date: Date;
  is_available?: boolean;
}

// Warehouse Booking types
export interface WarehouseBooking {
  id: number;
  farmer_id: number;
  warehouse_id: number;
  time_slot_id: number;
  farmer_name: string;
  farmer_mobile: string;
  farmer_contact: string;
  storage_requirements?: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected' | 'overdue';
  admin_notes?: string;
  rejection_reason?: string;
  qr_code_url?: string;
  qr_code_data?: string;
  approved_by?: number;
  approved_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface WarehouseBookingCreate {
  farmer_id: number;
  warehouse_id: number;
  time_slot_id: number;
  farmer_name: string;
  farmer_mobile: string;
  farmer_contact: string;
  storage_requirements?: string;
}

export interface WarehouseBookingUpdate {
  status?: 'pending' | 'approved' | 'completed' | 'rejected' | 'overdue';
  admin_notes?: string;
  rejection_reason?: string;
  qr_code_url?: string;
  qr_code_data?: string;
  approved_by?: number;
  approved_at?: Date;
  completed_at?: Date;
}

export interface WarehouseBookingSearchParams {
  farmer_id?: number;
  warehouse_id?: number;
  status?: 'pending' | 'approved' | 'completed' | 'rejected' | 'overdue';
  start_date?: Date;
  end_date?: Date;
  page?: number;
  limit?: number;
}

// Warehouse Available Dates Response
export interface WarehouseAvailableDatesResponse {
  warehouse_id: number;
  warehouse_name: string;
  available_dates: Date[];
  unavailable_dates: Date[];
}

// Warehouse Available Time Slots Response
export interface WarehouseAvailableTimeSlotsResponse {
  warehouse_id: number;
  date: Date;
  available_time_slots: WarehouseTimeSlot[];
}

// Field Officer types
export interface FieldOfficer {
  id: number;
  name: string;
  designation: string;
  description?: string;
  center?: string;
  phone_no?: string;
  specialization?: string;
  assigned_province_id?: number;
  assigned_district_id?: number;
  profile_image_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface FieldOfficerCreate {
  name: string;
  designation: string;
  description?: string;
  center?: string;
  phone_no?: string;
  specialization?: string;
  assigned_province_id?: number;
  assigned_district_id?: number;
  profile_image_url?: string;
}

export interface FieldOfficerUpdate {
  name?: string;
  designation?: string;
  description?: string;
  center?: string;
  phone_no?: string;
  specialization?: string;
  assigned_province_id?: number;
  assigned_district_id?: number;
  profile_image_url?: string;
  is_active?: boolean;
}

export interface FieldOfficerSearchParams {
  name?: string;
  designation?: string;
  center?: string;
  specialization?: string;
  assigned_province_id?: number;
  assigned_district_id?: number;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

// Field Officer Contact Request types
export interface FieldOfficerContactRequest {
  id: number;
  farmer_id: number;
  field_officer_id: number;
  farmer_name: string;
  farmer_mobile: string;
  farmer_address: string;
  current_issues: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  admin_notes?: string;
  rejection_reason?: string;
  assigned_by?: number;
  assigned_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface FieldOfficerContactRequestCreate {
  farmer_id: number;
  field_officer_id: number;
  farmer_name: string;
  farmer_mobile: string;
  farmer_address: string;
  current_issues: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface FieldOfficerContactRequestUpdate {
  status?: 'pending' | 'in_progress' | 'completed' | 'rejected';
  admin_notes?: string;
  rejection_reason?: string;
  assigned_by?: number;
  assigned_at?: Date;
  completed_at?: Date;
}

export interface FieldOfficerContactRequestSearchParams {
  farmer_id?: number;
  field_officer_id?: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'rejected';
  urgency_level?: 'low' | 'medium' | 'high' | 'critical';
  start_date?: Date;
  end_date?: Date;
  page?: number;
  limit?: number;
}

// Soil Collection Center types
export interface SoilCollectionCenter {
  id?: number;
  name: string;
  location_id: number;
  address: string;
  contact_number: string;
  contact_person?: string;
  description?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  operating_hours?: string;
  services_offered?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface SoilCollectionCenterCreateData {
  name: string;
  location_id: number;
  address: string;
  contact_number: string;
  contact_person?: string;
  description?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  operating_hours?: string;
  services_offered?: string;
}

export interface SoilCollectionCenterUpdateData {
  name?: string;
  location_id?: number;
  address?: string;
  contact_number?: string;
  contact_person?: string;
  description?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  operating_hours?: string;
  services_offered?: string;
  is_active?: boolean;
}

export interface SoilCollectionCenterSearchParams {
  name?: string;
  location_id?: number;
  province?: string;
  district?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Market Rate types
export interface MarketRate {
  id: number;
  crop_name: string;
  price_per_kg: number;
  province_id: number;
  district_id: number;
  date: Date;
  source: string;
}

// Middleware types
export type MiddlewareFunction = (req: Request, res: Response, next: NextFunction) => void;
export type AsyncMiddlewareFunction = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Service types
export interface AuthServiceInterface {
  registerUser(userData: UserCreateData): Promise<AuthResponse>;
  loginUser(loginData: LoginData): Promise<AuthResponse>;
  changePassword(userId: number, passwordData: PasswordChangeData): Promise<ApiResponse>;
  forgotPassword(nic: string): Promise<ApiResponse>;
  resetPassword(resetData: ResetPasswordData): Promise<ApiResponse>;
  updateLanguage(languageData: LanguageUpdateData): Promise<ApiResponse>;
  authenticateWithGoogle(googleData: { idToken: string; accessToken: string; user: any }): Promise<AuthResponse>;
  signupWithGoogle(googleData: { idToken: string; accessToken: string; user: any }): Promise<AuthResponse>;
  generateToken(user: User): string;
  verifyToken(token: string): JWTPayload | null;
  updateProfile(userId: number, updateData: ProfileUpdateData): Promise<ApiResponse>;
  
  // Location management methods
  addUserLocation(locationData: UserLocationCreateData): Promise<ApiResponse>;
  updateUserLocation(locationId: number, updateData: UserLocationUpdateData): Promise<ApiResponse>;
  deleteUserLocation(locationId: number): Promise<ApiResponse>;
  getUserLocations(userId: number): Promise<ApiResponse>;
  getUserLocationSummary(userId: number): Promise<ApiResponse>;
  getNearbyLocations(latitude: number, longitude: number, radiusKm?: number): Promise<ApiResponse>;
}

export interface UserServiceInterface {
  findById(id: number): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  createUser(userData: UserCreateData): Promise<User>;
  updateUser(id: number, updateData: UserUpdateData): Promise<boolean>;
  deleteUser(id: number): Promise<boolean>;
}

export interface NotificationServiceInterface {
  sendSMS(data: SMSData): Promise<boolean>;
  sendEmail(data: EmailData): Promise<boolean>;
}

export interface OTPServiceInterface {
  generateOTP(phone: string): string;
  storeOTP(phone: string, otp: string): void;
  verifyOTP(phone: string, otp: string): boolean;
  clearOTP(phone: string): void;
}

export interface ValidationServiceInterface {
  validateUserRegistration(data: UserCreateData): ValidationError[];
  validateLogin(data: LoginData): ValidationError[];
  validatePasswordChange(data: PasswordChangeData): ValidationError[];
  validateForgotPassword(data: ForgotPasswordData): ValidationError[];
  validateResetPassword(data: ResetPasswordData): ValidationError[];
  validateLanguageUpdate(data: LanguageUpdateData): ValidationError[];
  validateProfileUpdate(data: ProfileUpdateData): ValidationError[];
  validateGoogleSignup(data: { idToken: string; accessToken: string; user: any }): ValidationError[];
  validateSoilCollectionCenter(data: SoilCollectionCenterCreateData): ValidationError[];
  validateSoilCollectionCenterUpdate(data: SoilCollectionCenterUpdateData): ValidationError[];
}

export interface SoilCollectionCenterServiceInterface {
  createCenter(data: SoilCollectionCenterCreateData): Promise<ApiResponse>;
  updateCenter(id: number, data: SoilCollectionCenterUpdateData): Promise<ApiResponse>;
  deleteCenter(id: number): Promise<ApiResponse>;
  getCenter(id: number): Promise<ApiResponse>;
  searchCenters(params: SoilCollectionCenterSearchParams): Promise<ApiResponse>;
  getAllCenters(page?: number, limit?: number): Promise<ApiResponse>;
}

export interface ResponseServiceInterface {
  success<T>(res: Response, data: T, message?: string, statusCode?: number): void;
  error(res: Response, message: string, statusCode?: number, errors?: string[]): void;
  validationError(res: Response, errors: ValidationError[]): void;
  paginated<T>(res: Response, data: T[], pagination: any, message?: string): void;
  rateLimitError(res: Response): void;
  asyncHandler(fn: AsyncMiddlewareFunction): MiddlewareFunction;
  notFoundHandler(req: Request, res: Response): void;
  errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void;
}

// Soil Testing Scheduling Types
export interface SoilTestingRequest {
  id?: number;
  farmer_id: number;
  soil_collection_center_id: number;
  preferred_date: string;
  preferred_time_slot?: string;
  farmer_phone: string;
  farmer_location_address?: string;
  farmer_latitude?: number;
  farmer_longitude?: number;
  additional_notes?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  admin_notes?: string;
  rejection_reason?: string;
  approved_date?: string;
  approved_start_time?: string;
  approved_end_time?: string;
  field_officer_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SoilTestingRequestCreate {
  soil_collection_center_id: number;
  preferred_date: string;
  preferred_time_slot?: string;
  farmer_phone: string;
  farmer_location_address?: string;
  farmer_latitude?: number;
  farmer_longitude?: number;
  additional_notes?: string;
}

export interface SoilTestingRequestUpdate {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  admin_notes?: string;
  rejection_reason?: string;
  approved_date?: string;
  approved_start_time?: string;
  approved_end_time?: string;
  field_officer_id?: number;
}

export interface SoilTestingRequestSearchParams {
  farmer_id?: number;
  soil_collection_center_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface SoilTestingTimeSlot {
  id?: number;
  soil_collection_center_id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_bookings: number;
  current_bookings: number;
  created_at?: string;
  updated_at?: string;
}

export interface SoilTestingTimeSlotCreate {
  soil_collection_center_id: number;
  date: string;
  start_time: string;
  end_time: string;
  max_bookings?: number;
}

export interface SoilTestingTimeSlotUpdate {
  is_available?: boolean;
  max_bookings?: number;
  current_bookings?: number;
}

export interface SoilTestingTimeSlotSearchParams {
  soil_collection_center_id?: number;
  date?: string;
  date_from?: string;
  date_to?: string;
  is_available?: boolean;
  page?: number;
  limit?: number;
}



export interface SoilTestingSchedule {
  id?: number;
  farmer_id: number;
  soil_collection_center_id: number;
  scheduled_date: string;
  start_time?: string;
  end_time?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  farmer_phone: string;
  farmer_location_address?: string;
  farmer_latitude?: number;
  farmer_longitude?: number;
  admin_notes?: string;
  rejection_reason?: string;
  field_officer_id?: number;
  qr_code_url?: string;
  qr_code_data?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SoilTestingScheduleCreate {
  soil_collection_center_id: number;
  scheduled_date: string;
  start_time?: string;
  end_time?: string;
  farmer_phone: string;
  farmer_location_address?: string;
  farmer_latitude?: number;
  farmer_longitude?: number;
  field_officer_id?: number;
}

export interface SoilTestingScheduleUpdate {
  status?: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  start_time?: string;
  end_time?: string;
  admin_notes?: string;
  rejection_reason?: string;
  field_officer_id?: number;
  completed_at?: string;
}

export interface SoilTestingScheduleSearchParams {
  farmer_id?: number;
  soil_collection_center_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  field_officer_id?: number;
  page?: number;
  limit?: number;
}

export interface AvailableTimeSlotsResponse {
  date: string;
  time_slots: Array<{
    start_time: string;
    end_time: string;
    is_available: boolean;
    available_bookings: number;
    max_bookings: number;
  }>;
}

export interface QRCodeData {
  schedule_id: number;
  farmer_id: number;
  center_id: number;
  scheduled_date: string;
  timestamp: string;
}

export interface EnhancedQRCodeData extends QRCodeData {
  uniqueId: string;
  verificationUrl: string;
}

// ==================== SOIL TESTING REPORTS ====================

export interface SoilTestingReport {
  id: number;
  soil_testing_id: number;
  farmer_id: number;
  soil_collection_center_id: number;
  field_officer_id: number;
  report_file_name: string;
  report_file_path: string;
  report_file_size: number;
  report_file_type: string;
  report_title: string;
  report_summary?: string;
  soil_ph?: number;
  soil_nitrogen?: number;
  soil_phosphorus?: number;
  soil_potassium?: number;
  soil_organic_matter?: number;
  soil_texture?: string;
  recommendations?: string;
  testing_date: string;
  report_date: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  farmer_name?: string;
  center_name?: string;
  field_officer_name?: string;
}

export interface SoilTestingReportCreate {
  soil_testing_id: number;
  farmer_id: number;
  soil_collection_center_id: number;
  field_officer_id: number;
  report_file_name: string;
  report_file_path: string;
  report_file_size: number;
  report_file_type: string;
  report_title: string;
  report_summary?: string;
  soil_ph?: number;
  soil_nitrogen?: number;
  soil_phosphorus?: number;
  soil_potassium?: number;
  soil_organic_matter?: number;
  soil_texture?: string;
  recommendations?: string;
  testing_date: string;
  report_date: string;
  is_public?: boolean;
}

export interface SoilTestingReportUpdate {
  report_title?: string;
  report_summary?: string;
  soil_ph?: number;
  soil_nitrogen?: number;
  soil_phosphorus?: number;
  soil_potassium?: number;
  soil_organic_matter?: number;
  soil_texture?: string;
  recommendations?: string;
  testing_date?: string;
  report_date?: string;
  is_public?: boolean;
}

export interface SoilTestingReportSearchParams {
  page?: number;
  limit?: number;
  farmer_id?: number;
  soil_collection_center_id?: number;
  field_officer_id?: number;
  testing_date_from?: string;
  testing_date_to?: string;
  report_date_from?: string;
  report_date_to?: string;
  is_public?: boolean;
  search?: string;
}

// ==================== EQUIPMENT RENTAL SYSTEM ====================

export interface EquipmentCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EquipmentCategoryCreate {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface EquipmentCategoryUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface EquipmentCategorySearchParams {
  page?: number;
  limit?: number;
  is_active?: boolean;
  search?: string;
}

export interface Equipment {
  id: number;
  name: string;
  category_id: number;
  description?: string;
  daily_rate: number;
  weekly_rate: number;
  monthly_rate?: number;
  contact_number: string;
  delivery_fee: number;
  security_deposit: number;
  equipment_image_url?: string;
  specifications?: any;
  maintenance_notes?: string;
  is_available: boolean;
  is_active: boolean;
  current_status: 'available' | 'rented' | 'maintenance' | 'out_of_service';
  created_at: string;
  updated_at: string;
  // Joined fields
  category_name?: string;
  category_description?: string;
}

export interface EquipmentCreate {
  name: string;
  category_id: number;
  description?: string;
  daily_rate: number;
  weekly_rate: number;
  monthly_rate?: number;
  contact_number: string;
  delivery_fee?: number;
  security_deposit?: number;
  equipment_image_url?: string;
  specifications?: any;
  maintenance_notes?: string;
  is_available?: boolean;
  is_active?: boolean;
  current_status?: 'available' | 'rented' | 'maintenance' | 'out_of_service';
}

export interface EquipmentUpdate {
  name?: string;
  category_id?: number;
  description?: string;
  daily_rate?: number;
  weekly_rate?: number;
  monthly_rate?: number;
  contact_number?: string;
  delivery_fee?: number;
  security_deposit?: number;
  equipment_image_url?: string;
  specifications?: any;
  maintenance_notes?: string;
  is_available?: boolean;
  is_active?: boolean;
  current_status?: 'available' | 'rented' | 'maintenance' | 'out_of_service';
}

export interface EquipmentSearchParams {
  page?: number;
  limit?: number;
  category_id?: number;
  is_available?: boolean;
  is_active?: boolean;
  current_status?: string;
  min_daily_rate?: number;
  max_daily_rate?: number;
  search?: string;
}

export interface EquipmentAvailability {
  id: number;
  equipment_id: number;
  date: string;
  is_available: boolean;
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentAvailabilityCreate {
  equipment_id: number;
  date: string;
  is_available: boolean;
  reason?: string;
}

export interface EquipmentAvailabilityUpdate {
  is_available?: boolean;
  reason?: string;
}

export interface EquipmentAvailabilitySearchParams {
  equipment_id: number;
  date_from: string;
  date_to: string;
}

export interface EquipmentRentalRequest {
  id: number;
  farmer_id: number;
  equipment_id: number;
  start_date: string;
  end_date: string;
  rental_duration: number;
  total_amount: number;
  delivery_fee: number;
  security_deposit: number;
  receiver_name: string;
  receiver_phone: string;
  delivery_address: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  additional_notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'active' | 'completed' | 'returned';
  admin_notes?: string;
  rejection_reason?: string;
  approved_by?: number;
  approved_at?: string;
  pickup_qr_code_url?: string;
  pickup_qr_code_data?: string;
  return_qr_code_url?: string;
  return_qr_code_data?: string;
  pickup_confirmed_at?: string;
  return_confirmed_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  farmer_name?: string;
  equipment_name?: string;
  category_name?: string;
  approved_by_name?: string;
}

export interface EquipmentRentalRequestCreate {
  equipment_id: number;
  start_date: string;
  end_date: string;
  receiver_name: string;
  receiver_phone: string;
  delivery_address: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  additional_notes?: string;
}

export interface EquipmentRentalRequestUpdate {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'active' | 'completed' | 'returned';
  admin_notes?: string;
  rejection_reason?: string;
  approved_by?: number;
  approved_at?: string;
  pickup_qr_code_url?: string;
  pickup_qr_code_data?: string;
  return_qr_code_url?: string;
  return_qr_code_data?: string;
  pickup_confirmed_at?: string;
  return_confirmed_at?: string;
}

export interface EquipmentRentalRequestSearchParams {
  page?: number;
  limit?: number;
  farmer_id?: number;
  equipment_id?: number;
  status?: string;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  search?: string;
}

export interface AvailableEquipmentResponse {
  equipment_id: number;
  equipment_name: string;
  category_name: string;
  daily_rate: number;
  weekly_rate: number;
  monthly_rate?: number;
  delivery_fee: number;
  security_deposit: number;
  available_dates: string[];
  unavailable_dates: string[];
}

export interface EquipmentRentalQRCodeData {
  requestId: number;
  farmerId: number;
  equipmentId: number;
  type: 'pickup' | 'return';
  timestamp: string;
  qrCode: string;
}
