import { Injectable, signal } from '@angular/core';
import { Committee, CommitteeMember, JoinRequest } from '../models/committee.model';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CommitteeService {
  readonly myCommittees = signal<Committee[]>([]);
  readonly publicCommittees = signal<Committee[]>([]);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly auth: AuthService
  ) {}

  async loadMyCommittees(): Promise<void> {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    const [created, joined] = await Promise.all([
      this.supabase.client.from('committees').select('*').eq('creator_id', userId),
      this.supabase.client
        .from('committees')
        .select('*, committee_members!inner(user_id)')
        .eq('committee_members.user_id', userId)
    ]);

    const merged = [...(created.data ?? []), ...(joined.data ?? [])] as Committee[];
    const unique = [...new Map(merged.map((item) => [item.id, item])).values()];
    this.myCommittees.set(unique);
  }

  async loadPublicCommittees(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('committees')
      .select('*')
      .eq('is_public', true)
      .in('status', ['pending', 'active'])
      .order('created_at', { ascending: false });
    if (error) throw error;
    this.publicCommittees.set((data ?? []) as Committee[]);
  }

  async createCommittee(payload: Omit<Committee, 'id' | 'created_at' | 'creator_id' | 'current_members_count' | 'status'>, creatorTurnMonth: number): Promise<Committee> {
    const userId = this.auth.user()?.id;
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await this.supabase.client
      .from('committees')
      .insert({
        ...payload,
        creator_id: userId,
        current_members_count: 1,
        status: 'pending'
      })
      .select('*')
      .single();
    if (error) throw error;

    const memberInsert = await this.supabase.client.from('committee_members').insert({
      committee_id: data.id,
      user_id: userId,
      slot_number: 1,
      turn_month: creatorTurnMonth,
      status: 'active'
    });
    if (memberInsert.error) throw memberInsert.error;
    return data as Committee;
  }

  async getCommitteeDetails(committeeId: string): Promise<Committee> {
    const { data, error } = await this.supabase.client.from('committees').select('*').eq('id', committeeId).single();
    if (error) throw error;
    return data as Committee;
  }

  async getMembers(committeeId: string): Promise<CommitteeMember[]> {
    const { data, error } = await this.supabase.client
      .from('committee_members')
      .select('*')
      .eq('committee_id', committeeId)
      .order('slot_number', { ascending: true });
    if (error) throw error;
    return (data ?? []) as CommitteeMember[];
  }

  async requestToJoin(committeeId: string): Promise<void> {
    const requesterId = this.auth.user()?.id;
    if (!requesterId) throw new Error('User not authenticated');
    const { error } = await this.supabase.client.from('join_requests').insert({
      committee_id: committeeId,
      requester_id: requesterId,
      status: 'pending'
    });
    if (error) throw error;
  }

  async getJoinRequests(committeeId: string): Promise<JoinRequest[]> {
    const { data, error } = await this.supabase.client
      .from('join_requests')
      .select('*')
      .eq('committee_id', committeeId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as JoinRequest[];
  }
}
