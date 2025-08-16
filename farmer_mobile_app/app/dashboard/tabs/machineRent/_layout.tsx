import { Stack } from 'expo-router';
import React from 'react';

export default function MachineRentLayout() {
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
        name="equipmentCategory"
        options={{
          title: '',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="machineListing"
        options={{
          title: '',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="machineDetails"
        options={{
          title: '',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="rentalBooking"
        options={{
          title: '',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="rentalRequests"
        options={{
          title: '',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="requestDetails"
        options={{
          title: '',
          headerTitle: '',
        }}
      />
    </Stack>
  );
}
