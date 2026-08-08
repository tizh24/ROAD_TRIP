import { redirect } from 'next/navigation';

export default function PlannerIndexPage() {
  // Redirect to a placeholder trip ID, e.g., 'new' or '123'
  redirect('/planner/new-trip');
}
