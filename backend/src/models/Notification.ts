export interface Notification {
  id: string;
  family_id?: string;
  user_id?: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
  created_at?: Date;
}
