export type BadgeType = 'new' | 'trusted' | 'verified' | 'elite';

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  cnic?: string;
  avatar_url?: string;
  iban?: string;
  bank_name?: string;
  jazzcash_number?: string;
  easypaisa_number?: string;
  reputation_score: number;
  total_committees_completed: number;
  badge: BadgeType;
  created_at: string;
}

export interface ProfileUpdateData {
  full_name?: string;
  phone?: string;
  cnic?: string;
  avatar_url?: string;
  iban?: string;
  bank_name?: string;
  jazzcash_number?: string;
  easypaisa_number?: string;
}
