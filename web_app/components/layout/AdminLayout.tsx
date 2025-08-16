'use client';
import { useState, ReactNode } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box className="admin-layout">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar}
        isMobile={isMobile}
      />
      
      <Box 
        className="admin-content"
        sx={{
          // marginLeft: isSidebarOpen ? '280px' : '80px',
          transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out',
          width: `calc(100% - ${isSidebarOpen ? '280px' : '80px'})`,
          marginTop: 0,
          marginRight: 0,
          marginBottom: 0,
        }}
      >
        <TopBar onMenuClick={toggleSidebar} isMobile={isMobile} />
        
        <Box sx={{ 
          flexGrow: 1, 
          padding: 3, 
          backgroundColor: 'background.default',
          overflow: 'auto',
          minHeight: 'calc(100vh - 64px)', // Subtract topbar height
          margin: 0,
          paddingTop: 0,
        }}>
          {children}
        </Box>
      </Box>
      
      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1200,
          }}
          onClick={toggleSidebar}
        />
      )}
    </Box>
  );
}
