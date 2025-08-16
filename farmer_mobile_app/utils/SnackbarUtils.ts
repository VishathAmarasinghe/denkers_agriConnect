
// Safe dynamic import to work in Expo Go where the native module may be unavailable
let RN_Snackbar: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  RN_Snackbar = require('react-native-snackbar');
} catch {
  RN_Snackbar = null;
}

const show = (message: string, bg: string) => {
  if (RN_Snackbar && typeof RN_Snackbar.show === 'function') {
    RN_Snackbar.show({
      text: message,
      duration: RN_Snackbar.LENGTH_SHORT,
      backgroundColor: bg,
      textColor: '#FFFFFF',
    });
  } else {
    // Fallback: log to console to avoid crashing in Expo Go
    console.log('[SNACKBAR]', message);
  }
};

export const showSuccessSnackbar = (message: string) => show(message, '#4CAF50');

