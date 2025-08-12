import { useAppSelector } from '@/slice/store';
import { Stack } from 'expo-router';

export default function Layout() {
  const roles = useAppSelector(state => state.auth.roles || []);
  const authStatus = useAppSelector(state => state.auth.status);

  // If auth is not successful, redirect to auth
  // if (authStatus !== 'success') {
  //   return <Redirect href="/dashboard/tabs/home" />;
  // }

  return (
    <Stack>
      <Stack.Screen
        name="tabs"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
