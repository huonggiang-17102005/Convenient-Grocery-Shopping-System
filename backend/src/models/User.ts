export interface User {
  id: string;
  email: string;
  password?: string;
  role: 'Admin' | 'User';
  family_id: string | null;
  created_at?: string;
  updated_at?: string;
}