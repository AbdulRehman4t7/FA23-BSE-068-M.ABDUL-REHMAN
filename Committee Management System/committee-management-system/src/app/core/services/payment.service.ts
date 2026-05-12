import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Payment, PaymentGridData, MarkPaymentData } from '../models/payment.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  async getCommitteePayments(committeeId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase.client
      .from('payments')
      .select(`
        *,
        member:profiles!payments_member_id_fkey(full_name, avatar_url)
      `)
      .eq('committee_id', committeeId)
      .order('month_number')
      .order('member_id');

    if (error) throw error;
    return data || [];
  }

  async getPaymentGridData(committeeId: string): Promise<PaymentGridData[]> {
    // Get members
    const { data: members, error: membersError } = await this.supabase.client
      .from('committee_members')
      .select(`
        user_id,
        slot_number,
        turn_month,
        profile:profiles(full_name, avatar_url)
      `)
      .eq('committee_id', committeeId)
      .eq('status', 'active')
      .order('slot_number');

    if (membersError) throw membersError;

    // Get payments
    const payments = await this.getCommitteePayments(committeeId);

    // Build grid data
    return (members || []).map((member: any) => {
      const memberPayments = payments.filter(p => p.member_id === member.user_id);
      const paymentsMap: { [month: number]: Payment } = {};
      
      memberPayments.forEach(payment => {
        paymentsMap[payment.month_number] = payment;
      });

      return {
        member_id: member.user_id,
        member_name: member.profile?.full_name || 'Unknown',
        avatar_url: member.profile?.avatar_url,
        slot_number: member.slot_number,
        turn_month: member.turn_month,
        payments: paymentsMap
      };
    });
  }

  async markPaymentAsPaid(
    paymentId: string,
    data: MarkPaymentData
  ): Promise<void> {
    const userId = this.auth.getUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await this.supabase.client
      .from('payments')
      .update({
        status: 'paid',
        payment_date: data.payment_date,
        method: data.method,
        transaction_reference: data.transaction_reference,
        proof_url: data.proof_url,
        notes: data.notes,
        confirmed_by: userId,
        confirmed_at: new Date().toISOString()
      })
      .eq('id', paymentId);

    if (error) throw error;
  }

  async uploadPaymentProof(file: File, committeeId: string, paymentId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${committeeId}-${paymentId}-${Date.now()}.${fileExt}`;
    const filePath = `payment-proofs/${fileName}`;

    const { error: uploadError } = await this.supabase.storage
      .from('payments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = this.supabase.storage
      .from('payments')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async getMemberPayments(committeeId: string, memberId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase.client
      .from('payments')
      .select('*')
      .eq('committee_id', committeeId)
      .eq('member_id', memberId)
      .order('month_number');

    if (error) throw error;
    return data || [];
  }

  async updateOverduePayments(committeeId: string, currentMonth: number): Promise<void> {
    const { error } = await this.supabase.client
      .from('payments')
      .update({ status: 'overdue' })
      .eq('committee_id', committeeId)
      .lt('month_number', currentMonth)
      .eq('status', 'pending');

    if (error) throw error;
  }

  getPaymentStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'paid': 'text-green-600',
      'pending': 'text-yellow-600',
      'overdue': 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  }

  getPaymentStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'paid': 'check_circle',
      'pending': 'schedule',
      'overdue': 'error'
    };
    return icons[status] || 'help';
  }
}
