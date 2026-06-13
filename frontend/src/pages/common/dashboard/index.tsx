// src/pages/common/dashboard/index.tsx
// Wrapper theo role — truyền đúng role prop xuống DashboardFeature
import { DashboardFeature } from '@/features/dashboard';

export function HomemakerDashboard() {
  return <DashboardFeature role="homemaker" />;
}

export function MemberDashboard() {
  return <DashboardFeature role="member" />;
}
