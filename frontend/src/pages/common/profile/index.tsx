// src/pages/common/profile/index.tsx
// Wrapper theo role — truyền đúng role prop xuống ProfileFeature
import { ProfileFeature } from '@/features/profile';

export function HomemakerProfile() {
  return <ProfileFeature role="homemaker" />;
}

export function MemberProfile() {
  return <ProfileFeature role="member" />;
}
