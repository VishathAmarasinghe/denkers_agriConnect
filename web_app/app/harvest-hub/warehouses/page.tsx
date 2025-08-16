'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Refresh,
  Storage,
  CheckCircle,
  Cancel,
  Warning,
  Security,
  Person,
  Settings,
  Info,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/slices/store';
import {
  fetchWarehouses,
  fetchWarehouseCategories,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  clearMessages,
  setSearchParams,
} from '@/slices/warehouseSlice/warehouse';
import { Warehouse, WarehouseCreateData } from '@/types/types';
import AdminLayout from '@/components/layout/AdminLayout';

const WarehousesPage = () => {
  const dispatch = useAppDispatch();
  const { 
    warehouses, 
    warehousesPagination, 
    categories,
    warehousesLoading: loading, 
    error, 
    success, 
    searchParams 
  } = useAppSelector((state) => state.warehouseReducer);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [warehouseToView, setWarehouseToView] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState<WarehouseCreateData>({
    name: '',
    contact_person_name: '',
    contact_person_number: '',
    warehouse_status: 'open',
    fixed_space_amount: 0,
    temperature_range: '',
    security_level: 'medium',
    description: '',
    category_id: 0,
    address: '',
    province_id: 0,
    district_id: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
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
        dispatch(fetchWarehouses({ ...searchParams, page: currentPage, limit: 10 })),
        dispatch(fetchWarehouseCategories({ page: 1, limit: 100 })),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreateWarehouse = () => {
    setFormMode('create');
    setSelectedWarehouse(null);
    setFormData({
      name: '',
      contact_person_name: '',
      contact_person_number: '',
      warehouse_status: 'open',
      fixed_space_amount: 0,
      temperature_range: '',
      security_level: 'medium',
      description: '',
      category_id: 0,
      address: '',
      province_id: 0,
      district_id: 0,
    });
    setFormOpen(true);
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setFormMode('edit');
    setSelectedWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      contact_person_name: warehouse.contact_person_name,
      contact_person_number: warehouse.contact_person_number,
      warehouse_status: warehouse.warehouse_status,
      fixed_space_amount: warehouse.fixed_space_amount,
      temperature_range: warehouse.temperature_range || '',
      security_level: warehouse.security_level,
      description: warehouse.description || '',
      category_id: warehouse.category_id,
      address: warehouse.address,
      province_id: warehouse.province_id,
      district_id: warehouse.district_id,
    });
    setFormOpen(true);
  };

  const handleDeleteWarehouse = (warehouse: Warehouse) => {
    setWarehouseToDelete(warehouse);
    setDeleteDialogOpen(true);
  };

  const handleViewWarehouse = (warehouse: Warehouse) => {
    setWarehouseToView(warehouse);
    setViewDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (warehouseToDelete) {
      try {
        await dispatch(deleteWarehouse(warehouseToDelete.id!));
        setDeleteDialogOpen(false);
        setWarehouseToDelete(null);
        fetchData();
      } catch (error) {
        console.error('Error deleting warehouse:', error);
      }
    }
  };

  const handleFormSubmit = async () => {
    if (!formData.name || !formData.name.trim() || !formData.contact_person_name || !formData.contact_person_name.trim() || !formData.contact_person_number || !formData.contact_person_number.trim()) return;

    try {
      if (formMode === 'create') {
        await dispatch(createWarehouse(formData));
      } else if (selectedWarehouse) {
        await dispatch(updateWarehouse({ id: selectedWarehouse.id!, data: formData }));
      }
      setFormOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving warehouse:', error);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedWarehouse(null);
  };

  const handleSearch = (searchTerm: string) => {
    dispatch(setSearchParams({ name: searchTerm, page: 1 }));
    setCurrentPage(1);
    fetchData();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    dispatch(setSearchParams({ page }));
    fetchData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'closed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <CheckCircle />;
      case 'closed':
        return <Cancel />;
      default:
        return <Warning />;
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1, color: 'primary.main' }}>
            Warehouse Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage warehouse facilities, storage capacity, and operational settings
          </Typography>
        </Box>

        {/* Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <Card sx={{ boxShadow: 'agriculture', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
            <CardContent sx={{ textAlign: 'center', color: 'white' }}>
              <Storage sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {warehouses.length}
              </Typography>
              <Typography variant="body2">Total Warehouses</Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
            <CardContent sx={{ textAlign: 'center', color: 'white' }}>
              <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {warehouses.filter(w => w.warehouse_status === 'open').length}
              </Typography>
              <Typography variant="body2">Open Warehouses</Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
            <CardContent sx={{ textAlign: 'center', color: 'white' }}>
              <Cancel sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {warehouses.filter(w => w.warehouse_status === 'closed').length}
              </Typography>
              <Typography variant="body2">Closed Warehouses</Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
            <CardContent sx={{ textAlign: 'center', color: 'white' }}>
              <Security sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {warehouses.filter(w => w.security_level === 'high').length}
              </Typography>
              <Typography variant="body2">High Security</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Search and Actions Bar */}
        <Paper sx={{ p: 3, mb: 3, boxShadow: 'agriculture' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
            <TextField
              fullWidth
              label="Search Warehouses"
              value={searchParams.name || ''}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name, contact person..."
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={searchParams.category_id ? String(searchParams.category_id) : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  dispatch(setSearchParams({ 
                    category_id: value ? parseInt(value) : undefined, 
                    page: 1 
                  }));
                  setCurrentPage(1);
                  fetchData();
                }}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={searchParams.warehouse_status ? searchParams.warehouse_status : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  let status: 'open' | 'closed' | undefined;
                  if (value === 'open') status = 'open';
                  else if (value === 'closed') status = 'closed';
                  else status = undefined;
                  
                  dispatch(setSearchParams({ 
                    warehouse_status: status, 
                    page: 1 
                  }));
                  setCurrentPage(1);
                  fetchData();
                }}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={600}>
              Warehouse Management
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchData}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateWarehouse}
                sx={{ 
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)' }
                }}
              >
                Add Warehouse
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Warehouses Table */}
        <Paper sx={{ boxShadow: 'agriculture' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Warehouse</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Capacity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Security</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {warehouses.map((warehouse) => (
                  <TableRow key={warehouse.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                          <Storage sx={{ fontSize: 24 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {warehouse.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {warehouse.address}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {categories.find(cat => cat.id === warehouse.category_id)?.name || `Category ID: ${warehouse.category_id}`}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {warehouse.contact_person_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {warehouse.contact_person_number}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {warehouse.fixed_space_amount.toLocaleString()} kg
                        </Typography>
                        {warehouse.temperature_range && (
                          <Typography variant="caption" color="text.secondary">
                            {warehouse.temperature_range}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={warehouse.warehouse_status}
                        color={getStatusColor(warehouse.warehouse_status)}
                        size="small"
                        icon={getStatusIcon(warehouse.warehouse_status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={warehouse.security_level}
                        color={getSecurityLevelColor(warehouse.security_level)}
                        size="small"
                        icon={<Security />}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            sx={{ color: 'primary.main' }}
                            onClick={() => handleViewWarehouse(warehouse)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Edit Warehouse">
                          <IconButton 
                            size="small" 
                            sx={{ color: 'info.main' }}
                            onClick={() => handleEditWarehouse(warehouse)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete Warehouse">
                          <IconButton 
                            size="small" 
                            sx={{ color: 'error.main' }}
                            onClick={() => handleDeleteWarehouse(warehouse)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Pagination */}
        {warehousesPagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={warehousesPagination.totalPages}
              page={currentPage}
              onChange={(event, page) => handlePageChange(page)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Empty State */}
        {!loading && warehouses.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 4, p: 4 }}>
            <Storage sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No Warehouses Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start by creating your first warehouse facility
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateWarehouse}
              sx={{ 
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)' }
              }}
            >
              Create First Warehouse
            </Button>
          </Box>
        )}

        {/* Create/Edit Warehouse Dialog */}
        <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="md" fullWidth>
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: 'white'
          }}>
            <Storage sx={{ color: 'white' }} />
            {formMode === 'create' ? 'Add New Warehouse' : 'Edit Warehouse'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Warehouse Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Central Cold Storage Facility"
                required
                autoFocus
              />
              
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: Number(e.target.value) }))}
                  label="Category"
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Contact Person Name"
                value={formData.contact_person_name}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_person_name: e.target.value }))}
                placeholder="e.g., John Manager"
                required
              />
              
              <TextField
                fullWidth
                label="Contact Phone Number"
                value={formData.contact_person_number}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_person_number: e.target.value }))}
                placeholder="+94 71 234 5678"
                required
              />
              
              <TextField
                fullWidth
                label="Fixed Space Amount (kg)"
                type="number"
                value={formData.fixed_space_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, fixed_space_amount: Number(e.target.value) }))}
                placeholder="10000"
                required
              />
              
              <TextField
                fullWidth
                label="Temperature Range"
                value={formData.temperature_range}
                onChange={(e) => setFormData(prev => ({ ...prev, temperature_range: e.target.value }))}
                placeholder="e.g., -18°C to -22°C"
              />
              
              <FormControl fullWidth>
                <InputLabel>Security Level</InputLabel>
                <Select
                  value={formData.security_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, security_level: e.target.value as 'high' | 'medium' | 'low' }))}
                  label="Security Level"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.warehouse_status}
                  onChange={(e) => setFormData(prev => ({ ...prev, warehouse_status: e.target.value as 'open' | 'closed' }))}
                  label="Status"
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Full warehouse address"
                required
                sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}
              />
              
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about the warehouse"
                multiline
                rows={3}
                sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={handleCloseForm} variant="outlined">
              Cancel
            </Button>
            <Button 
              onClick={handleFormSubmit} 
              variant="contained"
              disabled={!formData.name || !formData.name.trim() || !formData.contact_person_name || !formData.contact_person_name.trim() || !formData.contact_person_number || !formData.contact_person_number.trim()}
              sx={{ 
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)' }
              }}
            >
              {formMode === 'create' ? 'Create Warehouse' : 'Update Warehouse'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: 'error.main' }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete the warehouse "{warehouseToDelete?.name}"?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone. All associated inventory and bookings will be affected.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete} 
              variant="contained" 
              color="error"
              sx={{ 
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)' }
              }}
            >
              Delete Warehouse
            </Button>
          </DialogActions>
        </Dialog>

        {/* Warehouse View Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white'
          }}>
            <Storage sx={{ color: 'white' }} />
            Warehouse Details
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {warehouseToView && (
              <Box sx={{ display: 'grid', gap: 3 }}>
                {/* Header Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                  <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
                    <Storage sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      {warehouseToView.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {warehouseToView.address}
                    </Typography>
                    <Chip
                      label={warehouseToView.warehouse_status}
                      color={getStatusColor(warehouseToView.warehouse_status)}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>

                {/* Details Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                  {/* Contact Information */}
                  <Paper sx={{ p: 3, boxShadow: 'agriculture' }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 20 }} />
                      Contact Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Contact Person</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {warehouseToView.contact_person_name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {warehouseToView.contact_person_number}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  {/* Warehouse Specifications */}
                  <Paper sx={{ p: 3, boxShadow: 'agriculture' }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Settings sx={{ fontSize: 20 }} />
                      Specifications
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Category</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {categories.find(cat => cat.id === warehouseToView.category_id)?.name || `Category ID: ${warehouseToView.category_id}`}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Capacity</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {warehouseToView.fixed_space_amount.toLocaleString()} kg
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Security Level</Typography>
                        <Chip
                          label={warehouseToView.security_level}
                          color={getSecurityLevelColor(warehouseToView.security_level)}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Paper>

                  {/* Additional Details */}
                  <Paper sx={{ p: 3, boxShadow: 'agriculture', gridColumn: { xs: '1 / -1', md: '1 / -1' } }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Info sx={{ fontSize: 20 }} />
                      Additional Details
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {warehouseToView.temperature_range && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">Temperature Range</Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {warehouseToView.temperature_range}
                          </Typography>
                        </Box>
                      )}
                      {warehouseToView.description && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">Description</Typography>
                          <Typography variant="body1">
                            {warehouseToView.description}
                          </Typography>
                        </Box>
                      )}
                      <Box>
                        <Typography variant="body2" color="text.secondary">Created</Typography>
                        <Typography variant="body1">
                          {warehouseToView.created_at ? new Date(warehouseToView.created_at).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                        <Typography variant="body1">
                          {warehouseToView.updated_at ? new Date(warehouseToView.updated_at).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={() => setViewDialogOpen(false)} variant="outlined">
              Close
            </Button>
            <Button 
              onClick={() => {
                if (warehouseToView) {
                  handleEditWarehouse(warehouseToView);
                  setViewDialogOpen(false);
                }
              }} 
              variant="contained"
              sx={{ 
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)' }
              }}
            >
              Edit Warehouse
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default WarehousesPage;
