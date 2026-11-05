import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProfileView from '@/profile/components/ProfileView';

export const metadata: Metadata = {
  title: 'Your profile | Miracle feng shui',
  description: 'Manage your details, addresses and password, and see your favorites and orders.',
};

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileView />
    </Suspense>
  );
}
