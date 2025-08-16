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
  Snackbar,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Avatar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Category,
  CheckCircle,
  Cancel,
  Refresh,
  Build,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/slices/store';
import {
  fetchEquipmentCategories,
  createEquipmentCategory,
  updateEquipmentCategory,
  activateEquipmentCategory,
  deactivateEquipmentCategory,
  clearMessages,
} from '@/slices/machineRentalSlice/machineRental';
import { EquipmentCategory, EquipmentCategoryCreate, EquipmentCategoryUpdate } from '@/types/types';
import AdminLayout from '@/components/layout/AdminLayout';

const EquipmentCategoriesPage = () => {
  const dispatch = useAppDispatch();
  const { categories, loading, error, success } = useAppSelector((state) => state.machineRentalReducer);
  
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<EquipmentCategory | null>(null);
  const [formData, setFormData] = useState<EquipmentCategoryCreate>({
    name: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    dispatch(fetchEquipmentCategories({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    // Auto-hide success/error messages after 5 seconds
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  const handleCreateCategory = () => {
    setFormMode('create');
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
      is_active: true,
    });
    setFormOpen(true);
  };

  const handleEditCategory = (category: EquipmentCategory) => {
    setFormMode('edit');
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      is_active: category.is_active,
    });
    setFormOpen(true);
  };

  const handleDeleteCategory = (category: EquipmentCategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      // For now, we'll deactivate instead of delete
      await dispatch(deactivateEquipmentCategory(categoryToDelete.id));
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleFormSubmit = async () => {
    try {
      if (formMode === 'create') {
        await dispatch(createEquipmentCategory(formData));
      } else if (selectedCategory) {
        const updateData: EquipmentCategoryUpdate = {
          name: formData.name,
          description: formData.description,
          is_active: formData.is_active,
        };
        await dispatch(updateEquipmentCategory({ id: selectedCategory.id, data: updateData }));
      }
      setFormOpen(false);
      // Refresh the list
      dispatch(fetchEquipmentCategories({ page: 1, limit: 100 }));
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
      is_active: true,
    });
  };

  const handleToggleStatus = async (category: EquipmentCategory) => {
    try {
      if (category.is_active) {
        await dispatch(deactivateEquipmentCategory(category.id));
      } else {
        await dispatch(activateEquipmentCategory(category.id));
      }
      // Refresh the list
      dispatch(fetchEquipmentCategories({ page: 1, limit: 100 }));
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const stats = [
    {
      title: 'Total Categories',
      value: categories.length,
      icon: <Category sx={{ fontSize: 24, color: '#52B788' }} />,
      color: '#52B788',
    },
    {
      title: 'Active Categories',
      value: categories.filter(cat => cat.is_active).length,
      icon: <CheckCircle sx={{ fontSize: 24, color: '#059669' }} />,
      color: '#059669',
    },
    {
      title: 'Inactive Categories',
      value: categories.filter(cat => !cat.is_active).length,
      icon: <Cancel sx={{ fontSize: 24, color: '#dc2626' }} />,
      color: '#dc2626',
    },
  ];

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
            Equipment Categories
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage equipment categories for agricultural machinery and tools.
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
          {stats.map((stat, index) => (
            <Card key={index} sx={{ boxShadow: 'agriculture', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                  {stat.icon}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Actions Bar */}
        <Paper sx={{ p: 3, mb: 3, boxShadow: 'agriculture' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={600}>
              Category Management
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => dispatch(fetchEquipmentCategories({ page: 1, limit: 100 }))}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateCategory}
                sx={{ 
                  background: 'linear-gradient(135deg, #52B788 0%, #16a34a 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #45a077 0%, #138a3a 100%)' }
                }}
              >
                Add Category
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Categories Table */}
        <Paper sx={{ boxShadow: 'agriculture' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Category Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Equipment Count</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          <Build sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="body1" fontWeight={500}>
                          {category.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {category.description || 'No description'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        icon={category.is_active ? <CheckCircle /> : <Cancel />}
                        label={category.is_active ? 'Active' : 'Inactive'}
                        color={category.is_active ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {/* This would be calculated from equipment data */}
                        0
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(category.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit Category">
                          <IconButton
                            size="small"
                            onClick={() => handleEditCategory(category)}
                            sx={{ color: 'primary.main' }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title={category.is_active ? 'Deactivate' : 'Activate'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(category)}
                            sx={{ color: category.is_active ? 'warning.main' : 'success.main' }}
                          >
                            {category.is_active ? <Cancel /> : <CheckCircle />}
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete Category">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCategory(category)}
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

        {/* Create/Edit Category Dialog */}
        <Dialog
          open={formOpen}
          onClose={handleCloseForm}
          maxWidth="sm"
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
            <Category sx={{ color: 'primary.main' }} />
            {formMode === 'create' ? 'Create New Category' : 'Edit Category'}
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'grid', gap: 3 }}>
              <TextField
                fullWidth
                label="Category Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Tractors, Harvesters, Irrigation Equipment"
                required
              />
              
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the category"
                multiline
                rows={3}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    color="primary"
                  />
                }
                label="Active Category"
              />
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={handleCloseForm}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleFormSubmit}
              disabled={!formData?.name || !formData?.name?.trim()}
              sx={{ 
                background: 'linear-gradient(135deg, #52B788 0%, #16a34a 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #45a077 0%, #138a3a 100%)' }
              }}
            >
              {formMode === 'create' ? 'Create Category' : 'Update Category'}
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
          <DialogTitle>Delete Equipment Category</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to deactivate the category "{categoryToDelete?.name}"? 
              This will make it unavailable for new equipment but won't affect existing equipment.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error">
              Deactivate Category
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default EquipmentCategoriesPage;
