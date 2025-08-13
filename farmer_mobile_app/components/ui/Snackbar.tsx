// components/Snackbar.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Snackbar as PaperSnackbar } from 'react-native-paper';
import { hideSnackbar } from '@/slice/snackbarSlice/snackbarSlice';
import { useAppDispatch, useAppSelector } from '@/slice/store';
import { Colors } from '@/constants/Colors';

const Snackbar = () => {
  const dispatch = useAppDispatch();
  const snackbarSlice = useAppSelector(state => state.snack);

  return (
    <View style={styles.snackbarContainer} pointerEvents="box-none">
      <PaperSnackbar
        key={snackbarSlice.message}
        visible={snackbarSlice.visible}
        onDismiss={() => dispatch(hideSnackbar())}
        duration={PaperSnackbar.DURATION_SHORT}
        style={[
          styles.snackbar,
          snackbarSlice.type === 'success' && { backgroundColor: '#4CAF50' },
          snackbarSlice.type === 'error' && { backgroundColor: '#FF0000' },
          snackbarSlice.type === 'warning' && { backgroundColor: '#FFC107' },
        ]}
      >
        {snackbarSlice.message}
      </PaperSnackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  snackbarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999999, // Very high z-index
    elevation: 99999, // For Android
    pointerEvents: 'box-none',
  },
  snackbar: {
    borderRadius: 20,
    backgroundColor: Colors.primary?.dark || '#2196F3',
  },
});

export default Snackbar;
