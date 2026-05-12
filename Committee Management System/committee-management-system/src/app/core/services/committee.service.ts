import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { 
  Committee, 
  CommitteeMember, 
  CreateCommitteeData,
  JoinRequest 
} from '../models/committee.model';

@Injectable({
  providedIn: 'root'
})
export class CommitteeService {
  myCommittees = signal<Committee[]>([]);
  publicCommittees = signal<Committee[]>([]);

  constructor(private supabase: SupabaseService) {}

  async createCommittee(data: CreateCommitteeData, creatorId: string): Promise<Committee> {
    // Create committee
    const { data: committee, error: committeeError } = await this.supabase.client
      .from('committees')
      .insert({
        creator_id: creatorId,
        name: data.name,
        description: data.description,
        total_months: data.total_months,
        monthly_amount: data.monthly_amount,
        max_members: data.max_members,
        start_date: data.start_date,
        is_public: data.is_public,
        payment_methods: data.payment_methods,
        current_members_count: 1
      })
      .select()
      .single();

    if (committeeError) throw committeeError;

    // Add creator as first member
    const { error: memberError } = await this.supabase.client
      .from('committee_members')
      .insert({
        committee_id: committee.id,
        user_id: creatorId,
        slot_number: 1,
        turn_month: data.creator_turn_month
      });

    if (memberError) throw memberError;

    // Create payment records for creator
    const payments = Array.from({ length: data.total_months }, (_, i) => ({
      committee_id: committee.id,
      member_id: creatorId,
      month_number: i + 1,
      amount: data.monthly_amount,
      status: 'pending'
    }));

    const { error: paymentsError } = await this.supabase.client
      .from('payments')
      .insert(payments);

    if (paymentsError) throw paymentsError;

    return committee;
  }

  async getMyCommittees(userId: string): Promise<Committee[]> {
    const { data, error } = await this.supabase.client
      .from('committees')
      .select(`
        *,
        creator:profiles!committees_creator_id_fkey(full_name, reputation_score, badge, avatar_url)
      `)
      .or(`creator_id.eq.${userId},id.in.(select committee_id from committee_members where user_id = ${userId})`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    this.myCommittees.set(data || []);
    return data || [];
  }

  async getPublicCommittees(filters?: {
    minAmount?: number;
    maxAmount?: number;
    duration?: number;
    minReputation?: number;
  }): Promise<Committee[]> {
    let query = this.supabase.client
      .from('committees')
      .select(`
        *,
        creator:profiles!committees_creator_id_fkey(full_name, reputation_score, badge, avatar_url)
      `)
      .eq('is_public', true)
      .eq('status', 'pending')
      .lt('current_members_count', this.supabase.client.rpc('max_members'));

    if (filters?.minAmount) {
      query = query.gte('monthly_amount', filters.minAmount);
    }
    if (filters?.maxAmount) {
      query = query.lte('monthly_amount', filters.maxAmount);
    }
    if (filters?.duration) {
      query = query.eq('total_months', filters.duration);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    
    let filteredData = data || [];
    if (filters?.minReputation) {
      filteredData = filteredData.filter((c: Committee) => 
        c.creator && c.creator.reputation_score >= filters.minReputation!
      );
    }

    this.publicCommittees.set(filteredData);
    return filteredData;
  }

  async getCommitteeById(committeeId: string): Promise<Committee> {
    const { data, error } = await this.supabase.client
      .from('committees')
      .select(`
        *,
        creator:profiles!committees_creator_id_fkey(full_name, reputation_score, badge, avatar_url)
      `)
      .eq('id', committeeId)
      .single();

    if (error) throw error;
    return data;
  }

  async getCommitteeMembers(committeeId: string): Promise<CommitteeMember[]> {
    const { data, error } = await this.supabase.client
      .from('committee_members')
      .select(`
        *,
        profile:profiles(full_name, avatar_url, reputation_score, badge, phone)
      `)
      .eq('committee_id', committeeId)
      .eq('status', 'active')
      .order('slot_number');

    if (error) throw error;
    return data || [];
  }

  async addMember(
    committeeId: string,
    userId: string,
    slotNumber: number,
    turnMonth: number,
    paymentDetails: {
      iban?: string;
      bank_name?: string;
      jazzcash_number?: string;
      easypaisa_number?: string;
    }
  ): Promise<void> {
    // Add member
    const { error: memberError } = await this.supabase.client
      .from('committee_members')
      .insert({
        committee_id: committeeId,
        user_id: userId,
        slot_number: slotNumber,
        turn_month: turnMonth,
        ...paymentDetails
      });

    if (memberError) throw memberError;

    // Get committee details
    const committee = await this.getCommitteeById(committeeId);

    // Create payment records
    const payments = Array.from({ length: committee.total_months }, (_, i) => ({
      committee_id: committeeId,
      member_id: userId,
      month_number: i + 1,
      amount: committee.monthly_amount,
      status: 'pending'
    }));

    const { error: paymentsError } = await this.supabase.client
      .from('payments')
      .insert(payments);

    if (paymentsError) throw paymentsError;

    // Update member count
    const { error: updateError } = await this.supabase.client
      .from('committees')
      .update({ current_members_count: committee.current_members_count + 1 })
      .eq('id', committeeId);

    if (updateError) throw updateError;
  }

  async removeMember(committeeId: string, memberId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('committee_members')
      .update({ status: 'removed' })
      .eq('committee_id', committeeId)
      .eq('id', memberId);

    if (error) throw error;

    // Update member count
    const committee = await this.getCommitteeById(committeeId);
    const { error: updateError } = await this.supabase.client
      .from('committees')
      .update({ current_members_count: committee.current_members_count - 1 })
      .eq('id', committeeId);

    if (updateError) throw updateError;
  }

  async requestToJoin(committeeId: string, userId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('join_requests')
      .insert({
        committee_id: committeeId,
        requester_id: userId
      });

    if (error) throw error;
  }

  async getJoinRequests(committeeId: string): Promise<JoinRequest[]> {
    const { data, error } = await this.supabase.client
      .from('join_requests')
      .select(`
        *,
        requester:profiles!join_requests_requester_id_fkey(full_name, avatar_url, reputation_score, badge, phone)
      `)
      .eq('committee_id', committeeId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async respondToJoinRequest(requestId: string, approved: boolean): Promise<void> {
    const { error } = await this.supabase.client
      .from('join_requests')
      .update({
        status: approved ? 'approved' : 'rejected',
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;
  }

  async activateCommittee(committeeId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('committees')
      .update({ status: 'active' })
      .eq('id', committeeId);

    if (error) throw error;
  }

  async cancelCommittee(committeeId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('committees')
      .update({ status: 'cancelled' })
      .eq('id', committeeId);

    if (error) throw error;
  }

  getCurrentMonth(committee: Committee): number {
    const startDate = new Date(committee.start_date);
    const today = new Date();
    const monthsDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                       (today.getMonth() - startDate.getMonth());
    return Math.max(1, Math.min(monthsDiff + 1, committee.total_months));
  }

  getAvailableSlots(maxMembers: number, takenSlots: number[]): number[] {
    return Array.from({ length: maxMembers }, (_, i) => i + 1)
      .filter(slot => !takenSlots.includes(slot));
  }
}
