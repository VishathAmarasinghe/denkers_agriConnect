import { Stack } from 'expo-router';
import React from 'react';

export default function HarvestHubLayout() {
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
        name="warehouses"
        options={{
          title: '',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="warehouseDetail"
        options={{
          title: '',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="inventory"
        options={{
          title: '',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="marketPrices"
        options={{
          title: '',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="slotCalendar"
        options={{
          title: '',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="bookingForm"
        options={{
          title: '',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="bookingConfirmation"
        options={{
          title: '',
          headerTitle: '',
        }}
      />
    </Stack>
  );
}
