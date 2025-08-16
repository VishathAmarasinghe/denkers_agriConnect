import { Stack } from 'expo-router';
import React from 'react';

export default function FieldVisitLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        title: '',
        headerTitle: '',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: '',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="experts"
        options={{
          title: '',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: '',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="contactForm"
        options={{
          title: '',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="confirmation"
        options={{
          title: '',
          headerTitle: '',
        }}
      />
    </Stack>
  );
}
