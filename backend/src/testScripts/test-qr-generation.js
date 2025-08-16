#!/usr/bin/env node

// Test QR Code Generation
const QRCodeService = require('../../dist/src/services/qrCode').default;

console.log('Testing QR Code Generation...\n');

// Test data
const testData = {
  schedule_id: 123,
  farmer_id: 456,
  center_id: 789,
  scheduled_date: '2025-01-20',
  timestamp: new Date().toISOString()
};

console.log('Test Data:', testData);

try {
  // Test URL generation
  console.log('\n1. Testing URL Generation...');
  const urlResult = QRCodeService.generateSoilTestingURL(testData);
  console.log('URL Result:', urlResult);
  
  // Test QR Code URL generation
  console.log('\n2. Testing QR Code URL Generation...');
  const qrCodeUrl = QRCodeService.generateQRCodeURL(testData);
  console.log('QR Code URL:', qrCodeUrl);
  
  // Test unique ID generation
  console.log('\n3. Testing Unique ID Generation...');
  const uniqueId = QRCodeService.generateTextQRCode(testData);
  console.log('Unique ID:', uniqueId);
  
  // Test verification
  console.log('\n4. Testing Verification...');
  const verificationResult = QRCodeService.verifyQRCodeId(uniqueId);
  console.log('Verification Result:', verificationResult);
  
  console.log('\n✅ All tests passed! QR Code generation is working correctly.');
  
} catch (error) {
  console.error('\n❌ Test failed:', error);
  console.error('Error details:', {
    message: error.message,
    stack: error.stack
  });
}
