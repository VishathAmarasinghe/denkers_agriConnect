'use client';
import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ReduxProvider } from '@/components/providers/ReduxProvider';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { APIService } from '@/utils/apiService';
import { ServiceBaseUrl } from '@/config/config';

const inter = Inter({ subsets: ['latin'] });

function AppContent({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize API service with base URL
    if (typeof window !== 'undefined') {
      APIService.initialize(ServiceBaseUrl || 'http://localhost:3000');
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>AgriConnect Admin</title>
        <meta name="description" content="AgriConnect Government Admin Dashboard" />
        <link rel="icon" href="/images/logos/applogo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <ReduxProvider>
          <AppContent>
            {children}
          </AppContent>
          <Toaster position="top-right" />
        </ReduxProvider>
      </body>
    </html>
  );
}
