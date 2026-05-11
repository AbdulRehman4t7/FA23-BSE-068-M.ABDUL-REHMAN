import { PaymentMethod } from './committee.model';

export type PaymentStatus = 'pending' | 'paid' | 'overdue';

export interface Payment {
  id: string;
  committee_id: string;
  member_id: string;
  month_number: number;
  amount: number;
  payment_date: string | null;
  method: PaymentMethod;
  transaction_reference: string | null;
  proof_url: string | null;
  status: PaymentStatus;
  confirmed_by: string | null;
  confirmed_at: string | null;
  notes: string | null;
}
