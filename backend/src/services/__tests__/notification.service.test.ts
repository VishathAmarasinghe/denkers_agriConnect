import { SMSData, EmailData } from '../../types';
import NotificationService from '../notification';
import nodemailer from 'nodemailer';
import axios from 'axios';

// Mock nodemailer
jest.mock('nodemailer');
jest.mock('axios');

describe('NotificationService', () => {
  // Store original environment
  const originalEnv = process.env;

  // Mock data
  const mockEmailData: EmailData = {
    to: 'test@example.com',
    subject: 'Test Subject',
    text: 'Test email content',
    html: '<p>Test email content</p>'
  };

  const mockSMSData: SMSData = {
    recipient: '+1234567890',
    message: 'Test SMS message'
  };

  const mockBulkEmailData = {
    recipients: ['user1@example.com', 'user2@example.com'],
    subject: 'Bulk Test Subject',
    text: 'Bulk test email content',
    html: '<p>Bulk test email content</p>'
  };

  const mockBulkSMSData = {
    recipients: ['+1234567890', '+0987654321'],
    message: 'Bulk test SMS message'
  };

  // Mock transporter
  const mockTransporter = {
    sendMail: jest.fn(),
    verify: jest.fn()
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Reset environment for each test
    process.env = {
      ...originalEnv,
      NOTIFY_LK_API_KEY: 'test-api-key',
      NOTIFY_LK_SENDER_ID: 'test-sender',
      NOTIFY_LK_USER_ID: 'test-user',
      SMTP_HOST: 'test-host',
      SMTP_USER: 'test-user',
      SMTP_PASS: 'test-pass',
      TEST_EMAIL: 'test@example.com',
      TEST_PHONE: '+1234567890'
    };

    // Setup nodemailer mock
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    // Setup axios mock
    (axios.get as jest.Mock).mockResolvedValue({
      data: { status: 'success', message: 'SMS sent successfully' }
    });
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
  });

  describe('Email Notifications', () => {
    describe('sendEmail', () => {
      it('should send email successfully', async () => {
        mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

        const result = await NotificationService.sendEmail(mockEmailData);

        expect(result).toBe(true);
        expect(nodemailer.createTransport).toHaveBeenCalledWith({
          host: 'test-host',
          port: 587,
          secure: false,
          auth: {
            user: 'test-user',
            pass: 'test-pass'
          }
        });
        expect(mockTransporter.sendMail).toHaveBeenCalledWith({
          ...mockEmailData,
          from: 'test-user'
        });
      });

      it('should handle email sending errors gracefully', async () => {
        mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

        const result = await NotificationService.sendEmail(mockEmailData);

        expect(result).toBe(false);
      });

      it('should handle missing email configuration', async () => {
        delete process.env.SMTP_HOST;
        delete process.env.SMTP_USER;
        delete process.env.SMTP_PASS;

        const result = await NotificationService.sendEmail(mockEmailData);

        expect(result).toBe(false);
      });

      it('should handle invalid email addresses', async () => {
        const result = await NotificationService.sendEmail({
          ...mockEmailData,
          to: 'invalid-email'
        });

        expect(result).toBe(false);
      });
    });

    describe('sendBulkEmail', () => {
      it('should send bulk emails successfully', async () => {
        mockTransporter.sendMail.mockResolvedValue({ messageId: 'bulk-message-id' });

        const result = await NotificationService.sendBulkEmail(
          mockBulkEmailData.recipients,
          mockBulkEmailData.subject,
          mockBulkEmailData.text,
          mockBulkEmailData.html
        );

        expect(mockTransporter.sendMail).toHaveBeenCalledTimes(mockBulkEmailData.recipients.length);
        expect(result).toHaveLength(mockBulkEmailData.recipients.length);
        expect(result.every(r => r === true)).toBe(true);
      });

      it('should handle partial failures in bulk email sending', async () => {
        mockTransporter.sendMail
          .mockResolvedValueOnce({ messageId: 'success-1' })
          .mockRejectedValueOnce(new Error('Failed to send'));

        const result = await NotificationService.sendBulkEmail(
          mockBulkEmailData.recipients,
          mockBulkEmailData.subject,
          mockBulkEmailData.text,
          mockBulkEmailData.html
        );

        expect(result).toHaveLength(2);
        expect(result[0]).toBe(true);
        expect(result[1]).toBe(false);
      });
    });

    describe('testEmailConfiguration', () => {
      it('should test email configuration successfully', async () => {
        mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

        const result = await NotificationService.testEmailConfiguration();

        expect(result).toBe(true);
        expect(mockTransporter.sendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'test@example.com',
            subject: 'Test Email from AgriConnect',
            from: 'test-user'
          })
        );
      });

      it('should handle missing test email configuration', async () => {
        delete process.env.TEST_EMAIL;

        const result = await NotificationService.testEmailConfiguration();

        expect(result).toBe(false);
      });
    });
  });

  describe('SMS Notifications', () => {
    describe('sendSMS', () => {
      it('should send SMS successfully', async () => {
        const result = await NotificationService.sendSMS(mockSMSData);

        expect(result).toBe(true);
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('test-api-key')
        );
      });

      it('should handle SMS sending errors gracefully', async () => {
        (axios.get as jest.Mock).mockRejectedValue(new Error('SMS provider error'));

        const result = await NotificationService.sendSMS(mockSMSData);

        expect(result).toBe(false);
      });

      it('should handle SMS API failure response', async () => {
        (axios.get as jest.Mock).mockResolvedValue({
          data: { status: 'error', message: 'Failed to send SMS' }
        });

        const result = await NotificationService.sendSMS(mockSMSData);

        expect(result).toBe(false);
      });

      it('should handle missing SMS configuration', async () => {
        delete process.env.NOTIFY_LK_API_KEY;
        delete process.env.NOTIFY_LK_SENDER_ID;
        delete process.env.NOTIFY_LK_USER_ID;

        const result = await NotificationService.sendSMS(mockSMSData);

        expect(result).toBe(false);
      });
    });

    describe('sendBulkSMS', () => {
      it('should send bulk SMS successfully', async () => {
        const result = await NotificationService.sendBulkSMS(
          mockBulkSMSData.recipients,
          mockBulkSMSData.message
        );

        expect(result).toHaveLength(mockBulkSMSData.recipients.length);
        expect(result.every(r => r === true)).toBe(true);
        expect(axios.get).toHaveBeenCalledTimes(mockBulkSMSData.recipients.length);
      });

      it('should handle partial failures in bulk SMS sending', async () => {
        (axios.get as jest.Mock)
          .mockResolvedValueOnce({ data: { status: 'success' } })
          .mockRejectedValueOnce(new Error('Failed to send'));

        const result = await NotificationService.sendBulkSMS(
          mockBulkSMSData.recipients,
          mockBulkSMSData.message
        );

        expect(result).toHaveLength(2);
        expect(result[0]).toBe(true);
        expect(result[1]).toBe(false);
      });
    });

    describe('testSMSConfiguration', () => {
      it('should test SMS configuration successfully', async () => {
        const result = await NotificationService.testSMSConfiguration();

        expect(result).toBe(true);
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('test-api-key')
        );
      });

      it('should handle missing test phone configuration', async () => {
        delete process.env.TEST_PHONE;

        const result = await NotificationService.testSMSConfiguration();

        expect(result).toBe(false);
      });
    });

    describe('phone number formatting', () => {
      const testCases = [
        { input: '0712345678', expected: '94712345678' },
        { input: '712345678', expected: '94712345678' },
        { input: '94712345678', expected: '94712345678' },
        { input: '+94712345678', expected: '94712345678' }
      ];

      testCases.forEach(({ input, expected }) => {
        it(`should format ${input} to ${expected}`, async () => {
          await NotificationService.sendSMS({
            recipient: input,
            message: 'Test message'
          });

          const callArgs = (axios.get as jest.Mock).mock.calls[0][0];
          expect(callArgs).toContain(`to=${expected}`);
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should log notification errors appropriately', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockTransporter.sendMail.mockRejectedValue(new Error('Test error'));

      await NotificationService.sendEmail(mockEmailData);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Email sending error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle network errors in SMS sending', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await NotificationService.sendSMS(mockSMSData);

      expect(result).toBe(false);
    });

    it('should handle malformed API responses', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: null
      });

      const result = await NotificationService.sendSMS(mockSMSData);

      expect(result).toBe(false);
    });
  });
});