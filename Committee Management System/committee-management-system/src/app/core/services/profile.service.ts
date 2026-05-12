import { Injectable } from '@angular/core';
import { UserProfile } from '../models/user.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private readonly supabase: SupabaseService) {}

  async getProfileById(id: string): Promise<UserProfile> {
    const { data, error } = await this.supabase.client.from('profiles').select('*').eq('id', id).single();
    if (error) throw error;
    return data as UserProfile;
  }

  async updateProfile(id: string, patch: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    await this.recalculateReputation(id);
    return this.getProfileById(id);
  }

  async getCommitteeHistory(userId: string): Promise<{ created: number; joined: number; completed: number; inProgress: number }> {
    const [created, joined, completed] = await Promise.all([
      this.supabase.client.from('committees').select('id', { count: 'exact', head: true }).eq('creator_id', userId),
      this.supabase.client.from('committee_members').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'active'),
      this.supabase.client
        .from('committee_members')
        .select('committee_id, committees!inner(status)')
        .eq('user_id', userId)
        .eq('committees.status', 'completed')
    ]);

    if (created.error) throw created.error;
    if (joined.error) throw joined.error;
    if (completed.error) throw completed.error;

    const createdCount = created.count ?? 0;
    const joinedCount = joined.count ?? 0;
    const completedCount = completed.data?.length ?? 0;
    return {
      created: createdCount,
      joined: joinedCount,
      completed: completedCount,
      inProgress: Math.max(0, joinedCount - completedCount)
    };
  }

  async recalculateReputation(userId: string): Promise<void> {
    const [history, paidStats] = await Promise.all([
      this.getCommitteeHistory(userId),
      this.supabase.client.from('payments').select('status').eq('member_id', userId)
    ]);

    if (paidStats.error) throw paidStats.error;
    const payments = paidStats.data ?? [];
    const totalPayments = payments.length || 1;
    const paidOnTime = payments.filter((payment) => payment.status === 'paid').length;
    const onTimeRatio = paidOnTime / totalPayments;

    const createdWeight = Math.min(1, history.created / 5);
    const completedWeight = Math.min(1, history.completed / 5);
    const reputation = Number((1 + onTimeRatio * 2 + createdWeight + completedWeight).toFixed(1));

    const clamped = Math.max(0, Math.min(5, reputation));
    const badge: UserProfile['badge'] = clamped >= 4.5 ? 'elite' : clamped >= 3.5 ? 'verified' : clamped >= 2.5 ? 'trusted' : 'new';

    const update = await this.supabase.client
      .from('profiles')
      .update({
        reputation_score: clamped,
        total_committees_completed: history.completed,
        badge
      })
      .eq('id', userId);
    if (update.error) throw update.error;
  }
}
