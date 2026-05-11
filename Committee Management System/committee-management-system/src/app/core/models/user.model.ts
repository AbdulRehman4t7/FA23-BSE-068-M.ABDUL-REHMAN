export type BadgeType = 'new' | 'trusted' | 'verified' | 'elite';

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  cnic: string | null;
  avatar_url: string | null;
  iban: string | null;
  bank_name: string | null;
  jazzcash_number: string | null;
  easypaisa_number: string | null;
  reputation_score: number;
  total_committees_completed: number;
  badge: BadgeType;
  created_at: string;
}
