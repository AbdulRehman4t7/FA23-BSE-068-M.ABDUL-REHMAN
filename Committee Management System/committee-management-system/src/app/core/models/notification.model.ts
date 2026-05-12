export type NotificationType = 
  | 'turn_reminder' 
  | 'payment_due' 
  | 'new_committee' 
  | 'payment_confirmed' 
  | 'member_added'
  | 'join_request'
  | 'committee_active';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  related_committee_id?: string;
}
