import { Injectable } from '@angular/core';
import { Payment } from '../models/payment.model';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly auth: AuthService
  ) {}

  async getCommitteePayments(committeeId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase.client
      .from('payments')
      .select('*')
      .eq('committee_id', committeeId)
      .order('month_number', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Payment[];
  }

  async ensurePaymentGridRows(committeeId: string, totalMonths: number): Promise<void> {
    const { data: members, error: membersError } = await this.supabase.client
      .from('committee_members')
      .select('user_id,status')
      .eq('committee_id', committeeId)
      .eq('status', 'active');
    if (membersError) throw membersError;

    const { data: existingPayments, error: existingError } = await this.supabase.client
      .from('payments')
      .select('member_id,month_number')
      .eq('committee_id', committeeId);
    if (existingError) throw existingError;

    const existing = new Set((existingPayments ?? []).map((p) => `${p.member_id}-${p.month_number}`));
    const rows: Array<{ committee_id: string; member_id: string; month_number: number; amount: number; status: 'pending' }> = [];

    for (const member of members ?? []) {
      for (let month = 1; month <= totalMonths; month += 1) {
        const key = `${member.user_id}-${month}`;
        if (!existing.has(key)) {
          rows.push({
            committee_id: committeeId,
            member_id: member.user_id as string,
            month_number: month,
            amount: 0,
            status: 'pending'
          });
        }
      }
    }

    if (!rows.length) return;
    const insert = await this.supabase.client.from('payments').insert(rows);
    if (insert.error) throw insert.error;
  }

  async markAsPaid(payload: {
    committee_id: string;
    member_id: string;
    month_number: number;
    amount: number;
    method: 'bank' | 'jazzcash' | 'easypaisa';
    transaction_reference: string;
    notes?: string;
    proofFile?: File;
  }): Promise<void> {
    const userId = this.auth.user()?.id;
    if (!userId) throw new Error('User not authenticated');

    let proofUrl: string | null = null;
    if (payload.proofFile) {
      const filePath = `payment-proofs/${payload.committee_id}-${payload.member_id}-${Date.now()}-${payload.proofFile.name}`;
      const upload = await this.supabase.client.storage.from('payment-proofs').upload(filePath, payload.proofFile, { upsert: true });
      if (upload.error) throw upload.error;
      proofUrl = this.supabase.client.storage.from('payment-proofs').getPublicUrl(filePath).data.publicUrl;
    }

    const { error } = await this.supabase.client.from('payments').upsert({
      committee_id: payload.committee_id,
      member_id: payload.member_id,
      month_number: payload.month_number,
      amount: payload.amount,
      payment_date: new Date().toISOString(),
      method: payload.method,
      transaction_reference: payload.transaction_reference,
      proof_url: proofUrl,
      status: 'paid',
      confirmed_by: userId,
      confirmed_at: new Date().toISOString(),
      notes: payload.notes ?? null
    });
    if (error) throw error;

    await this.supabase.client.from('notifications').insert({
      user_id: payload.member_id,
      title: 'Your payment has been confirmed',
      message: `Payment for month ${payload.month_number} has been confirmed by committee creator.`,
      type: 'payment_confirmed',
      related_committee_id: payload.committee_id
    });
  }

  async markPendingOverdue(committeeId: string, monthNumber: number, memberId: string, overdue: boolean): Promise<void> {
    const { error } = await this.supabase.client
      .from('payments')
      .update({ status: overdue ? 'overdue' : 'pending' })
      .eq('committee_id', committeeId)
      .eq('month_number', monthNumber)
      .eq('member_id', memberId);
    if (error) throw error;
  }

  async sendPaymentReminder(payload: { userId: string; committeeId: string; committeeName: string; monthNumber: number }): Promise<void> {
    const { error } = await this.supabase.client.from('notifications').insert({
      user_id: payload.userId,
      title: `Payment due for ${payload.committeeName} — Month ${payload.monthNumber}`,
      message: 'Please submit your monthly committee amount.',
      type: 'payment_due',
      related_committee_id: payload.committeeId
    });
    if (error) throw error;
  }
}
