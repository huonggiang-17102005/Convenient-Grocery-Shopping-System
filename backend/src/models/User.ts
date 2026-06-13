export interface User {
  id: string;
  email: string;
  full_name: string | null;
  password?: string;
  role: 'Admin' | 'User';
  status: string | null;
  family_id: string | null;
  created_at?: string;
  updated_at?: string;
}