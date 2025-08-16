// Safe Snackbar wrapper to work in Expo Go (native module may be unavailable)
let RNSnackbar: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  RNSnackbar = require('react-native-snackbar');
} catch {}

const safeShow = (
  message: string,
  opts?: { backgroundColor?: string; textColor?: string; durationMs?: number }
) => {
  if (RNSnackbar && typeof RNSnackbar.show === 'function') {
    RNSnackbar.show({
      text: message,
      duration: RNSnackbar.LENGTH_SHORT,
      backgroundColor: opts?.backgroundColor ?? '#333',
      textColor: opts?.textColor ?? '#FFF',
    });
  } else {
    // Fallback: log to console to avoid crashes in Expo Go
    console.log('[Snackbar]', message);
  }
};

export const showSuccessSnackbar = (message: string) =>
  safeShow(message, { backgroundColor: '#4CAF50', textColor: '#FFFFFF' });

export const showErrorSnackbar = (message: string) =>
  safeShow(message, { backgroundColor: '#F44336', textColor: '#FFFFFF' });
