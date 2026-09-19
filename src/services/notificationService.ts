import { supabase, getSupabaseConfig } from '../lib/supabase';
import { SystemNotification } from '../types';
import { mockStore } from './mockStore';
import { isDemoMode } from '../lib/appConfig';

export const notificationService = {
  /**
   * Fetch all notifications for the current authenticated user
   */
  async getUserNotifications(userId: string): Promise<SystemNotification[]> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
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
      if (isDemoMode()) return mockStore.getNotifications(userId);
      throw e;
    }
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      mockStore.markNotificationAsRead(notificationId);
      return;
    }
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
    if (error) throw error;
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      mockStore.markAllNotificationsAsRead(userId);
      return;
    }
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    if (error) throw error;
  },

  /**
   * Subscribe to Supabase Realtime notifications
   */
  subscribeToUserNotifications(
    userId: string,
    onNewNotification: (notification: SystemNotification) => void
  ) {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
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
