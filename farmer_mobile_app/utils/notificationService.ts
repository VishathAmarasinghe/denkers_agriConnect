import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: Date;
  read: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: NotificationData[] = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: trigger || null,
      });

      // Store notification locally
      const notification: NotificationData = {
        id: notificationId,
        title,
        body,
        data,
        timestamp: new Date(),
        read: false,
      };

      this.notifications.unshift(notification);
      await this.saveNotifications();

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Send immediate notification
   */
  async sendNotification(title: string, body: string, data?: any): Promise<string> {
    return this.scheduleNotification(title, body, data);
  }

  /**
   * Send rental status update notification
   */
  async sendRentalStatusNotification(
    equipmentName: string,
    status: string,
    additionalInfo?: string
  ): Promise<string> {
    const title = `Rental Update: ${equipmentName}`;
    let body = `Your rental request for ${equipmentName} has been ${status}.`;
    
    if (additionalInfo) {
      body += ` ${additionalInfo}`;
    }

    return this.sendNotification(title, body, {
      type: 'rental_status',
      equipmentName,
      status,
      additionalInfo,
    });
  }

  /**
   * Send rental approval notification
   */
  async sendRentalApprovalNotification(
    equipmentName: string,
    pickupInstructions?: string
  ): Promise<string> {
    const title = `Rental Approved: ${equipmentName}`;
    let body = `Great news! Your rental request for ${equipmentName} has been approved.`;
    
    if (pickupInstructions) {
      body += ` ${pickupInstructions}`;
    }

    return this.sendNotification(title, body, {
      type: 'rental_approved',
      equipmentName,
      pickupInstructions,
    });
  }

  /**
   * Send rental rejection notification
   */
  async sendRentalRejectionNotification(
    equipmentName: string,
    reason: string
  ): Promise<string> {
    const title = `Rental Update: ${equipmentName}`;
    const body = `Your rental request for ${equipmentName} was not approved. Reason: ${reason}`;

    return this.sendNotification(title, body, {
      type: 'rental_rejected',
      equipmentName,
      reason,
    });
  }

  /**
   * Send pickup reminder notification
   */
  async sendPickupReminderNotification(
    equipmentName: string,
    pickupDate: string
  ): Promise<string> {
    const title = `Pickup Reminder: ${equipmentName}`;
    const body = `Don't forget! Your equipment ${equipmentName} is ready for pickup on ${pickupDate}.`;

    return this.sendNotification(title, body, {
      type: 'pickup_reminder',
      equipmentName,
      pickupDate,
    });
  }

  /**
   * Send return reminder notification
   */
  async sendReturnReminderNotification(
    equipmentName: string,
    returnDate: string
  ): Promise<string> {
    const title = `Return Reminder: ${equipmentName}`;
    const body = `Reminder: Please return ${equipmentName} by ${returnDate}.`;

    return this.sendNotification(title, body, {
      type: 'return_reminder',
      equipmentName,
      returnDate,
    });
  }

  /**
   * Get all stored notifications
   */
  async getNotifications(): Promise<NotificationData[]> {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
      return this.notifications;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        await this.saveNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      this.notifications.forEach(n => n.read = true);
      await this.saveNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  /**
   * Clear all notifications
   */
  async clearNotifications(): Promise<void> {
    try {
      this.notifications = [];
      await this.saveNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const notifications = await this.getNotifications();
    return notifications.filter(n => !n.read).length;
  }

  /**
   * Save notifications to storage
   */
  private async saveNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      
      // Remove from local storage
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      await this.saveNotifications();
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Clear local storage
      this.notifications = [];
      await this.saveNotifications();
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  /**
   * Set up notification listeners
   */
  setupNotificationListeners(): void {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // Handle notification response (user tapped notification)
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      
      // Handle different notification types
      const data = response.notification.request.content.data;
      if (data?.type === 'rental_status') {
        // Navigate to rental requests screen
        // This would need to be implemented with navigation context
      }
    });
  }
}

export default NotificationService.getInstance();
