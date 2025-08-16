// Central API base (already includes /api/v1)
export const ServiceBaseUrl = 'http://206.189.89.116:3000/api/v1';
export const APPLICATION_ADMIN = 'admin.agriConnect';
export const APPLICATION_FARMER = 'farmer.agriConnect';

export const AppConfig = {
  serviceUrls: {
  authentication: `${ServiceBaseUrl}/auth`,
  otp: `${ServiceBaseUrl}/otp`,
  },
  apiEndpoints: {
    register: `${ServiceBaseUrl}/auth/register`,
    login: `${ServiceBaseUrl}/auth/login`,
    googleAuth: `${ServiceBaseUrl}/auth/google-auth`,
    googleSignup: `${ServiceBaseUrl}/auth/google-signup`,
    forgotPassword: `${ServiceBaseUrl}/auth/forgot-password`,
    resetPassword: `${ServiceBaseUrl}/auth/reset-password`,
    changePassword: `${ServiceBaseUrl}/auth/change-password`,
    profile: `${ServiceBaseUrl}/auth/profile`,
    verifyToken: `${ServiceBaseUrl}/auth/verify-token`,
    updateProfile: `${ServiceBaseUrl}/auth/update-profile`,
    uploadProfilePicture: `${ServiceBaseUrl}/auth/upload-profile-picture`,
    locations: `${ServiceBaseUrl}/auth/locations`,

    // Harvest Hub endpoints
    warehouses: `${ServiceBaseUrl}/warehouse`,
    farmerWarehouseRequests: `${ServiceBaseUrl}/farmer-warehouse/requests`,
    marketPrices: `${ServiceBaseUrl}/farmer-warehouse/market-prices`,

    fieldVisitors: `${ServiceBaseUrl}/soil-testing-scheduling/field-visitors`,
    contactRequest: `${ServiceBaseUrl}/soil-testing-scheduling/contact-requests`,

  },
};
