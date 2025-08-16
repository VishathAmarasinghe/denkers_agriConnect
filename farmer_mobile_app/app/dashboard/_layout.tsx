import { useAppSelector } from '@/slice/store';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { selectIsAuthenticated, selectUserProfile } from '@/slice/authSlice/Auth';

export default function Layout() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userProfile = useAppSelector(selectUserProfile);
  const roles = useAppSelector(state => state.auth.roles || []);
  const authStatus = useAppSelector(state => state.auth.status);

  // If not authenticated, redirect to auth
  useEffect(() => {
    if (!isAuthenticated || !userProfile) {
      router.replace('/auth/signIn');
    }
  }, [isAuthenticated, userProfile, router]);

  // If auth is not successful, redirect to auth
  if (authStatus !== 'success' || !isAuthenticated || !userProfile) {
    return null; // Will redirect via useEffect
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="tabs"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
