import { Redirect } from 'expo-router';

export default function Index() {
  // Tạm thời redirect thẳng vào màn hình Planner của một Trip mẫu (id: 1)
  return <Redirect href="/planner/1" />;
}
