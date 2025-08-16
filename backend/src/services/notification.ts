import axios from 'axios';
import nodemailer from 'nodemailer';
import { SMSData, EmailData, NotificationServiceInterface } from '../types';

class NotificationService implements NotificationServiceInterface {
  /**
   * Send SMS using Notify.lk
   */
  async sendSMS(data: SMSData): Promise<boolean> {
    try {
      const apiKey = process.env.NOTIFY_LK_API_KEY;
      const senderId = process.env.NOTIFY_LK_SENDER_ID;
      const userId = process.env.NOTIFY_LK_USER_ID;
      
      if (!apiKey || !senderId || !userId) {
        console.error('Notify.lk configuration missing - API_KEY, SENDER_ID, or USER_ID not set');
        return false;
      }

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(data.recipient);

      // Build query parameters for Notify.lk API
      const queryParams = new URLSearchParams({
        user_id: userId,
        api_key: apiKey,
        sender_id: senderId,
        to: formattedPhone,
        message: data.message
      });

      const url = `https://app.notify.lk/api/v1/send?${queryParams.toString()}`;

      console.log('Sending SMS to Notify.lk with params:', {
        user_id: userId,
        api_key: apiKey,
        sender_id: senderId,
        to: formattedPhone,
        message: data.message
      });
      console.log('Full URL:', url);

      const response = await axios.get(url);

      if (response.data.status === 'success') {
        console.log(`SMS sent successfully to ${formattedPhone}`);
        return true;
      } else {
        console.error('SMS sending failed:', response.data.message || response.data);
        return false;
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      return false;
    }
  }

  /**
   * Send email using SMTP
   */
  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      const smtpHost = process.env.SMTP_HOST;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpPort = parseInt(process.env.SMTP_PORT || '587');
      
      if (!smtpHost || !smtpUser || !smtpPass) {
        console.error('SMTP configuration missing');
        return false;
      }

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      // Send email
      const mailOptions = {
        from: smtpUser,
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${data.to}:`, info.messageId);
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  /**
   * Format phone number for Notify.lk
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleanPhone = phone.replace(/\D/g, '');
    
    // If it's a Sri Lankan number starting with 0, remove the 0 and add 94
    if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
      cleanPhone = `94${cleanPhone.substring(1)}`;
    }
    
    // If it's a Sri Lankan number starting with 7 (9 digits), add country code
    if (cleanPhone.length === 9 && cleanPhone.startsWith('7')) {
      cleanPhone = `94${cleanPhone}`;
    }
    
    // If it's already 12 digits with country code, return as is
    if (cleanPhone.length === 12 && cleanPhone.startsWith('94')) {
      return cleanPhone;
    }
    
    // If it's 11 digits and starts with 94, return as is
    if (cleanPhone.length === 11 && cleanPhone.startsWith('94')) {
      return cleanPhone;
    }
    
    // For any other format, just return the cleaned number
    return cleanPhone;
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSMS(recipients: string[], message: string): Promise<boolean[]> {
    const results: boolean[] = [];
    
    for (const recipient of recipients) {
      const result = await this.sendSMS({ recipient, message });
      results.push(result);
      
      // Add delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  /**
   * Send bulk email
   */
  async sendBulkEmail(recipients: string[], subject: string, text?: string, html?: string): Promise<boolean[]> {
    const results: boolean[] = [];
    
    for (const recipient of recipients) {
      const result = await this.sendEmail({ to: recipient, subject, text, html });
      results.push(result);
      
      // Add delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  /**
   * Test SMS configuration
   */
  async testSMSConfiguration(): Promise<boolean> {
    const testPhone = process.env.TEST_PHONE;
    if (!testPhone) {
      console.error('TEST_PHONE environment variable not set');
      return false;
    }

    return await this.sendSMS({
      recipient: testPhone,
      message: 'Test SMS from AgriConnect - Notify.lk integration working!'
    });
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(): Promise<boolean> {
    const testEmail = process.env.TEST_EMAIL;
    if (!testEmail) {
      console.error('TEST_EMAIL environment variable not set');
      return false;
    }

    return await this.sendEmail({
      to: testEmail,
      subject: 'Test Email from AgriConnect',
      text: 'This is a test email to verify SMTP configuration.',
      html: '<h1>Test Email</h1><p>This is a test email to verify SMTP configuration.</p>'
    });
  }
}

export default new NotificationService();
