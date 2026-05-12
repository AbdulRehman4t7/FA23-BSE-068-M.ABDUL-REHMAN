import { Injectable, computed, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { AppNotification } from '../models/notification.model';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly items = signal<AppNotification[]>([]);
  readonly unreadCount = computed(() => this.items().filter((item) => !item.is_read).length);
  private channel?: RealtimeChannel;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly auth: AuthService
  ) {}

  async load(): Promise<void> {
    const userId = this.auth.user()?.id;
    if (!userId) return;
    await this.createUpcomingTurnReminder(userId);
    const { data, error } = await this.supabase.client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    this.items.set((data ?? []) as AppNotification[]);
  }

  startRealtime(): void {
    const userId = this.auth.user()?.id;
    if (!userId) return;
    this.channel?.unsubscribe();
    this.channel = this.supabase.client
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          this.items.update((current) => [payload.new as AppNotification, ...current]);
        }
      )
      .subscribe();
  }

  async markAllAsRead(): Promise<void> {
    const userId = this.auth.user()?.id;
    if (!userId) return;
    const { error } = await this.supabase.client.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    if (error) throw error;
    this.items.update((items) => items.map((item) => ({ ...item, is_read: true })));
  }

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await this.supabase.client.from('notifications').update({ is_read: true }).eq('id', notificationId);
    if (error) throw error;
    this.items.update((items) => items.map((item) => (item.id === notificationId ? { ...item, is_read: true } : item)));
  }

  private async createUpcomingTurnReminder(userId: string): Promise<void> {
    const memberships = await this.supabase.client
      .from('committee_members')
      .select('turn_month, committee:committees!inner(id,name,start_date,total_months,status)')
      .eq('user_id', userId)
      .eq('status', 'active');
    if (memberships.error) return;

    const now = new Date();
    const reminders = (memberships.data ?? []).flatMap((row) => {
      const committeeRecord = (row as { committee: { id: string; name: string; start_date: string; total_months: number; status: string } | Array<{ id: string; name: string; start_date: string; total_months: number; status: string }> }).committee;
      const committee = Array.isArray(committeeRecord) ? committeeRecord[0] : committeeRecord;
      if (!committee || committee.status !== 'active') return [];
      const start = new Date(committee.start_date);
      const monthsSinceStart = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;
      const nextMonth = monthsSinceStart + 1;
      const isTurnComing = nextMonth === row.turn_month;
      const daysUntilNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).getDate() - now.getDate();
      if (!isTurnComing || daysUntilNextMonth > 3) return [];
      return [{
        user_id: userId,
        title: 'Your turn is coming next month!',
        message: `${committee.name}: you are scheduled for payout next month.`,
        type: 'turn_reminder',
        related_committee_id: committee.id
      }];
    });

    if (!reminders.length) return;
    await this.supabase.client.from('notifications').insert(reminders);
  }
}
