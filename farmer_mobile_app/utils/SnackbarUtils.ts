import Snackbar from "react-native-snackbar";

// Function to show a success snackbar
export const showSuccessSnackbar = (message: string) => {
  Snackbar.show({
    text: message,
    duration: Snackbar.LENGTH_SHORT, // Options: LENGTH_SHORT, LENGTH_LONG, LENGTH_INDEFINITE
    backgroundColor: "#4CAF50", // Green for success
    textColor: "#FFFFFF",
  });
};

// Function to show an error snackbar
export const showErrorSnackbar = (message: string) => {
  Snackbar.show({
    text: message,
    duration: Snackbar.LENGTH_SHORT,
    backgroundColor: "#F44336", // Red for errors
    textColor: "#FFFFFF",
  });
};
