// Application role constants
export const APPLICATION_ADMIN = 'admin.agriConnect';
export const APPLICATION_FARMER = 'farmer.agriConnect';
export const APPLICATION_FIELD_OFFICER = 'field_officer.agriConnect';

// Database role mappings
export const DB_ROLE_ADMIN = 'admin';
export const DB_ROLE_FARMER = 'farmer';
export const DB_ROLE_FIELD_OFFICER = 'field_officer';

// Role mapping from database to application
export const ROLE_MAPPING = {
  [DB_ROLE_ADMIN]: APPLICATION_ADMIN,
  [DB_ROLE_FARMER]: APPLICATION_FARMER,
  [DB_ROLE_FIELD_OFFICER]: APPLICATION_FIELD_OFFICER,
};

// Mobile app supported roles (only farmers)
export const MOBILE_APP_SUPPORTED_ROLES = [APPLICATION_FARMER];

// Web app supported roles
export const WEB_APP_SUPPORTED_ROLES = [APPLICATION_ADMIN, APPLICATION_FARMER, APPLICATION_FIELD_OFFICER];
