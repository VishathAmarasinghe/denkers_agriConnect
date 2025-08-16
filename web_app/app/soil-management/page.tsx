'use client';
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Science,
  LocationOn,
  Assignment,
  Schedule,
  TrendingUp,
  People,
  Analytics,
  ArrowForward,
  Add,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';

const SoilManagementPage = () => {
  const router = useRouter();

  const features = [
    {
      title: 'Collection Centers',
      description: 'Manage soil collection centers across Sri Lanka',
      icon: <LocationOn sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: 'Manage Centers',
      path: '/soil-management/collection-centers',
      color: 'primary.main',
    },
    {
      title: 'Soil Testing Reports',
      description: 'View and analyze soil testing results and reports',
      icon: <Assignment sx={{ fontSize: 40, color: 'success.main' }} />,
      action: 'View Reports',
      path: '/soil-management/reports',
      color: 'success.main',
    },
    {
      title: 'Soil Testing Requests',
      description: 'Manage and process soil testing requests from farmers',
      icon: <Schedule sx={{ fontSize: 40, color: 'warning.main' }} />,
      action: 'Manage Requests',
      path: '/soil-management/requests',
      color: 'warning.main',
    },
    {
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and insights',
      icon: <Analytics sx={{ fontSize: 40, color: 'info.main' }} />,
      action: 'View Analytics',
      path: '/soil-management/analytics',
      color: 'info.main',
    },
  ];

  const quickStats = [
    {
      title: 'Total Centers',
      value: '24',
      icon: <LocationOn sx={{ fontSize: 24, color: 'primary.main' }} />,
      trend: '+2 this month',
      color: 'primary.main',
    },
    {
      title: 'Active Tests',
      value: '156',
      icon: <Science sx={{ fontSize: 24, color: 'success.main' }} />,
      trend: '+12 this week',
      color: 'success.main',
    },
    {
      title: 'Farmers Served',
      value: '1,247',
      icon: <People sx={{ fontSize: 24, color: 'warning.main' }} />,
      trend: '+89 this month',
      color: 'warning.main',
    },
    {
      title: 'Success Rate',
      value: '94.2%',
      icon: <TrendingUp sx={{ fontSize: 24, color: 'info.main' }} />,
      trend: '+2.1% vs last month',
      color: 'info.main',
    },
  ];

  const recentActivities = [
    {
      title: 'New soil collection center added in Colombo',
      time: '2 hours ago',
      type: 'center',
    },
    {
      title: 'Soil testing completed for Farmer ID: F12345',
      time: '4 hours ago',
      type: 'test',
    },
    {
      title: 'Center maintenance scheduled for Kandy location',
      time: '1 day ago',
      type: 'maintenance',
    },
    {
      title: 'Monthly report generated for August 2025',
      time: '2 days ago',
      type: 'report',
    },
  ];

  const handleFeatureClick = (path: string) => {
    router.push(path);
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
            Soil Management Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Comprehensive soil testing and collection center management system
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor soil collection centers, manage testing schedules, and analyze agricultural soil data across Sri Lanka.
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          {quickStats.map((stat, index) => (
            <Card key={index} sx={{ boxShadow: 'agriculture', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                  {stat.icon}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {stat.title}
                </Typography>
                <Typography variant="caption" sx={{ color: stat.color, fontWeight: 500 }}>
                  {stat.trend}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Main Features */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
          {features.map((feature, index) => (
            <Card 
              key={index}
              sx={{ 
                boxShadow: 'agriculture', 
                height: '100%',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 'agriculture-lg',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {feature.icon}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={() => handleFeatureClick(feature.path)}
                  sx={{ 
                    backgroundColor: feature.color,
                    '&:hover': { 
                      backgroundColor: feature.color,
                      opacity: 0.9
                    }
                  }}
                  fullWidth
                >
                  {feature.action}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>

        {/* Recent Activities and Quick Actions */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          {/* Recent Activities */}
          <Paper sx={{ p: 3, boxShadow: 'agriculture' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.title}
                      secondary={activity.time}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>

          {/* Quick Actions */}
          <Paper sx={{ p: 3, boxShadow: 'agriculture' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => router.push('/soil-management/collection-centers')}
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                Add New Center
              </Button>
              <Button
                variant="outlined"
                startIcon={<Assignment />}
                onClick={() => router.push('/soil-management/reports')}
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                Generate Report
              </Button>
              <Button
                variant="outlined"
                startIcon={<Schedule />}
                onClick={() => router.push('/soil-management/requests')}
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                Manage Requests
              </Button>
              <Button
                variant="outlined"
                startIcon={<Analytics />}
                onClick={() => router.push('/soil-management/analytics')}
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                View Analytics
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default SoilManagementPage;
