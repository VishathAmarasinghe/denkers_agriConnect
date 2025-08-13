import { View } from 'react-native';

export default function TabBarBackground() {
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#52B788',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderTopWidth: 0,
      }}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
