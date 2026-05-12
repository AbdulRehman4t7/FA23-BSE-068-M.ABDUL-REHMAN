export type PaymentStatus = 'pending' | 'paid' | 'overdue';
export type PaymentMethod = 'bank' | 'jazzcash' | 'easypaisa';

export interface Payment {
  id: string;
  committee_id: string;
  member_id: string;
  month_number: number;
  amount: number;
  payment_date?: string;
  method?: PaymentMethod;
  transaction_reference?: string;
  proof_url?: string;
  status: PaymentStatus;
  confirmed_by?: string;
  confirmed_at?: string;
  notes?: string;
  member?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface PaymentGridData {
  member_id: string;
  member_name: string;
  avatar_url?: string;
  slot_number: number;
  turn_month: number;
  payments: { [month: number]: Payment };
}

export interface MarkPaymentData {
  payment_date: string;
  method: PaymentMethod;
  transaction_reference?: string;
  proof_url?: string;
  notes?: string;
}
