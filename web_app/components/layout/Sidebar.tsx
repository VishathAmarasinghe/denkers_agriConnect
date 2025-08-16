'use client';
import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Collapse,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  People,
  LocationOn,
  Agriculture,
  Inventory,
  Warehouse,
  RequestPage,
  QrCodeScanner,
  TrendingUp,
  Description,
  AdminPanelSettings,
  Assessment,
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  Science,
  Build,
  Category,
  Settings,
  Storage,
  Notifications,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Images from '@/constants/Images';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  children?: MenuItem[];
}

export default function Sidebar({ isOpen, onToggle, isMobile }: SidebarProps) {
  const [openSections, setOpenSections] = useState<string[]>(['soil-management', 'warehouse-management', 'farmer-warehouse']);
  const router = useRouter();
  const theme = useTheme();

  const menuSections: MenuSection[] = [
    {
      title: 'Overview',
      items: [
        { title: 'Dashboard', icon: <Dashboard />, path: '/' },
      ]
    },
    {
      title: 'Soil Management',
      items: [
        // { title: 'Overview', icon: <Science />, path: '/soil-management' },
        { title: 'Collection Centers', icon: <LocationOn />, path: '/soil-management/collection-centers' },
        { title: 'Testing Requests', icon: <RequestPage />, path: '/soil-management/requests' },
        { title: 'Test Reports', icon: <Description />, path: '/soil-management/reports' },
      ]
    },
    {
      title: 'Machine Rental',
      items: [
        { title: 'Overview', icon: <Build />, path: '/machine-rental' },
        { title: 'Categories', icon: <Category />, path: '/machine-rental/categories' },
        { title: 'Equipment', icon: <Agriculture />, path: '/machine-rental/equipment' },
        { title: 'Rental Requests', icon: <RequestPage />, path: '/machine-rental/requests' },
        { title: 'Availability', icon: <Settings />, path: '/machine-rental/availability' },
      ]
    },
    {
      title: 'Warehouse Management',
      items: [
        { title: 'Categories', icon: <Category />, path: '/harvest-hub/categories' },
        { title: 'Warehouses', icon: <Warehouse />, path: '/harvest-hub/warehouses' },
      ]
    },
    {
      title: 'Farmer Warehouse',
      items: [
        { title: 'Overview', icon: <Warehouse />, path: '/farmer-warehouse' },
        { title: 'Requests', icon: <RequestPage />, path: '/farmer-warehouse/requests' },
        { title: 'Storage', icon: <Storage />, path: '/farmer-warehouse/storage' },
      ]
    },
    {
      title: 'Market Management',
      items: [
        { title: 'Market Items', icon: <Category />, path: '/farmer-warehouse/market-items' },
        { title: 'Market Prices', icon: <TrendingUp />, path: '/farmer-warehouse/market-prices' },
      ]
    },
    {
      title: 'Operations',
      items: [
        { title: 'QR Validation', icon: <QrCodeScanner />, path: '/qr-validation' },
      ]
    },
    {
      title: 'System',
      items: [
        { title: 'User Management', icon: <People />, path: '/users' },
        { title: 'Admin Management', icon: <AdminPanelSettings />, path: '/admins' },
        // { title: 'Farmer Warehouse', icon: <Warehouse />, path: '/admin/farmer-warehouse' },
      ]
    },
  ];

  const toggleSection = (sectionTitle: string) => {
    setOpenSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isOpen ? 'space-between' : 'center',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}>
        {isOpen && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <Image
                src={Images?.logos?.appLogo}
                alt="AgriConnect Logo"
                width={32}
                height={32}
                style={{
                  objectFit: 'contain',
                }}
              />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color="primary.500">
                AgriConnect
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Admin Portal
              </Typography>
            </Box>
          </Box>
        )}
        {!isOpen && (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #52B788 0%, #16a34a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Image
              src={Images?.logos?.appLogo}
              alt="AgriConnect Logo"
              width={36}
              height={36}
              style={{
                objectFit: 'contain',
              }}
            />
          </Box>
        )}
        {!isMobile && (
          <IconButton onClick={onToggle} size="small">
            {isOpen ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {menuSections.map((section, sectionIndex) => (
          <Box key={section.title}>
            {isOpen && (
              <Typography 
                variant="caption" 
                sx={{ 
                  px: 2, 
                  py: 1,
                  display: 'block',
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {section.title}
              </Typography>
            )}
            
            <List sx={{ py: 0 }}>
              {section.items.map((item) => (
                <Box key={item.title}>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={item.children ? 'div' : Link}
                      href={item.children ? undefined : item.path}
                      onClick={item.children ? () => toggleSection(item.title) : undefined}
                      sx={{
                        minHeight: 48,
                        justifyContent: isOpen ? 'initial' : 'center',
                        px: 2.5,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: isOpen ? 3 : 'auto',
                          justifyContent: 'center',
                          color: 'text.primary',
                        }}
                      >
                        {isOpen ? (
                          item.icon
                        ) : (
                          <Tooltip title={item.title} placement="right">
                            <Box component="span">
                              {item.icon}
                            </Box>
                          </Tooltip>
                        )}
                      </ListItemIcon>
                      
                      {isOpen && (
                        <>
                          <ListItemText 
                            primary={item.title}
                            primaryTypographyProps={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                            }}
                          />
                          {item.children && (
                            openSections.includes(item.title) ? <ExpandLess /> : <ExpandMore />
                          )}
                        </>
                      )}
                    </ListItemButton>
                  </ListItem>

                  {/* Nested items */}
                  {item.children && isOpen && (
                    <Collapse in={openSections.includes(item.title)} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.children.map((child) => (
                          <ListItem key={child.title} disablePadding>
                            <ListItemButton
                              component={Link}
                              href={child.path}
                              sx={{
                                pl: 4,
                                minHeight: 44,
                                '&:hover': {
                                  backgroundColor: 'action.hover',
                                },
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                {child.icon}
                              </ListItemIcon>
                              <ListItemText 
                                primary={child.title}
                                primaryTypographyProps={{
                                  fontSize: '0.825rem',
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </Box>
              ))}
            </List>
            
            {sectionIndex < menuSections.length - 1 && <Divider />}
          </Box>
        ))}
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={onToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isOpen}
      onClose={isMobile ? onToggle : undefined}
      sx={{
        width: isOpen ? 280 : 80,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isOpen ? 280 : 80,
          transition: 'width 0.3s ease-in-out',
          overflowX: 'hidden',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: 'background.paper',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 1200,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
