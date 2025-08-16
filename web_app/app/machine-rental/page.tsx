'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Build,
  Category,
  Agriculture,
  RequestPage,
  Settings,
  TrendingUp,
  CheckCircle,
  Schedule,
  Warning,
  Visibility,
  Add,
  Refresh,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/slices/store';
import {
  fetchEquipmentCategories,
  fetchEquipment,
  getAvailableEquipment,
  getPendingRentalRequests,
  clearMessages,
} from '@/slices/machineRentalSlice/machineRental';
import AdminLayout from '@/components/layout/AdminLayout';
import { useRouter } from 'next/navigation';

const MachineRentalOverview = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { 
    categories, 
    equipment, 
    availableEquipment, 
    rentalRequests, 
    loading, 
    error, 
    success 
  } = useAppSelector((state) => state.machineRentalReducer);

  const [stats, setStats] = useState({
    totalCategories: 0,
    totalEquipment: 0,
    availableEquipment: 0,
    pendingRequests: 0,
    activeRentals: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Auto-hide success/error messages after 5 seconds
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  const fetchData = async () => {
    try {
      await Promise.all([
        dispatch(fetchEquipmentCategories({ page: 1, limit: 100 })),
        dispatch(fetchEquipment({ page: 1, limit: 100 })),
        dispatch(getAvailableEquipment({ page: 1, limit: 100 })),
        dispatch(getPendingRentalRequests({ page: 1, limit: 100 })),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    // Calculate stats when data changes
    const activeRentals = rentalRequests.filter(req => 
      req.status === 'active' || req.status === 'approved'
    ).length;
    
    const totalRevenue = rentalRequests
      .filter(req => req.status === 'completed')
      .reduce((sum, req) => sum + req.total_amount, 0);

    setStats({
      totalCategories: categories.length,
      totalEquipment: equipment.length,
      availableEquipment: availableEquipment.length,
      pendingRequests: rentalRequests.filter(req => req.status === 'pending').length,
      activeRentals,
      totalRevenue,
    });
  }, [categories, equipment, availableEquipment, rentalRequests]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'active':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle />;
      case 'pending':
        return <Schedule />;
      case 'rejected':
        return <Warning />;
      case 'active':
        return <TrendingUp />;
      default:
        return <Schedule />;
    }
  };

  const recentRequests = rentalRequests.slice(0, 5);

  if (loading && categories.length === 0) {
    return (
      <AdminLayout>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
            Machine Rental Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage agricultural equipment, categories, and rental requests. Monitor availability and track revenue.
          </Typography>
        </Box>

        {/* Success/Error Messages */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 3, mb: 4 }}>
          <Card sx={{ boxShadow: 'agriculture', height: '100%', background: 'linear-gradient(135deg, #52B788 0%, #16a34a 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700}>
                  {stats.totalCategories}
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <Category sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Equipment Categories
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700}>
                  {stats.totalEquipment}
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <Agriculture sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Equipment
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700}>
                  {stats.availableEquipment}
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <CheckCircle sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Available Equipment
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700}>
                  {stats.pendingRequests}
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <Schedule sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Pending Requests
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700}>
                  {stats.activeRentals}
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <TrendingUp sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Active Rentals
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%', background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700}>
                  Rs. {stats.totalRevenue.toLocaleString()}
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <TrendingUp sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Revenue
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Quick Actions */}
        <Paper sx={{ p: 3, mb: 4, boxShadow: 'agriculture' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Quick Actions
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchData}
              disabled={loading}
            >
              Refresh Data
            </Button>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => router.push('/machine-rental/categories')}
              sx={{ 
                height: 80, 
                flexDirection: 'column', 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #52B788 0%, #16a34a 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #45a077 0%, #138a3a 100%)' }
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                Manage Categories
              </Typography>
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => router.push('/machine-rental/equipment')}
              sx={{ 
                height: 80, 
                flexDirection: 'column', 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)' }
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                Add Equipment
              </Typography>
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Visibility />}
              onClick={() => router.push('/machine-rental/requests')}
              sx={{ 
                height: 80, 
                flexDirection: 'column', 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)' }
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                View Requests
              </Typography>
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Settings />}
              onClick={() => router.push('/machine-rental/availability')}
              sx={{ 
                height: 80, 
                flexDirection: 'column', 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)' }
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                Manage Availability
              </Typography>
            </Button>
          </Box>
        </Paper>

        {/* Recent Rental Requests */}
        <Paper sx={{ boxShadow: 'agriculture' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={600}>
                Recent Rental Requests
              </Typography>
              <Button
                variant="outlined"
                onClick={() => router.push('/machine-rental/requests')}
                startIcon={<Visibility />}
              >
                View All
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ p: 3 }}>
            {recentRequests.length > 0 ? (
              <Box sx={{ display: 'grid', gap: 2 }}>
                {recentRequests.map((request) => (
                  <Card key={request.id} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                          <Agriculture sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {request.equipment_name || `Equipment #${request.equipment_id}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {request.farmer_name || `Farmer #${request.farmer_id}`} • {request.receiver_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          icon={getStatusIcon(request.status)}
                          label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          color={getStatusColor(request.status) as any}
                          size="small"
                          variant="outlined"
                        />
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/machine-rental/requests`)}
                            sx={{ color: 'primary.main' }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No rental requests found
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </AdminLayout>
  );
};

export default MachineRentalOverview;
