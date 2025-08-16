'use client';

import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Home } from '@mui/icons-material';
import Image from 'next/image';
import { Images } from '@/constants/Images';

export default function NotFound() {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 3,
        background: 'linear-gradient(135deg, #52B788 0%, #16a34a 100%)',
      }}
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 4,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <Image
          src={Images.logos.appLogo}
          alt="AgriConnect Logo"
          width={80}
          height={80}
          style={{
            objectFit: 'contain',
          }}
        />
      </Box>
      
      <Typography variant="h1" component="h1" gutterBottom sx={{ color: 'white', fontSize: '6rem', fontWeight: 700 }}>
        404
      </Typography>
      
      <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'white', mb: 2 }}>
        Page Not Found
      </Typography>
      
      <Typography variant="body1" sx={{ color: 'white', mb: 4, opacity: 0.9 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      
      <Button
        variant="contained"
        size="large"
        startIcon={<Home />}
        onClick={() => router.push('/')}
        sx={{
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.3)',
          },
        }}
      >
        Go Home
      </Button>
    </Box>
  );
}
