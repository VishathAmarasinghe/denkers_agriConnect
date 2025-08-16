'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  IconButton,
  Paper,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Warehouse,
  Storage,
  QrCode,
  Add,
  Visibility,
  CheckCircle,
  Warning,
  Error,
  Schedule,
  LocalShipping,
  Assessment,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/slices/store';
import {
  fetchFarmerWarehouseRequests,
  clearMessages,
} from '@/slices/farmerWarehouseSlice/farmerWarehouse';
import AdminLayout from '@/components/layout/AdminLayout';

const FarmerWarehousePage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    requests,
    requestsPagination,
    requestsLoading,
    success,
    error,
  } = useAppSelector((state) => state.farmerWarehouseReducer);

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchFarmerWarehouseRequests({ page: 1, limit: 5 }));
  }, [dispatch]);

  useEffect(() => {
    // Clear messages after 5 seconds
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Schedule />;
      case 'approved':
        return <CheckCircle />;
      case 'rejected':
        return <Error />;
      case 'completed':
        return <CheckCircle />;
      default:
        return <Schedule />;
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'storage':
        return <Storage />;
      case 'retrieval':
        return <LocalShipping />;
      case 'inspection':
        return <Assessment />;
      default:
        return <Storage />;
    }
  };

  const handleViewRequest = (requestId: number) => {
    router.push(`/farmer-warehouse/requests/${requestId}`);
  };

  const handleCreateRequest = () => {
    router.push('/farmer-warehouse/requests/create');
  };

  const handleViewAllRequests = () => {
    router.push('/farmer-warehouse/requests');
  };

  const handleViewStorage = () => {
    router.push('/farmer-warehouse/storage');
  };



  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
            Farmer Warehouse Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your warehouse storage requests, track inventory, and monitor market prices
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

        {/* Quick Actions */}
        <Paper sx={{ p: 3, mb: 4, boxShadow: 'agriculture' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateRequest}
              sx={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                },
              }}
            >
              New Storage Request
            </Button>
            <Button
              variant="outlined"
              startIcon={<Storage />}
              onClick={handleViewStorage}
              sx={{ borderColor: 'primary.main', color: 'primary.main' }}
            >
              View Storage
            </Button>

          </Box>
        </Paper>

        {/* Statistics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main' }}>
                  {requestsPagination.total}
                </Typography>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                  <Warehouse sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total Requests
              </Typography>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 500 }}>
                {requestsPagination.total} requests
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: 'success.main' }}>
                  {requests.filter(r => r.status === 'approved').length}
                </Typography>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'success.main' }}>
                  <CheckCircle sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Approved Requests
              </Typography>
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 500 }}>
                {requests.filter(r => r.status === 'approved').length} approved
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%', cursor: 'pointer' }} onClick={handleViewStorage}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: 'info.main' }}>
                  <Storage sx={{ fontSize: 32 }} />
                </Typography>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'info.main' }}>
                  <Storage sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Storage Management
              </Typography>
              <Typography variant="caption" sx={{ color: 'info.main', fontWeight: 500 }}>
                Click to view storage
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Requests */}
        <Paper sx={{ p: 3, mb: 4, boxShadow: 'agriculture' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ color: 'primary.main' }}>
              Recent Requests
            </Typography>
            <Button
              variant="text"
              onClick={handleViewAllRequests}
              sx={{ color: 'primary.main' }}
            >
              View All
            </Button>
          </Box>

          {requestsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : requests.length > 0 ? (
            <Box>
              {requests.slice(0, 5).map((request) => (
                <Card key={request.id} sx={{ mb: 2, boxShadow: 'agriculture' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {getRequestTypeIcon(request.request_type)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {request.item_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {request.warehouse_name} • {request.request_type}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                          <Chip
                            label={`${request.quantity} units`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`${request.storage_duration_days} days`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            icon={getStatusIcon(request.status)}
                            label={request.status}
                            color={getStatusColor(request.status) as any}
                            size="small"
                          />
                        </Box>
                        {request.storage_requirements && (
                          <Typography variant="body2" color="text.secondary">
                            Requirements: {request.storage_requirements}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewRequest(request.id)}
                          sx={{ color: 'primary.main' }}
                        >
                          <Visibility />
                        </IconButton>
                        {request.qr_code_url && (
                          <IconButton
                            size="small"
                            sx={{ color: 'success.main' }}
                          >
                            <QrCode />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No warehouse requests found
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateRequest}
                sx={{ mt: 2 }}
              >
                Create Your First Request
              </Button>
            </Box>
          )}
        </Paper>

        {/* Storage Overview */}
        <Paper sx={{ p: 3, mb: 4, boxShadow: 'agriculture' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ color: 'primary.main' }}>
              Storage Overview
            </Typography>
            <Button
              variant="text"
              onClick={handleViewStorage}
              sx={{ color: 'primary.main' }}
            >
              View Full Storage
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Card sx={{ boxShadow: 'agriculture', bgcolor: 'success.light' }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Storage sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" fontWeight={600} color="success.main">
                  Active Storage
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Items currently in storage
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ boxShadow: 'agriculture', bgcolor: 'warning.light' }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Warning sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h6" fontWeight={600} color="warning.main">
                  Expiring Soon
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Items expiring within 30 days
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ boxShadow: 'agriculture', bgcolor: 'error.light' }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Error sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                <Typography variant="h6" fontWeight={600} color="error.main">
                  Expired Items
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Items that need attention
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Paper>

      </Box>
    </AdminLayout>
  );
};

export default FarmerWarehousePage;
