

// snack messages
export const SnackMessage = {
  success: {
    // Authentication
    login: "Login successful! Welcome to AgriConnect",
    register: "Registration successful! Welcome to AgriConnect",
    passwordReset: "Password reset successful! Please login with your new password",
    passwordChange: "Password changed successfully",
    otpSent: "OTP sent successfully! Please check your phone",
    otpVerified: "OTP verified successfully",
    
    // Resources
    saveResources: "Resource saved successfully",
    deleteResource: "Resource deleted successfully",
    
    // General
    operationSuccess: "Operation completed successfully",
  },
  error: {
    // Authentication
    login: "Login failed. Please check your credentials",
    register: "Registration failed. Please try again",
    passwordReset: "Password reset failed. Please try again",
    passwordChange: "Password change failed. Please try again",
    otpInvalid: "Invalid OTP. Please try again",
    otpExpired: "OTP has expired. Please request a new one",
    otpSendFailed: "Failed to send OTP. Please try again",
    sessionExpired: "Session expired. Please login again",
    
    // Resources
    fetchResources: "Failed to fetch resources",
    saveResources: "Failed to save resources",
    fetchSingleResource: "Failed to fetch resource",
    updateResource: "Failed to update resource",
    deleteResource: "Failed to delete resource",
    
    // General
    networkError: "Network error. Please check your connection",
    serverError: "Server error. Please try again later",
    validationError: "Please check your input and try again",
  },
  warning: {
    sessionExpiring: "Your session will expire soon",
    unsavedChanges: "You have unsaved changes",
  },
};
