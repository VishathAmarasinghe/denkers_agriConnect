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
  Storage,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/slices/store';
import {
  fetchWarehouseCategories,
  createWarehouseCategory,
  updateWarehouseCategory,
  deleteWarehouseCategory,
  clearMessages,
} from '@/slices/warehouseSlice/warehouse';
import { WarehouseCategory } from '@/types/types';
import AdminLayout from '@/components/layout/AdminLayout';

const WarehouseCategoriesPage = () => {
  const dispatch = useAppDispatch();
  const { categories, categoriesLoading: loading, error, success } = useAppSelector((state) => state.warehouseReducer);
  
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<WarehouseCategory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<WarehouseCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    dispatch(fetchWarehouseCategories({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
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
    });
    setFormOpen(true);
  };

  const handleEditCategory = (category: WarehouseCategory) => {
    setFormMode('edit');
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setFormOpen(true);
  };

  const handleDeleteCategory = (category: WarehouseCategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await dispatch(deleteWarehouseCategory(categoryToDelete.id));
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleFormSubmit = async () => {
    if (!formData.name || !formData.name.trim()) return;

    try {
      if (formMode === 'create') {
        await dispatch(createWarehouseCategory({
          name: formData.name?.trim() || '',
          description: formData.description?.trim() || undefined,
        }));
      } else if (selectedCategory) {
        await dispatch(updateWarehouseCategory({
          id: selectedCategory.id,
          data: {
            name: formData.name?.trim() || '',
            description: formData.description?.trim() || undefined,
          },
        }));
      }
      setFormOpen(false);
      setFormData({ name: '', description: '' });
      // Refresh the data after creating/updating
      dispatch(fetchWarehouseCategories({ page: 1, limit: 100 }));
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setFormData({ name: '', description: '' });
    setSelectedCategory(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1, color: 'primary.main' }}>
            Warehouse Categories
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage warehouse categories for organizing storage facilities
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
          <Card sx={{ boxShadow: 'agriculture', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
            <CardContent sx={{ textAlign: 'center', color: 'white' }}>
              <Storage sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {categories.length}
              </Typography>
              <Typography variant="body2">Total Categories</Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
            <CardContent sx={{ textAlign: 'center', color: 'white' }}>
              <Category sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {categories.filter(cat => cat.description).length}
              </Typography>
              <Typography variant="body2">With Description</Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
            <CardContent sx={{ textAlign: 'center', color: 'white' }}>
              <Typography variant="h4" fontWeight={700}>
                {categories.filter(cat => !cat.description).length}
              </Typography>
              <Typography variant="body2">Basic Categories</Typography>
            </CardContent>
          </Card>
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
                onClick={() => dispatch(fetchWarehouseCategories({ page: 1, limit: 100 }))}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateCategory}
                sx={{ 
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)' }
                }}
              >
                Add Category
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Categories Table */}
        <Paper sx={{ p: 3, boxShadow: 'agriculture' }}>
          <Typography variant="h6" gutterBottom>
            Warehouse Categories
          </Typography>
          
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Loading categories...
              </Typography>
            </Box>
          ) : categories.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Categories Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first warehouse category to get started.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <Typography variant="body1" fontWeight={500}>
                          {category.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {category.description || 'No description'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditCategory(category)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCategory(category)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Create/Edit Category Dialog */}
        <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: 'white'
          }}>
            <Storage sx={{ color: 'white' }} />
            {formMode === 'create' ? 'Add New Category' : 'Edit Category'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Category Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Cold Storage, Dry Storage, Refrigerated"
                required
                autoFocus
              />
              
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the category and its purpose"
                multiline
                rows={3}
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
              disabled={!formData.name || !formData.name.trim()}
              sx={{ 
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)' }
              }}
            >
              {formMode === 'create' ? 'Create Category' : 'Update Category'}
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
              Are you sure you want to delete the category "{categoryToDelete?.name}"?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone. All warehouses in this category will be affected.
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
              Delete Category
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default WarehouseCategoriesPage;
