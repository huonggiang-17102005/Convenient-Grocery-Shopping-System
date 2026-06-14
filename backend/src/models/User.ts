export interface User {
  id: string;
  email: string;
  password?: string;
  full_name: string | null;
  avatar: string | null;
  role: string | null;
  status: string | null;
  family_id: string | null;
  created_at?: string;
  updated_at?: string;
}