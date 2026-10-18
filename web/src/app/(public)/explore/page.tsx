import { Suspense } from 'react';
import ExploreView from '@/features/trip-planning/components/ExploreView';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ExploreView />
    </Suspense>
  );
}
