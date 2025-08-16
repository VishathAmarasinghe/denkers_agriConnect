'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/slices/store';
import { forgotPassword, clearMessages } from '@/slices/authSlice/auth';
import { 
  ArrowBack, 
  Badge, 
  Send,
  CheckCircle,
  Timer
} from '@mui/icons-material';
import { 
  Box, 
  Card, 
  TextField, 
  Button, 
  Typography, 
  InputAdornment, 
  Chip,
  Alert,
  CircularProgress,
  Fade,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Images } from '@/constants/Images';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { forgotPasswordState, stateMessage, errorMessage } = useAppSelector((state) => state.auth);

  const [nic, setNic] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Clear messages on unmount
  useEffect(() => {
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!nic) return;
    
    const result = await dispatch(forgotPassword({ nic }));
    if (forgotPassword.fulfilled.match(result)) {
      setOtpSent(true);
      setActiveStep(1);
      setCountdown(60); // 60 seconds countdown
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    await handleSendOTP();
  };

  const handleVerifyOTP = () => {
    if (!otp) return;
    setActiveStep(2);
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) return;
    if (newPassword.length < 6) return;
    
    // Here you would call the reset password API
    // For now, just show success and redirect
    setActiveStep(3);
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  const steps = [
    {
      label: 'Enter NIC',
      description: 'Enter your National Identity Card number to receive an OTP',
      content: (
        <Box>
          <TextField
            fullWidth
            label="NIC Number"
            placeholder="Enter your 12-digit NIC number"
            value={nic}
            onChange={(e) => setNic(e.target.value)}
            variant="outlined"
            size="medium"
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e2e8f0',
                },
                '&:hover fieldset': {
                  borderColor: '#52B788',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#52B788',
                },
                '& input': {
                  color: '#000000',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#64748b',
                '&.Mui-focused': {
                  color: '#52B788',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Badge sx={{ color: '#52B788', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            inputProps={{
              maxLength: 12,
              pattern: '[0-9]{12}'
            }}
          />
          <Button
            fullWidth
            variant="contained"
            size="medium"
            onClick={handleSendOTP}
            disabled={!nic || nic.length !== 12 || forgotPasswordState === 'loading'}
            sx={{
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #52B788 0%, #16a34a 100%)',
              boxShadow: '0 4px 15px rgba(82, 183, 136, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                boxShadow: '0 6px 20px rgba(82, 183, 136, 0.5)',
              },
            }}
          >
            {forgotPasswordState === 'loading' ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>
                <Send sx={{ mr: 1 }} />
                Send OTP
              </>
            )}
          </Button>
        </Box>
      ),
    },
    {
      label: 'Enter OTP',
      description: 'Enter the OTP sent to your registered phone number',
      content: (
        <Box>
          <TextField
            fullWidth
            label="OTP Code"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            variant="outlined"
            size="medium"
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e2e8f0',
                },
                '&:hover fieldset': {
                  borderColor: '#52B788',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#52B788',
                },
                '& input': {
                  color: '#000000',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#64748b',
                '&.Mui-focused': {
                  color: '#52B788',
                },
              },
            }}
            inputProps={{
              maxLength: 6,
              pattern: '[0-9]{6}'
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleResendOTP}
              disabled={countdown > 0}
              sx={{ 
                borderRadius: 2,
                borderColor: '#52B788',
                color: '#52B788',
                '&:hover': {
                  borderColor: '#16a34a',
                  backgroundColor: 'rgba(82, 183, 136, 0.08)',
                },
              }}
            >
              {countdown > 0 ? (
                <>
                  <Timer sx={{ mr: 1 }} />
                  Resend in {countdown}s
                </>
              ) : (
                'Resend OTP'
              )}
            </Button>
            
            <Button
              fullWidth
              variant="contained"
              onClick={handleVerifyOTP}
              disabled={!otp || otp.length !== 6}
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(135deg, #52B788 0%, #16a34a 100%)',
              }}
            >
              Verify OTP
            </Button>
          </Box>
        </Box>
      ),
    },
    {
      label: 'New Password',
      description: 'Create a new secure password for your account',
      content: (
        <Box>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            placeholder="Enter new password (min 6 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            variant="outlined"
            size="medium"
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e2e8f0',
                },
                '&:hover fieldset': {
                  borderColor: '#52B788',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#52B788',
                },
                '& input': {
                  color: '#000000',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#64748b',
                '&.Mui-focused': {
                  color: '#52B788',
                },
              },
            }}
            inputProps={{
              minLength: 6
            }}
          />
          
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            variant="outlined"
            size="medium"
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e2e8f0',
                },
                '&:hover fieldset': {
                  borderColor: '#52B788',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#52B788',
                },
                '& input': {
                  color: '#000000',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#64748b',
                '&.Mui-focused': {
                  color: '#52B788',
                },
              },
            }}
            error={newPassword !== confirmPassword && confirmPassword.length > 0}
            helperText={
              newPassword !== confirmPassword && confirmPassword.length > 0
                ? "Passwords don't match"
                : ""
            }
          />
          
          <Button
            fullWidth
            variant="contained"
            size="medium"
            onClick={handleResetPassword}
            disabled={
              !newPassword || 
              !confirmPassword || 
              newPassword !== confirmPassword || 
              newPassword.length < 6
            }
            sx={{
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #52B788 0%, #16a34a 100%)',
              boxShadow: '0 4px 15px rgba(82, 183, 136, 0.4)',
            }}
          >
            Reset Password
          </Button>
        </Box>
      ),
    },
    {
      label: 'Success',
      description: 'Your password has been reset successfully',
      content: (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle sx={{ fontSize: 64, color: '#22c55e', mb: 2 }} />
          <Typography variant="h6" color="#22c55e" gutterBottom>
            Password Reset Successful!
          </Typography>
          <Typography variant="body1" color="#64748b">
            You will be redirected to the login page shortly...
          </Typography>
        </Box>
      ),
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #52B788 0%, #16a34a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          sx={{
            width: { xs: '100%', sm: 600 },
            p: 4,
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #52B788 0%, #16a34a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  boxShadow: '0 8px 32px rgba(82, 183, 136, 0.4)',
                  overflow: 'hidden',
                  border: '3px solid white',
                }}
              >
                <Image
                  src={Images.logos.appLogo}
                  alt="AgriConnect Logo"
                  width={70}
                  height={70}
                  style={{
                    objectFit: 'contain',
                    borderRadius: '50%',
                  }}
                />
              </Box>
            </motion.div>
            
            <Typography variant="h4" component="h1" fontWeight={700} color="#1e293b" gutterBottom>
              Reset Password
            </Typography>
            
            <Typography variant="body1" color="#64748b" sx={{ fontSize: '1.1rem' }}>
              Follow the steps to reset your password securely
            </Typography>
          </Box>

          {/* Back Button */}
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => router.push('/login')}
              sx={{ 
                color: '#52B788',
                '&:hover': {
                  backgroundColor: 'rgba(82, 183, 136, 0.08)',
                },
              }}
            >
              Back to Login
            </Button>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  optional={
                    index === 2 ? (
                      <Typography variant="caption" color="error">
                        Required
                      </Typography>
                    ) : null
                  }
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  <Typography sx={{ mb: 2, color: '#64748b' }}>
                    {step.description}
                  </Typography>
                  {step.content}
                </StepContent>
              </Step>
            ))}
          </Stepper>

          {/* Messages */}
          <Fade in={!!stateMessage || !!errorMessage}>
            <Box sx={{ mb: 3 }}>
              {stateMessage && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  {stateMessage}
                </Alert>
              )}
              {errorMessage && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {errorMessage}
                </Alert>
              )}
            </Box>
          </Fade>

          {/* Progress Indicator */}
          {activeStep < 3 && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Chip
                label={`Step ${activeStep + 1} of 4`}
                color="primary"
                variant="outlined"
                sx={{
                  borderColor: '#52B788',
                  color: '#52B788',
                }}
              />
            </Box>
          )}
        </Card>
      </motion.div>
    </Box>
  );
}
