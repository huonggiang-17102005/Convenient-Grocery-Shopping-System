export interface Family {
  id: string;
  name: string;
  invite_code: string | null;
  homemaker_id: string | null;
  created_at?: string;
  updated_at?: string;
}