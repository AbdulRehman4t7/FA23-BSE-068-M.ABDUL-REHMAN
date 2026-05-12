import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Notification, NotificationType } from '../models/notification.model';
import type { RealtimeChannel } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);
  private channel: RealtimeChannel | null = null;

  constructor(private supabase: SupabaseService) {}

  async loadNotifications(userId: string): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading notifications:', error);
      return;
    }

    this.notifications.set(data || []);
    this.updateUnreadCount();
  }

  subscribeToNotifications(userId: string): void {
    this.channel = this.supabase.client
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          this.notifications.update(notifications => [newNotification, ...notifications]);
          this.updateUnreadCount();
        }
      )
      .subscribe();
  }

  unsubscribeFromNotifications(): void {
    if (this.channel) {
      this.supabase.client.removeChannel(this.channel);
      this.channel = null;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }

    this.notifications.update(notifications =>
      notifications.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    this.updateUnreadCount();
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return;
    }

    this.notifications.update(notifications =>
      notifications.map(n => ({ ...n, is_read: true }))
    );
    this.updateUnreadCount();
  }

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    committeeId?: string
  ): Promise<void> {
    const { error } = await this.supabase.client
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        related_committee_id: committeeId
      });

    if (error) {
      console.error('Error creating notification:', error);
    }
  }

  private updateUnreadCount(): void {
    const count = this.notifications().filter(n => !n.is_read).length;
    this.unreadCount.set(count);
  }

  getNotificationIcon(type: NotificationType): string {
    const icons: { [key: string]: string } = {
      'turn_reminder': 'event',
      'payment_due': 'payment',
      'new_committee': 'group_add',
      'payment_confirmed': 'check_circle',
      'member_added': 'person_add',
      'join_request': 'mail',
      'committee_active': 'celebration'
    };
    return icons[type] || 'notifications';
  }

  getNotificationColor(type: NotificationType): string {
    const colors: { [key: string]: string } = {
      'turn_reminder': 'text-blue-600',
      'payment_due': 'text-orange-600',
      'new_committee': 'text-green-600',
      'payment_confirmed': 'text-green-600',
      'member_added': 'text-blue-600',
      'join_request': 'text-purple-600',
      'committee_active': 'text-amber-600'
    };
    return colors[type] || 'text-gray-600';
  }
}
