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
  }
}
