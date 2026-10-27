import { Suspense } from 'react';
import ExploreView from '@/features/trip-planning/components/ExploreView';

export const metadata = { title: "Khám phá lộ trình" };

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ExploreView />
    </Suspense>
  );
}
