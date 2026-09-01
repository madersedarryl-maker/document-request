import { supabase, getSupabaseConfig } from '../lib/supabase';
import { SystemNotification } from '../types';
import { mockStore } from './mockStore';

export const notificationService = {
  /**
   * Fetch all notifications for the current authenticated user
   */
  async getUserNotifications(userId: string): Promise<SystemNotification[]> {
    const config = getSupabaseConfig();
    if (!config.isConfigured) {
      return mockStore.getNotifications(userId);
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      return (data || []) as SystemNotification[];
    } catch (e) {
      return mockStore.getNotifications(userId);
    }
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    mockStore.markNotificationAsRead(notificationId);
    const config = getSupabaseConfig();
    if (config.isConfigured) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId);
      } catch (e) {
        // ignore
      }
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    mockStore.markAllNotificationsAsRead(userId);
    const config = getSupabaseConfig();
    if (config.isConfigured) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', userId)
          .eq('is_read', false);
      } catch (e) {
        // ignore
      }
    }
  },

  /**
   * Subscribe to Supabase Realtime notifications
   */
  subscribeToUserNotifications(
    userId: string,
    onNewNotification: (notification: SystemNotification) => void
  ) {
    const config = getSupabaseConfig();
    if (!config.isConfigured) {
      return () => {};
    }

    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            onNewNotification(payload.new as SystemNotification);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
