'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/slices/store';
import { login, clearMessages } from '@/slices/authSlice/auth';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Phone, 
  Badge,
  Lock,
  Person
} from '@mui/icons-material';
import { 
  Box, 
  Card, 
  TextField, 
  Button, 
  Typography, 
  InputAdornment, 
  IconButton,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Fade
} from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Images } from '@/constants/Images';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loginState, stateMessage, errorMessage } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [identifierType, setIdentifierType] = useState<'username' | 'email' | 'phone' | 'nic'>('username');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Clear messages on unmount
  useEffect(() => {
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch]);

  // Determine identifier type based on input
  useEffect(() => {
    const value = formData.identifier;
    if (value.includes('@')) {
      setIdentifierType('email');
    } else if (value.length === 10 && /^\d+$/.test(value)) {
      setIdentifierType('phone');
    } else if (value.length === 12 && /^\d+$/.test(value)) {
      setIdentifierType('nic');
    } else {
      setIdentifierType('username');
    }
  }, [formData.identifier]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) {
      return;
    }
    
    await dispatch(login(formData));
  };

  const getIdentifierIcon = () => {
    switch (identifierType) {
      case 'email':
        return <Email sx={{ color: '#52B788', fontSize: 20 }} />;
      case 'phone':
        return <Phone sx={{ color: '#52B788', fontSize: 20 }} />;
      case 'nic':
        return <Badge sx={{ color: '#52B788', fontSize: 20 }} />;
      default:
        return <Person sx={{ color: '#52B788', fontSize: 20 }} />;
    }
  };

  const getIdentifierLabel = () => {
    switch (identifierType) {
      case 'email':
        return 'Email Address';
      case 'phone':
        return 'Phone Number';
      case 'nic':
        return 'NIC Number';
      default:
        return 'Username';
    }
  };

  const getIdentifierPlaceholder = () => {
    switch (identifierType) {
      case 'email':
        return 'Enter your email address';
      case 'phone':
        return 'Enter your phone number';
      case 'nic':
        return 'Enter your NIC number';
      default:
        return 'Enter your username';
    }
  };

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
            width: { xs: '100%', sm: 450 },
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
              Welcome Back
            </Typography>
            
            <Typography variant="body1" color="#64748b" sx={{ fontSize: '1.1rem' }}>
              Sign in to your AgriConnect account
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            {/* Identifier Field */}
            <TextField
              fullWidth
              name="identifier"
              label={getIdentifierLabel()}
              placeholder={getIdentifierPlaceholder()}
              value={formData.identifier}
              onChange={handleInputChange}
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
                    {getIdentifierIcon()}
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
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
                    <Lock sx={{ color: '#52B788', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#52B788' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Identifier Type Indicator */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Chip
                label={`Detected: ${identifierType.charAt(0).toUpperCase() + identifierType.slice(1)}`}
                color="primary"
                variant="outlined"
                size="small"
                icon={getIdentifierIcon()}
                sx={{
                  borderColor: '#52B788',
                  color: '#52B788',
                  '& .MuiChip-icon': {
                    color: '#52B788',
                  },
                }}
              />
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loginState === 'loading' || !formData.identifier || !formData.password}
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #52B788 0%, #16a34a 100%)',
                boxShadow: '0 4px 15px rgba(82, 183, 136, 0.4)',
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  boxShadow: '0 6px 20px rgba(82, 183, 136, 0.5)',
                },
                '&:disabled': {
                  background: '#e2e8f0',
                  color: '#94a3b8',
                },
              }}
            >
              {loginState === 'loading' ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

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

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="#94a3b8">
              or
            </Typography>
          </Divider>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={() => router.push('/auth/forgot-password')}
              sx={{
                borderRadius: 2,
                borderColor: '#52B788',
                color: '#52B788',
                fontSize: '1rem',
                fontWeight: 500,
                '&:hover': {
                  borderColor: '#16a34a',
                  backgroundColor: 'rgba(82, 183, 136, 0.08)',
                },
              }}
            >
              Forgot Password?
            </Button>
          </Box>
        </Card>
      </motion.div>
    </Box>
  );
}
