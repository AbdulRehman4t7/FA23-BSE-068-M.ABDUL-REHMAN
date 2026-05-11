export type CommitteeStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type PaymentMethod = 'bank' | 'jazzcash' | 'easypaisa';

export interface Committee {
  id: string;
  creator_id: string;
  name: string;
  description: string;
  total_months: number;
  monthly_amount: number;
  max_members: number;
  current_members_count: number;
  start_date: string;
  status: CommitteeStatus;
  is_public: boolean;
  payment_methods: PaymentMethod[];
  created_at: string;
}

export interface CommitteeMember {
  id: string;
  committee_id: string;
  user_id: string;
  slot_number: number;
  turn_month: number;
  iban: string | null;
  bank_name: string | null;
  jazzcash_number: string | null;
  easypaisa_number: string | null;
  joined_at: string;
  status: 'active' | 'removed';
}

export interface JoinRequest {
  id: string;
  committee_id: string;
  requester_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  responded_at: string | null;
}
