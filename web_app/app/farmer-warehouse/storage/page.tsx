'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import {
  Storage,
  Warning,
  Error,
  Add,
  Visibility,
  Edit,
  QrCode,
  LocalShipping,
  Assessment,
  CalendarToday,
  Scale,
  Person,
  Business,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/slices/store';
import {
  fetchFarmerStorage,
  fetchStorageSummary,
  fetchExpiringStorage,
  fetchExpiredStorage,
  clearMessages,
} from '@/slices/farmerWarehouseSlice/farmerWarehouse';
import AdminLayout from '@/components/layout/AdminLayout';
import { ServiceBaseUrl } from '@/config/config';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`storage-tabpanel-${index}`}
      aria-labelledby={`storage-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const StoragePage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    storage,
    storagePagination,
    storageLoading,
    storageSummary,
    storageSummaryLoading,
    expiringStorage,
    expiringStorageLoading,
    expiredStorage,
    expiredStorageLoading,
    success,
    error,
  } = useAppSelector((state) => state.farmerWarehouseReducer);

  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingFarmers, setLoadingFarmers] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Form data for adding storage item
  const [formData, setFormData] = useState({
    warehouse_id: '',
    farmer_id: '',
    item_name: '',
    quantity: '',
    unit: 'kg',
    location: '',
    stored_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    product_owner: '',
    item_condition: 'good',
    storage_type: 'temporary',
    storage_duration_days: '',
    current_market_price: '',
    auto_sell_on_expiry: true,
    expiry_action: 'auto_sell',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    // Fetch initial data based on user role
    dispatch(fetchFarmerStorage({ page: 1, limit: 10 }));
    dispatch(fetchStorageSummary());
    dispatch(fetchExpiringStorage({ page: 1, limit: 10 }));
    dispatch(fetchExpiredStorage({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Fetch warehouses and farmers for the form
  useEffect(() => {
    if (isAdmin && addItemDialogOpen) {
      fetchWarehouses();
      fetchFarmers();
    }
  }, [isAdmin, addItemDialogOpen]);

  const fetchWarehouses = async () => {
    setLoadingWarehouses(true);
    try {
      const response = await fetch(`${ServiceBaseUrl}/api/v1/warehouse`);
      const data = await response.json();
      if (data.success) {
        // Handle nested data structure: data.data.data
        const warehousesData = data.data?.data || data.data || [];
        setWarehouses(warehousesData);
        console.log('Warehouses fetched:', warehousesData);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const fetchFarmers = async () => {
    setLoadingFarmers(true);
    try {
      const response = await fetch(`${ServiceBaseUrl}/api/v1/users/farmers`);
      const data = await response.json();
      if (data.success) {
        // Handle nested data structure: data.data.data
        const farmersData = data.data?.data || data.data || [];
        setFarmers(farmersData);
        console.log('Farmers fetched:', farmersData);
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoadingFarmers(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.warehouse_id) errors.warehouse_id = 'Warehouse is required';
    if (!formData.farmer_id) errors.farmer_id = 'Farmer is required';
    if (!formData.item_name?.trim()) errors.item_name = 'Item name is required';
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) errors.quantity = 'Valid quantity is required';
    if (!formData.stored_date) errors.stored_date = 'Storage date is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const submitData = {
        ...formData,
        warehouse_id: parseInt(formData.warehouse_id),
        farmer_id: parseInt(formData.farmer_id),
        quantity: parseFloat(formData.quantity),
        storage_duration_days: formData.storage_duration_days ? parseInt(formData.storage_duration_days) : undefined,
        current_market_price: formData.current_market_price ? parseFloat(formData.current_market_price) : undefined,
      };

      const response = await fetch(`${ServiceBaseUrl}/api/v1/farmer-warehouse/storage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        // Close dialog and refresh data
        setAddItemDialogOpen(false);
        resetForm();
        dispatch(fetchFarmerStorage({ page: 1, limit: 10 }));
        dispatch(fetchStorageSummary());
        // Show success message
        alert('Storage item added successfully!');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error adding storage item:', error);
      alert('Failed to add storage item. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      warehouse_id: '',
      farmer_id: '',
      item_name: '',
      quantity: '',
      unit: 'kg',
      location: '',
      stored_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      product_owner: '',
      item_condition: 'good',
      storage_type: 'temporary',
      storage_duration_days: '',
      current_market_price: '',
      auto_sell_on_expiry: true,
      expiry_action: 'auto_sell',
      notes: '',
    });
    setFormErrors({});
  };

  const handleOpenAddDialog = () => {
    setAddItemDialogOpen(true);
  };

  useEffect(() => {
    // Clear messages after 5 seconds
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    dispatch(fetchFarmerStorage({ page: newPage + 1, limit: rowsPerPage }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    dispatch(fetchFarmerStorage({ page: 1, limit: parseInt(event.target.value, 10) }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expiring_soon':
        return 'warning';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Storage />;
      case 'expiring_soon':
        return <Warning />;
      case 'expired':
        return <Error />;
      default:
        return <Storage />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
            Storage Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isAdmin 
              ? 'Manage all farmer storage items, monitor expiring items, and track inventory'
              : 'View your storage items, track expiring dates, and manage inventory'
            }
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

        {/* Storage Summary Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main' }}>
                  {storagePagination?.total || 0}
                </Typography>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                  <Storage sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total Items
              </Typography>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 500 }}>
                In storage
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: 'success.main' }}>
                  {storageSummary?.total_quantity || 0}
                </Typography>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'success.main' }}>
                  <Scale sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total Quantity
              </Typography>
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 500 }}>
                Units stored
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: 'warning.main' }}>
                  {expiringStorage?.length || 0}
                </Typography>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'warning.main' }}>
                  <Warning sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Expiring Soon
              </Typography>
              <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 500 }}>
                Within 30 days
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: 'error.main' }}>
                  {expiredStorage?.length || 0}
                </Typography>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'error.main' }}>
                  <Error sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Expired Items
              </Typography>
              <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 500 }}>
                Need attention
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Tabs for different storage views */}
        <Paper sx={{ boxShadow: 'agriculture' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="storage tabs">
              <Tab label="All Storage Items" />
              <Tab label="Expiring Soon" />
              <Tab label="Expired Items" />
            </Tabs>
          </Box>

          {/* All Storage Items Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ color: 'primary.main' }}>
                All Storage Items
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleOpenAddDialog}
                  sx={{ 
                    bgcolor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  Add Storage Item
                </Button>
                <Button
                  variant="text"
                  onClick={() => router.push('/farmer-warehouse/requests')}
                  sx={{ color: 'primary.main' }}
                >
                  View Requests
                </Button>
              </Box>
            </Box>

            {storageLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : storage && storage.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Farmer</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Storage Date</TableCell>
                      <TableCell>Expiry Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {storage.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              <Storage sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {item.item_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.item_type}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.farmer_name || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.quantity} {item.unit}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(item.storage_date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(item.expiry_date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.status}
                            size="small"
                            color={getStatusColor(item.status) as any}
                            icon={getStatusIcon(item.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/farmer-warehouse/storage/view/${item.id}`)}
                              sx={{ color: 'primary.main' }}
                            >
                              <Visibility />
                            </IconButton>
                            {isAdmin && (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => router.push(`/farmer-warehouse/storage/edit/${item.id}`)}
                                  sx={{ color: 'info.main' }}
                                >
                                  <Edit />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => router.push(`/farmer-warehouse/storage/qr/${item.id}`)}
                                  sx={{ color: 'success.main' }}
                                >
                                  <QrCode />
                                </IconButton>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={storagePagination?.total || 0}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  No storage items found
                </Typography>
              </Box>
            )}
          </TabPanel>

          {/* Expiring Soon Tab */}
          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" fontWeight={600} sx={{ color: 'warning.main', mb: 3 }}>
              Items Expiring Soon
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Items expiring within the next 30 days
            </Typography>
            
            {expiringStorageLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : expiringStorage && expiringStorage.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Farmer</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Expiry Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expiringStorage.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'warning.main' }}>
                              <Warning sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {item.item_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.item_type}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.farmer_name || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.quantity} {item.unit}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(item.expiry_date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/farmer-warehouse/storage/view/${item.id}`)}
                              sx={{ color: 'primary.main' }}
                            >
                              <Visibility />
                            </IconButton>
                            {isAdmin && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => router.push(`/farmer-warehouse/storage/process/${item.id}`)}
                                sx={{ borderColor: 'warning.main', color: 'warning.main' }}
                              >
                                Process
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  No items expiring soon
                </Typography>
              </Box>
            )}
          </TabPanel>

          {/* Expired Items Tab */}
          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" fontWeight={600} sx={{ color: 'error.main', mb: 3 }}>
              Expired Items
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Items that have passed their expiry date
            </Typography>
            
            {expiredStorageLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : expiredStorage && expiredStorage.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Farmer</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Expiry Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expiredStorage.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'error.main' }}>
                              <Error sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {item.item_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.item_type}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.farmer_name || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.quantity} {item.unit}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(item.expiry_date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/farmer-warehouse/storage/view/${item.id}`)}
                              sx={{ color: 'primary.main' }}
                            >
                              <Visibility />
                            </IconButton>
                            {isAdmin && (
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                onClick={() => router.push(`/farmer-warehouse/storage/process/${item.id}`)}
                              >
                                Process
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  No expired items found
                </Typography>
              </Box>
            )}
          </TabPanel>
        </Paper>

        {/* Add Storage Item Dialog */}
        <Dialog
          open={addItemDialogOpen}
          onClose={() => setAddItemDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: 'success.main' }}>
                <Add sx={{ fontSize: 20 }} />
              </Avatar>
              <Typography variant="h6">Add Storage Item</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                {/* Warehouse Selection */}
                <Box>
                  <FormControl fullWidth error={!!formErrors.warehouse_id}>
                    <InputLabel>Warehouse *</InputLabel>
                    <Select
                      value={formData.warehouse_id}
                      onChange={(e) => handleInputChange('warehouse_id', e.target.value)}
                      label="Warehouse *"
                      disabled={loadingWarehouses}
                    >
                      {loadingWarehouses ? (
                        <MenuItem disabled>Loading warehouses...</MenuItem>
                      ) : Array.isArray(warehouses) && warehouses.length > 0 ? (
                        warehouses.map((warehouse) => (
                          <MenuItem key={warehouse.id} value={warehouse.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Business sx={{ fontSize: 16 }} />
                              {warehouse.name}
                            </Box>
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          {Array.isArray(warehouses) ? `No warehouses available (${warehouses.length})` : `Warehouses not loaded (${typeof warehouses})`}
                        </MenuItem>
                      )}
                    </Select>
                    {formErrors.warehouse_id && (
                      <FormHelperText>{formErrors.warehouse_id}</FormHelperText>
                    )}
                  </FormControl>
                </Box>

                {/* Farmer Selection */}
                <Box>
                  <FormControl fullWidth error={!!formErrors.farmer_id}>
                    <InputLabel>Farmer *</InputLabel>
                    <Select
                      value={formData.farmer_id}
                      onChange={(e) => handleInputChange('farmer_id', e.target.value)}
                      label="Farmer *"
                      disabled={loadingFarmers}
                    >
                      {loadingFarmers ? (
                        <MenuItem disabled>Loading farmers...</MenuItem>
                      ) : Array.isArray(farmers) && farmers.length > 0 ? (
                        farmers.map((farmer) => (
                          <MenuItem key={farmer.id} value={farmer.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Person sx={{ fontSize: 16 }} />
                              {farmer.first_name && farmer.last_name ? `${farmer.first_name} ${farmer.last_name}` : farmer.username}
                            </Box>
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          {Array.isArray(farmers) ? `No farmers available (${farmers.length})` : `Farmers not loaded (${typeof farmers})`}
                        </MenuItem>
                      )}
                    </Select>
                    {formErrors.farmer_id && (
                      <FormHelperText>{formErrors.farmer_id}</FormHelperText>
                    )}
                  </FormControl>
                </Box>

                {/* Item Name */}
                <Box>
                  <TextField
                    fullWidth
                    label="Item Name *"
                    value={formData.item_name}
                    onChange={(e) => handleInputChange('item_name', e.target.value)}
                    error={!!formErrors.item_name}
                    helperText={formErrors.item_name}
                    placeholder="e.g., Rice, Wheat, Corn"
                  />
                </Box>

                {/* Quantity */}
                <Box>
                  <TextField
                    fullWidth
                    label="Quantity *"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    error={!!formErrors.quantity}
                    helperText={formErrors.quantity}
                    placeholder="0.00"
                    InputProps={{
                      endAdornment: (
                        <FormControl sx={{ minWidth: 80 }}>
                          <Select
                            value={formData.unit}
                            onChange={(e) => handleInputChange('unit', e.target.value)}
                            size="small"
                          >
                            <MenuItem value="kg">kg</MenuItem>
                            <MenuItem value="tons">tons</MenuItem>
                            <MenuItem value="bags">bags</MenuItem>
                            <MenuItem value="units">units</MenuItem>
                          </Select>
                        </FormControl>
                      ),
                    }}
                  />
                </Box>

                {/* Storage Date */}
                <Box>
                  <TextField
                    fullWidth
                    label="Storage Date *"
                    type="date"
                    value={formData.stored_date}
                    onChange={(e) => handleInputChange('stored_date', e.target.value)}
                    error={!!formErrors.stored_date}
                    helperText={formErrors.stored_date}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>

                {/* Expiry Date */}
                <Box>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    helperText="Leave empty for 90 days from storage date"
                  />
                </Box>

                {/* Location */}
                <Box>
                  <TextField
                    fullWidth
                    label="Storage Location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Section A, Rack 3"
                  />
                </Box>

                {/* Item Condition */}
                <Box>
                  <FormControl fullWidth>
                    <InputLabel>Item Condition</InputLabel>
                    <Select
                      value={formData.item_condition}
                      onChange={(e) => handleInputChange('item_condition', e.target.value)}
                      label="Item Condition"
                    >
                      <MenuItem value="good">Good</MenuItem>
                      <MenuItem value="moderate">Moderate</MenuItem>
                      <MenuItem value="poor">Poor</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Storage Type */}
                <Box>
                  <FormControl fullWidth>
                    <InputLabel>Storage Type</InputLabel>
                    <Select
                      value={formData.storage_type}
                      onChange={(e) => handleInputChange('storage_type', e.target.value)}
                      label="Storage Type"
                    >
                      <MenuItem value="temporary">Temporary</MenuItem>
                      <MenuItem value="long_term">Long Term</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Market Price */}
                <Box>
                  <TextField
                    fullWidth
                    label="Current Market Price (Rs.)"
                    type="number"
                    value={formData.current_market_price}
                    onChange={(e) => handleInputChange('current_market_price', e.target.value)}
                    placeholder="0.00"
                    helperText="Price per unit"
                  />
                </Box>

                {/* Auto Sell on Expiry */}
                <Box>
                  <FormControl fullWidth>
                    <InputLabel>Expiry Action</InputLabel>
                    <Select
                      value={formData.expiry_action}
                      onChange={(e) => handleInputChange('expiry_action', e.target.value)}
                      label="Expiry Action"
                    >
                      <MenuItem value="auto_sell">Auto Sell</MenuItem>
                      <MenuItem value="notify_farmer">Notify Farmer</MenuItem>
                      <MenuItem value="manual_handling">Manual Handling</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Notes */}
                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  <TextField
                    fullWidth
                    label="Notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    multiline
                    rows={3}
                    placeholder="Additional notes about the storage item..."
                  />
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddItemDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
            >
              Add Item
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default StoragePage;
