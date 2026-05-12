export type CommitteeStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type PaymentMethod = 'bank' | 'jazzcash' | 'easypaisa';
export type MemberStatus = 'active' | 'removed';

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
  creator?: {
    full_name: string;
    reputation_score: number;
    badge: string;
    avatar_url?: string;
  };
}

export interface CommitteeMember {
  id: string;
  committee_id: string;
  user_id: string;
  slot_number: number;
  turn_month: number;
  iban?: string;
  bank_name?: string;
  jazzcash_number?: string;
  easypaisa_number?: string;
  joined_at: string;
  status: MemberStatus;
  profile?: {
    full_name: string;
    avatar_url?: string;
    reputation_score: number;
    badge: string;
    phone: string;
  };
}

export interface CreateCommitteeData {
  name: string;
  description: string;
  total_months: number;
  monthly_amount: number;
  max_members: number;
  start_date: string;
  is_public: boolean;
  payment_methods: PaymentMethod[];
  creator_turn_month: number;
}

export interface JoinRequest {
  id: string;
  committee_id: string;
  requester_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  responded_at?: string;
  requester?: {
    full_name: string;
    avatar_url?: string;
    reputation_score: number;
    badge: string;
    phone: string;
  };
}
