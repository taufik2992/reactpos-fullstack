import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Index(): React.JSX.Element {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    // Any additional initialization logic can go here
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Memuat aplikasi..." />;
  }

  if (isAuthenticated && user) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}