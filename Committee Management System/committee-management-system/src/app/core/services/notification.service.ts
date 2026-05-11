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
}
