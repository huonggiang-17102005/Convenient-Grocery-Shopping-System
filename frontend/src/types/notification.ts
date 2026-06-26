export interface AppNotification {
  id: string;
  family_id?: string;
  user_id?: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
  created_at: string;
  read_by?: string[];
}
