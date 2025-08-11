import { StyleSheet } from "react-native";

// snack messages
export const SnackMessage = {
  success: {
    otpSend: "OTP sent successfully",
    passwordReset: "Password reset successfully",
  },
  error: {
    login:"Login failed",
    shiftUpdate:"Failed to update shift",   
    otpSend:"Failed to send OTP, Please contact admin!",   
    otpValidate:"Failed to validate OTP, Please contact admin!", 
    passwordReset:"Failed to reset password, Please contact admin!",
  },
  warning: {},
}


export const dropDownStyles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: "#055476",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#E3F2FD",
  },
  placeholderStyle: {
    fontSize: 16,
    color: "gray",
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  icon: {
    marginRight: 10,
  },
});
