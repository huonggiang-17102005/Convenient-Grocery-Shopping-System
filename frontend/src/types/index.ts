// Khai báo các interface/type toàn cục cho frontend
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'homemaker' | 'member';
}
