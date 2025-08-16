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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Pagination,
  Avatar,
  Badge,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Agriculture,
  CheckCircle,
  Cancel,
  Refresh,
  Build,
  Search,
  TrendingUp,
  Warning,
  Settings,
  Image,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/slices/store';
import {
  fetchEquipmentCategories,
  fetchEquipment,
  createEquipment,
  updateEquipment,
  activateEquipment,
  deactivateEquipment,
  clearMessages,
  setSearchParams,
} from '@/slices/machineRentalSlice/machineRental';
import { Equipment, EquipmentCreate, EquipmentUpdate } from '@/types/types';
import AdminLayout from '@/components/layout/AdminLayout';

const EquipmentPage = () => {
  const dispatch = useAppDispatch();
  const { 
    categories, 
    equipment, 
    equipmentPagination, 
    loading, 
    error, 
    success,
    searchParams 
  } = useAppSelector((state) => state.machineRentalReducer);
  
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [equipmentToView, setEquipmentToView] = useState<Equipment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<EquipmentCreate>({
    name: '',
    category_id: 0,
    description: '',
    daily_rate: 0,
    weekly_rate: 0,
    monthly_rate: 0,
    contact_number: '',
    delivery_fee: 0,
    security_deposit: 0,
    specifications: {},
    maintenance_notes: '',
    is_available: true,
    is_active: true,
    current_status: 'available',
  });

  useEffect(() => {
    fetchData();
  }, [currentPage]);

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
        dispatch(fetchEquipmentCategories({ page: 1, limit: 100 })),
        dispatch(fetchEquipment({ ...searchParams, page: currentPage, limit: 10 })),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  if (loading && equipment.length === 0) {
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
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
          Equipment Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage agricultural equipment, set rental rates, and monitor availability status.
        </Typography>

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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#2563eb' }}>
                  {equipment.length}
                </Typography>
                <Agriculture sx={{ fontSize: 24, color: '#2563eb' }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Equipment
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#059669' }}>
                  {equipment.filter(eq => eq.is_available && eq.current_status === 'available').length}
                </Typography>
                <CheckCircle sx={{ fontSize: 24, color: '#059669' }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Available Equipment
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#d97706' }}>
                  {equipment.filter(eq => eq.current_status === 'rented').length}
                </Typography>
                <TrendingUp sx={{ fontSize: 24, color: '#d97706' }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Currently Rented
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#dc2626' }}>
                  {equipment.filter(eq => eq.current_status === 'maintenance').length}
                </Typography>
                <Build sx={{ fontSize: 24, color: '#dc2626' }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Under Maintenance
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        {/* Search and Actions Bar */}
        <Paper sx={{ p: 3, mb: 3, boxShadow: 'agriculture' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
            <TextField
              fullWidth
              label="Search Equipment"
              value={searchParams.search || ''}
              onChange={(e) => {
                dispatch(setSearchParams({ search: e.target.value, page: 1 }));
                setCurrentPage(1);
                fetchData();
              }}
              placeholder="Search by name, description..."
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
                    category_id: value === '' ? undefined : Number(value), 
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
                value={searchParams.current_status || ''}
                onChange={(e) => {
                  dispatch(setSearchParams({ current_status: e.target.value === '' ? undefined : e.target.value, page: 1 }));
                  setCurrentPage(1);
                  fetchData();
                }}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="rented">Rented</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="out_of_service">Out of Service</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={600}>
              Equipment Management
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
                onClick={() => setFormOpen(true)}
                sx={{ 
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)' }
                }}
              >
                Add Equipment
              </Button>
            </Box>
          </Box>
        </Paper>
        
        {/* Equipment Table */}
        <Paper sx={{ boxShadow: 'agriculture' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Equipment</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Daily Rate</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Availability</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipment.map((equipment) => (
                  <TableRow key={equipment.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Badge
                          badgeContent={equipment.is_active ? 'Active' : 'Inactive'}
                          color={equipment.is_active ? 'success' : 'default'}
                        >
                          <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                            {equipment.equipment_image_url ? (
                              <Image sx={{ fontSize: 24 }} />
                            ) : (
                              <Agriculture sx={{ fontSize: 24 }} />
                            )}
                          </Avatar>
                        </Badge>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {equipment.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {equipment.description || 'No description'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {equipment.category_name || 'Unknown'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          Rs. {equipment.daily_rate}/day
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Rs. {equipment.weekly_rate}/week
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        icon={<Settings />}
                        label={equipment.current_status.charAt(0).toUpperCase() + equipment.current_status.slice(1)}
                        color="default"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        icon={equipment.is_available ? <CheckCircle /> : <Cancel />}
                        label={equipment.is_available ? 'Available' : 'Unavailable'}
                        color={equipment.is_available ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            sx={{ color: 'primary.main' }}
                            onClick={() => {
                              setEquipmentToView(equipment);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Edit Equipment">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setFormMode('edit');
                              setSelectedEquipment(equipment);
                              setFormData({
                                name: equipment.name,
                                category_id: equipment.category_id,
                                description: equipment.description || '',
                                daily_rate: equipment.daily_rate,
                                weekly_rate: equipment.weekly_rate,
                                monthly_rate: equipment.monthly_rate || 0,
                                contact_number: equipment.contact_number,
                                delivery_fee: equipment.delivery_fee,
                                security_deposit: equipment.security_deposit,
                                specifications: equipment.specifications || {},
                                maintenance_notes: equipment.maintenance_notes || '',
                                is_available: equipment.is_available,
                                is_active: equipment.is_active,
                                current_status: equipment.current_status,
                              });
                              setFormOpen(true);
                            }}
                            sx={{ color: 'primary.main' }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title={equipment.is_active ? 'Deactivate' : 'Activate'}>
                          <IconButton
                            size="small"
                            onClick={async () => {
                              try {
                                if (equipment.is_active) {
                                  await dispatch(deactivateEquipment(equipment.id));
                                } else {
                                  await dispatch(activateEquipment(equipment.id));
                                }
                                fetchData();
                              } catch (error) {
                                console.error('Error toggling status:', error);
                              }
                            }}
                            sx={{ color: equipment.is_active ? 'warning.main' : 'success.main' }}
                          >
                            {equipment.is_active ? <Cancel /> : <CheckCircle />}
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete Equipment">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEquipmentToDelete(equipment);
                              setDeleteDialogOpen(true);
                            }}
                            sx={{ color: 'error.main' }}
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
        {equipmentPagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={equipmentPagination.totalPages}
              page={currentPage}
              onChange={(event, page) => {
                setCurrentPage(page);
                dispatch(setSearchParams({ page }));
              }}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Box>

        {/* Create/Edit Equipment Dialog */}
        <Dialog
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setSelectedEquipment(null);
            setFormData({
              name: '',
              category_id: 0,
              description: '',
              daily_rate: 0,
              weekly_rate: 0,
              monthly_rate: 0,
              contact_number: '',
              delivery_fee: 0,
              security_deposit: 0,
              specifications: {},
              maintenance_notes: '',
              is_available: true,
              is_active: true,
              current_status: 'available',
            });
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2, boxShadow: 'agriculture-lg' }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: 'primary.50', 
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Agriculture sx={{ color: 'primary.main' }} />
            {formMode === 'create' ? 'Add New Equipment' : 'Edit Equipment'}
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Equipment Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., John Deere Tractor 5075E"
                required
              />
              
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: Number(e.target.value) }))}
                  label="Category"
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
                label="Daily Rate (Rs.)"
                type="number"
                value={formData.daily_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, daily_rate: Number(e.target.value) }))}
                required
              />
              
              <TextField
                fullWidth
                label="Weekly Rate (Rs.)"
                type="number"
                value={formData.weekly_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, weekly_rate: Number(e.target.value) }))}
                required
              />
              
              <TextField
                fullWidth
                label="Monthly Rate (Rs.)"
                type="number"
                value={formData.monthly_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, monthly_rate: Number(e.target.value) }))}
              />
              
              <TextField
                fullWidth
                label="Contact Number"
                value={formData.contact_number}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                placeholder="+91 98765 43210"
                required
              />
              
              <TextField
                fullWidth
                label="Delivery Fee (Rs.)"
                type="number"
                value={formData.delivery_fee}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_fee: Number(e.target.value) }))}
              />
              
              <TextField
                fullWidth
                label="Security Deposit (Rs.)"
                type="number"
                value={formData.security_deposit}
                onChange={(e) => setFormData(prev => ({ ...prev, security_deposit: Number(e.target.value) }))}
              />
              
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the equipment"
                multiline
                rows={3}
                sx={{ gridColumn: { xs: '1 / -1', md: '1 / -1' } }}
              />
              
              <TextField
                fullWidth
                label="Maintenance Notes"
                value={formData.maintenance_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, maintenance_notes: e.target.value }))}
                placeholder="Any maintenance requirements or notes"
                multiline
                rows={3}
                sx={{ gridColumn: { xs: '1 / -1', md: '1 / -1' } }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                    color="primary"
                  />
                }
                label="Available for Rent"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    color="primary"
                  />
                }
                label="Active Equipment"
              />
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={() => {
              setFormOpen(false);
              setSelectedEquipment(null);
              setFormData({
                name: '',
                category_id: 0,
                description: '',
                daily_rate: 0,
                weekly_rate: 0,
                monthly_rate: 0,
                contact_number: '',
                delivery_fee: 0,
                security_deposit: 0,
                specifications: {},
                maintenance_notes: '',
                is_available: true,
                is_active: true,
                current_status: 'available',
              });
            }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  if (formMode === 'create') {
                    await dispatch(createEquipment(formData));
                  } else if (selectedEquipment) {
                    const updateData: EquipmentUpdate = {
                      name: formData.name,
                      category_id: formData.category_id,
                      description: formData.description,
                      daily_rate: formData.daily_rate,
                      weekly_rate: formData.weekly_rate,
                      monthly_rate: formData.monthly_rate,
                      contact_number: formData.contact_number,
                      delivery_fee: formData.delivery_fee,
                      security_deposit: formData.security_deposit,
                      specifications: formData.specifications,
                      maintenance_notes: formData.maintenance_notes,
                      is_available: formData.is_available,
                      is_active: formData.is_active,
                      current_status: formData.current_status,
                    };
                    await dispatch(updateEquipment({ id: selectedEquipment.id, data: updateData }));
                  }
                  setFormOpen(false);
                  fetchData();
                } catch (error) {
                  console.error('Error submitting form:', error);
                }
              }}
              disabled={!formData.name || !formData.name.trim() || !formData.category_id || !formData.daily_rate || !formData.contact_number}
              sx={{ 
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)' }
              }}
            >
              {formMode === 'create' ? 'Add Equipment' : 'Update Equipment'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Delete Equipment</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to deactivate the equipment "{equipmentToDelete?.name}"? 
              This will make it unavailable for rental but won't affect existing rentals.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={async () => {
                if (equipmentToDelete) {
                  await dispatch(deactivateEquipment(equipmentToDelete.id));
                  setDeleteDialogOpen(false);
                  setEquipmentToDelete(null);
                  fetchData();
                }
              }} 
              variant="contained" 
              color="error"
            >
              Deactivate Equipment
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Equipment Details Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2, boxShadow: 'agriculture-lg' }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: 'primary.50', 
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Agriculture sx={{ color: 'primary.main' }} />
            Equipment Details
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            {equipmentToView && (
              <Box sx={{ display: 'grid', gap: 3 }}>
                {/* Equipment Image */}
                {equipmentToView.equipment_image_url && (
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <img 
                      src={equipmentToView.equipment_image_url} 
                      alt={equipmentToView.name}
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px', 
                        objectFit: 'contain',
                        borderRadius: '8px'
                      }}
                    />
                  </Box>
                )}

                {/* Basic Information */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Basic Information
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Name</Typography>
                        <Typography variant="body1" fontWeight={500}>{equipmentToView.name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Category</Typography>
                        <Typography variant="body1" fontWeight={500}>{equipmentToView.category_name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Description</Typography>
                        <Typography variant="body1">{equipmentToView.description || 'No description available'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Contact Number</Typography>
                        <Typography variant="body1" fontWeight={500}>{equipmentToView.contact_number}</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Status & Availability
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Current Status</Typography>
                        <Chip
                          label={equipmentToView.current_status.charAt(0).toUpperCase() + equipmentToView.current_status.slice(1)}
                          color={equipmentToView.current_status === 'available' ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Availability</Typography>
                        <Chip
                          icon={equipmentToView.is_available ? <CheckCircle /> : <Cancel />}
                          label={equipmentToView.is_available ? 'Available' : 'Unavailable'}
                          color={equipmentToView.is_available ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Active Status</Typography>
                        <Chip
                          icon={equipmentToView.is_active ? <CheckCircle /> : <Cancel />}
                          label={equipmentToView.is_active ? 'Active' : 'Inactive'}
                          color={equipmentToView.is_active ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Pricing Information */}
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Pricing Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Daily Rate</Typography>
                      <Typography variant="h6" fontWeight={600} color="primary.main">
                        Rs. {equipmentToView.daily_rate}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Weekly Rate</Typography>
                      <Typography variant="h6" fontWeight={600} color="primary.main">
                        Rs. {equipmentToView.weekly_rate}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Monthly Rate</Typography>
                      <Typography variant="h6" fontWeight={600} color="primary.main">
                        Rs. {equipmentToView.monthly_rate || 'Not available'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Additional Costs */}
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Additional Costs
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Delivery Fee</Typography>
                      <Typography variant="h6" fontWeight={600} color="warning.main">
                        Rs. {equipmentToView.delivery_fee}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Security Deposit</Typography>
                      <Typography variant="h6" fontWeight={600} color="warning.main">
                        Rs. {equipmentToView.security_deposit}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Specifications */}
                {equipmentToView.specifications && Object.keys(equipmentToView.specifications).length > 0 && (
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Technical Specifications
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                      {Object.entries(equipmentToView.specifications).map(([key, value]) => (
                        <Box key={key} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            {key.replace(/_/g, ' ')}
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {String(value)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Maintenance Notes */}
                {equipmentToView.maintenance_notes && (
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Maintenance Notes
                    </Typography>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body1">{equipmentToView.maintenance_notes}</Typography>
                    </Box>
                  </Box>
                )}

                {/* Timestamps */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Created</Typography>
                    <Typography variant="body1">
                      {new Date(equipmentToView.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                    <Typography variant="body1">
                      {new Date(equipmentToView.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button
              variant="contained"
              onClick={() => {
                if (equipmentToView) {
                  setFormMode('edit');
                  setSelectedEquipment(equipmentToView);
                  setFormData({
                    name: equipmentToView.name,
                    category_id: equipmentToView.category_id,
                    description: equipmentToView.description || '',
                    daily_rate: equipmentToView.daily_rate,
                    weekly_rate: equipmentToView.weekly_rate,
                    monthly_rate: equipmentToView.monthly_rate || 0,
                    contact_number: equipmentToView.contact_number,
                    delivery_fee: equipmentToView.delivery_fee,
                    security_deposit: equipmentToView.security_deposit,
                    specifications: equipmentToView.specifications || {},
                    maintenance_notes: equipmentToView.maintenance_notes || '',
                    is_available: equipmentToView.is_available,
                    is_active: equipmentToView.is_active,
                    current_status: equipmentToView.current_status,
                  });
                  setViewDialogOpen(false);
                  setFormOpen(true);
                }
              }}
              sx={{ 
                background: 'linear-gradient(135deg, #52B788 0%, #16a34a 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #45a077 0%, #138a3a 100%)' }
              }}
            >
              Edit Equipment
            </Button>
          </DialogActions>
        </Dialog>
    </AdminLayout>
  );
};

export default EquipmentPage;
