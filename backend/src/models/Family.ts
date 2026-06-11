export interface Family {
  id: string;
  name: string;
  homemaker_id: string | null;
  invite_code: string | null;
  created_at?: string;
  updated_at?: string;
}