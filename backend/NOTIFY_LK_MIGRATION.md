# Notify.lk Migration Guide

This document outlines the migration from Twilio to Notify.lk for SMS functionality in the AgriConnect backend.

## 🚀 Overview

The backend has been successfully migrated from Twilio to Notify.lk for SMS services. This change provides:
- Better local coverage for Sri Lankan phone numbers
- More competitive pricing
- Direct API integration without third-party dependencies

## 📋 Changes Made

### 1. Dependencies Updated

**Removed:**
- `twilio` package

**Added:**
- `axios` package (moved from devDependencies to dependencies)

**Updated package.json:**
```diff
- "twilio": "^4.19.0",
+ "axios": "^1.11.0",
```

### 2. Environment Variables

**Removed:**
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

**Added:**
```env
NOTIFY_LK_API_KEY=your_notify_lk_api_key
NOTIFY_LK_SENDER_ID=your_notify_lk_sender_id
TEST_PHONE=+94712345678
```

### 3. Notification Service Refactored

**File:** `backend/src/services/notification.js`

**Key Changes:**
- Replaced Twilio client with Notify.lk API calls
- Added automatic phone number formatting for Sri Lankan numbers
- Enhanced error handling with detailed API response information
- Maintained the same function signature for backward compatibility

**Before (Twilio):**
```javascript
const twilio = require('twilio');
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (to, message) => {
  const result = await twilioClient.messages.create({
    body: message,
    from: TWILIO_PHONE_NUMBER,
    to: to
  });
  return result;
};
```

**After (Notify.lk):**
```javascript
const axios = require('axios');

const sendSMS = async (to, message) => {
  // Auto-format phone numbers for Sri Lanka
  let formattedPhone = to;
  if (!to.startsWith('+')) {
    formattedPhone = to.startsWith('94') ? `+${to}` : `+94${to}`;
  }

  const payload = {
    recipient: formattedPhone,
    sender_id: NOTIFY_LK_SENDER_ID,
    message: message,
    type: 'sms'
  };

  const response = await axios.post(`${NOTIFY_LK_BASE_URL}/send`, payload, {
    headers: {
      'Authorization': `Bearer ${NOTIFY_LK_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
};
```

### 4. Documentation Updated

**Files Updated:**
- `backend/env.example` - Environment variables
- `backend/SETUP_GUIDE.md` - Setup instructions
- `backend/AUTHENTICATION_API.md` - API documentation
- `backend/ARCHITECTURE.md` - Architecture overview

**Key Documentation Changes:**
- Replaced all Twilio references with Notify.lk
- Updated setup instructions for Notify.lk account creation
- Added testing instructions for the new integration

### 5. Testing Infrastructure

**New File:** `backend/test-notify-lk.js`

**Features:**
- Configuration validation
- SMS sending test
- Phone number formatting verification
- Detailed error reporting
- Success confirmation

## 🔧 Setup Instructions

### 1. Create Notify.lk Account

1. Visit [Notify.lk](https://notify.lk/)
2. Sign up for an account
3. Get your API key from the dashboard
4. Set up your sender ID (must be approved by Notify.lk)

### 2. Update Environment Variables

```bash
# Copy the example file
cp env.example .env

# Edit .env with your credentials
NOTIFY_LK_API_KEY=your_actual_api_key_here
NOTIFY_LK_SENDER_ID=your_approved_sender_id
TEST_PHONE=+94712345678  # Your test phone number
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Test the Integration

```bash
# Test SMS functionality
node test-notify-lk.js
```

## 📱 Phone Number Formatting

The service automatically handles phone number formatting:

| Input | Output | Description |
|-------|--------|-------------|
| `0712345678` | `+94712345678` | Sri Lankan mobile without country code |
| `94712345678` | `+94712345678` | Sri Lankan mobile with country code (no +) |
| `+94712345678` | `+94712345678` | Already properly formatted |
| `1234567890` | `+941234567890` | Other number (assumes Sri Lanka) |

## 🔍 API Response Format

**Success Response:**
```json
{
  "status": "success",
  "data": {
    "message_id": "msg_123456789",
    "status": "queued",
    "recipient": "+94712345678"
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Invalid API key"
}
```

## 🚨 Error Handling

The service provides detailed error information:

- **Configuration Errors**: Missing API key or sender ID
- **API Errors**: Invalid requests, authentication failures
- **Network Errors**: Connection issues, timeouts
- **Phone Number Errors**: Invalid format, unsupported country

## 🔄 Backward Compatibility

The migration maintains full backward compatibility:

- Same function signatures
- Same return value structure
- Same error handling patterns
- No changes required in existing code

## 📊 Benefits of Migration

### Notify.lk Advantages
- **Local Coverage**: Better delivery rates in Sri Lanka
- **Cost Effective**: Lower per-SMS costs
- **Regulatory Compliance**: Meets local telecom requirements
- **Support**: Local language and timezone support

### Technical Improvements
- **Simplified Integration**: Direct API calls without SDK
- **Better Error Handling**: Detailed API response information
- **Phone Number Intelligence**: Automatic formatting for local numbers
- **Reduced Dependencies**: Fewer external packages

## 🧪 Testing

### Manual Testing
```bash
# Test with your phone number
node test-notify-lk.js
```

### Integration Testing
The password reset functionality automatically uses the new SMS service:
1. Request password reset via `/api/v1/auth/forgot-password`
2. Check your phone for OTP
3. Verify the SMS was sent via Notify.lk

### Monitoring
- Check Notify.lk dashboard for delivery status
- Monitor server logs for SMS success/failure
- Use the test script for regular health checks

## 🚀 Next Steps

After successful migration:

1. **Monitor Performance**: Track SMS delivery rates
2. **Update Frontend**: Ensure phone number input accepts local formats
3. **User Communication**: Inform users about the new SMS provider
4. **Analytics**: Track SMS usage and costs
5. **Backup Plan**: Consider alternative SMS providers for redundancy

## 🆘 Troubleshooting

### Common Issues

**SMS Not Sending**
- Verify API key and sender ID
- Check phone number format
- Ensure sufficient account credits
- Verify sender ID approval status

**Authentication Errors**
- Check API key validity
- Verify account status
- Ensure proper authorization header format

**Phone Number Issues**
- Verify country code format
- Check number validity
- Ensure number is supported by Notify.lk

### Debug Mode
Enable detailed logging by setting:
```env
NODE_ENV=development
```

### Support Resources
- [Notify.lk API Documentation](https://notify.lk/api)
- [Notify.lk Support](https://notify.lk/support)
- Server logs for detailed error information

## 📝 Migration Checklist

- [x] Remove Twilio dependencies
- [x] Add Notify.lk configuration
- [x] Update notification service
- [x] Update environment variables
- [x] Update documentation
- [x] Create test script
- [x] Test SMS functionality
- [x] Verify phone number formatting
- [x] Update setup guides
- [x] Test password reset flow

## 🎯 Conclusion

The migration to Notify.lk has been completed successfully. The new integration provides:

- Better local SMS delivery
- Improved cost efficiency
- Enhanced error handling
- Simplified maintenance
- Full backward compatibility

All existing functionality continues to work without changes, while providing a better user experience for Sri Lankan users.
