import { Injectable, signal } from '@angular/core';
import { Committee, CommitteeMember, CommitteeMemberWithProfile, CommitteeWithMeta, JoinRequest } from '../models/committee.model';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CommitteeService {
  readonly myCommittees = signal<CommitteeWithMeta[]>([]);
  readonly publicCommittees = signal<CommitteeWithMeta[]>([]);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly auth: AuthService
  ) {}

  async loadMyCommittees(): Promise<void> {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    const created = await this.supabase.client
      .from('committees')
      .select('*, committee_members!left(turn_month,slot_number,status,user_id)')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    const joined = await this.supabase.client
      .from('committees')
      .select('*, committee_members!inner(turn_month,slot_number,status,user_id)')
      .eq('committee_members.user_id', userId)
      .order('created_at', { ascending: false });

    if (created.error) throw created.error;
    if (joined.error) throw joined.error;

    const merged = [...(created.data ?? []), ...(joined.data ?? [])] as Array<Committee & { committee_members?: CommitteeMember[] }>;
    const unique = [...new Map(merged.map((item) => [item.id, item])).values()];

    const normalized = unique.map((committee) => {
      const myMembership = committee.committee_members?.find((member) => member.user_id === userId) ?? null;
      return {
        ...committee,
        user_membership: myMembership,
        slots_available: committee.max_members - committee.current_members_count
      } as CommitteeWithMeta;
    });

    this.myCommittees.set(normalized);
  }

  async loadPublicCommittees(filters?: {
    minAmount?: number;
    maxAmount?: number;
    duration?: number;
    slotsAtLeast?: number;
    minCreatorReputation?: number;
  }): Promise<void> {
    let query = this.supabase.client
      .from('committees')
      .select('*, creator_profile:profiles!committees_creator_id_fkey(id,full_name,avatar_url,reputation_score,badge)')
      .eq('is_public', true)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (filters?.minAmount) query = query.gte('monthly_amount', filters.minAmount);
    if (filters?.maxAmount) query = query.lte('monthly_amount', filters.maxAmount);
    if (filters?.duration) query = query.eq('total_months', filters.duration);

    const { data, error } = await query;
    if (error) throw error;

    let committees = (data ?? []).map((item) => ({
      ...(item as CommitteeWithMeta),
      slots_available: (item as Committee).max_members - (item as Committee).current_members_count
    }));

    if (filters?.slotsAtLeast) {
      committees = committees.filter((committee) => (committee.slots_available ?? 0) >= filters.slotsAtLeast!);
    }
    if (filters?.minCreatorReputation) {
      committees = committees.filter((committee) => (committee.creator_profile?.reputation_score ?? 0) >= filters.minCreatorReputation!);
    }

    this.publicCommittees.set(committees);
  }

  async createCommittee(payload: Omit<Committee, 'id' | 'created_at' | 'creator_id' | 'current_members_count' | 'status'>, creatorTurnMonth: number): Promise<Committee> {
    const userId = this.auth.user()?.id;
    if (!userId) throw new Error('User not authenticated');
    if (creatorTurnMonth > payload.total_months) throw new Error('Turn month cannot exceed total duration');

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

    const creatorProfile = this.auth.profile();
    const memberInsert = await this.supabase.client.from('committee_members').insert({
      committee_id: data.id,
      user_id: userId,
      slot_number: 1,
      turn_month: creatorTurnMonth,
      status: 'active',
      iban: creatorProfile?.iban ?? null,
      bank_name: creatorProfile?.bank_name ?? null,
      jazzcash_number: creatorProfile?.jazzcash_number ?? null,
      easypaisa_number: creatorProfile?.easypaisa_number ?? null
    });
    if (memberInsert.error) throw memberInsert.error;

    if (payload.is_public) {
      const profiles = await this.supabase.client.from('profiles').select('id').neq('id', userId);
      if (!profiles.error && profiles.data?.length) {
        await this.supabase.client.from('notifications').insert(
          profiles.data.map((profile) => ({
            user_id: profile.id as string,
            title: 'A new committee matching your preferences is open',
            message: `${payload.name} is now open for joining.`,
            type: 'new_committee',
            related_committee_id: data.id
          }))
        );
      }
    }
    return data as Committee;
  }

  async cancelCommittee(committeeId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('committees')
      .update({ status: 'cancelled' })
      .eq('id', committeeId)
      .eq('status', 'pending');
    if (error) throw error;
  }

  async getCommitteeDetails(committeeId: string): Promise<CommitteeWithMeta> {
    const { data, error } = await this.supabase.client
      .from('committees')
      .select('*, creator_profile:profiles!committees_creator_id_fkey(id,full_name,avatar_url,reputation_score,badge)')
      .eq('id', committeeId)
      .single();
    if (error) throw error;
    const committee = data as CommitteeWithMeta;
    committee.slots_available = committee.max_members - committee.current_members_count;
    return committee;
  }

  async getMembers(committeeId: string): Promise<CommitteeMemberWithProfile[]> {
    const { data, error } = await this.supabase.client
      .from('committee_members')
      .select('*, profile:profiles!committee_members_user_id_fkey(full_name,avatar_url,reputation_score,badge)')
      .eq('committee_id', committeeId)
      .order('slot_number', { ascending: true });
    if (error) throw error;
    return (data ?? []) as CommitteeMemberWithProfile[];
  }

  async searchRegisteredUsers(searchTerm: string): Promise<Array<{ id: string; full_name: string; phone: string; avatar_url: string | null; reputation_score: number; badge: string }>> {
    const term = searchTerm.trim();
    if (!term) return [];
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('id,full_name,phone,avatar_url,reputation_score,badge')
      .or(`full_name.ilike.%${term}%,phone.ilike.%${term}%`)
      .limit(10);
    if (error) throw error;
    return (data ?? []) as Array<{ id: string; full_name: string; phone: string; avatar_url: string | null; reputation_score: number; badge: string }>;
  }

  async addMemberToCommittee(payload: {
    committeeId: string;
    userId: string;
    slotNumber: number;
    turnMonth: number;
    iban?: string;
    bankName?: string;
    jazzcashNumber?: string;
    easypaisaNumber?: string;
  }): Promise<void> {
    const committee = await this.getCommitteeDetails(payload.committeeId);
    if (committee.status !== 'pending') throw new Error('Members can be added only before activation');
    if (payload.turnMonth > committee.total_months) throw new Error('Turn month exceeds committee duration');

    const { error } = await this.supabase.client.from('committee_members').insert({
      committee_id: payload.committeeId,
      user_id: payload.userId,
      slot_number: payload.slotNumber,
      turn_month: payload.turnMonth,
      iban: payload.iban ?? null,
      bank_name: payload.bankName ?? null,
      jazzcash_number: payload.jazzcashNumber ?? null,
      easypaisa_number: payload.easypaisaNumber ?? null,
      status: 'active'
    });
    if (error) throw error;

    await this.recalculateCommitteeState(payload.committeeId);
    await this.supabase.client.from('notifications').insert({
      user_id: payload.userId,
      title: 'You have been added to a new committee',
      message: `${committee.name} has added you as a member.`,
      type: 'member_added',
      related_committee_id: payload.committeeId
    });
  }

  async inviteByPhone(committeeId: string, phone: string, slotNumber: number, turnMonth: number): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .single();
    if (error || !data) throw new Error('No registered user found for this phone number');
    await this.addMemberToCommittee({
      committeeId,
      userId: data.id as string,
      slotNumber,
      turnMonth
    });
  }

  async updateMemberAssignment(committeeMemberId: string, patch: {
    slot_number: number;
    turn_month: number;
    iban?: string | null;
    bank_name?: string | null;
    jazzcash_number?: string | null;
    easypaisa_number?: string | null;
  }): Promise<void> {
    const { error } = await this.supabase.client.from('committee_members').update(patch).eq('id', committeeMemberId);
    if (error) throw error;
  }

  async removeMemberBeforeActivation(committeeMemberId: string): Promise<void> {
    const { data: membership, error: membershipError } = await this.supabase.client
      .from('committee_members')
      .select('id, committee_id')
      .eq('id', committeeMemberId)
      .single();
    if (membershipError) throw membershipError;

    const committee = await this.getCommitteeDetails(membership.committee_id as string);
    if (committee.status !== 'pending') throw new Error('Members can only be removed before activation');

    const { error } = await this.supabase.client
      .from('committee_members')
      .update({ status: 'removed' })
      .eq('id', committeeMemberId);
    if (error) throw error;

    await this.recalculateCommitteeState(membership.committee_id as string);
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

  async getJoinRequests(committeeId: string): Promise<Array<JoinRequest & { requester_profile?: { full_name: string; phone: string; avatar_url: string | null; reputation_score: number; badge: string } }>> {
    const { data, error } = await this.supabase.client
      .from('join_requests')
      .select('*, requester_profile:profiles!join_requests_requester_id_fkey(full_name,phone,avatar_url,reputation_score,badge)')
      .eq('committee_id', committeeId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Array<JoinRequest & { requester_profile?: { full_name: string; phone: string; avatar_url: string | null; reputation_score: number; badge: string } }>;
  }

  async reviewJoinRequest(payload: { requestId: string; committeeId: string; requesterId: string; approve: boolean; slotNumber?: number; turnMonth?: number }): Promise<void> {
    const status = payload.approve ? 'approved' : 'rejected';
    const { error } = await this.supabase.client
      .from('join_requests')
      .update({ status, responded_at: new Date().toISOString() })
      .eq('id', payload.requestId);
    if (error) throw error;

    if (!payload.approve) {
      await this.supabase.client.from('notifications').insert({
        user_id: payload.requesterId,
        title: 'Join request update',
        message: 'Your request to join the committee was rejected.',
        type: 'new_committee',
        related_committee_id: payload.committeeId
      });
      return;
    }

    if (!payload.slotNumber || !payload.turnMonth) {
      throw new Error('Slot and turn month are required for approval');
    }

    await this.addMemberToCommittee({
      committeeId: payload.committeeId,
      userId: payload.requesterId,
      slotNumber: payload.slotNumber,
      turnMonth: payload.turnMonth
    });
  }

  private async recalculateCommitteeState(committeeId: string): Promise<void> {
    const committee = await this.getCommitteeDetails(committeeId);
    const { count, error } = await this.supabase.client
      .from('committee_members')
      .select('*', { count: 'exact', head: true })
      .eq('committee_id', committeeId)
      .eq('status', 'active');
    if (error) throw error;

    const currentMembersCount = count ?? 0;
    const status = currentMembersCount >= committee.max_members ? 'active' : 'pending';

    const update = await this.supabase.client
      .from('committees')
      .update({ current_members_count: currentMembersCount, status })
      .eq('id', committeeId);
    if (update.error) throw update.error;

    if (status === 'active' && committee.status !== 'active') {
      const members = await this.getMembers(committeeId);
      const memberNotifications = members
        .filter((member) => member.status === 'active')
        .map((member) => ({
          user_id: member.user_id,
          title: `Committee ${committee.name} is now fully active`,
          message: `All slots are filled. Committee starts on ${committee.start_date}.`,
          type: 'committee_active',
          related_committee_id: committeeId
        }));
      if (memberNotifications.length) {
        await this.supabase.client.from('notifications').insert(memberNotifications);
      }
    }
  }
}
