'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Avatar,
  Alert,
  Snackbar,
  Pagination,
  InputAdornment,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Scale as ScaleIcon,
  Image as ImageIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/slices/store';
import {
  fetchMarketItems,
  getMarketItem,
  createMarketItem,
  updateMarketItem,
  deleteMarketItem,
  toggleMarketItemStatus,
  clearMessages
} from '@/slices/marketItemsSlice/marketItems';
import { MarketItem, MarketItemCreate, MarketItemUpdate } from '@/types/types';
import AdminLayout from '@/components/layout/AdminLayout';

const MarketItemsPage = () => {
  const dispatch = useAppDispatch();
  const {
    items: marketItems,
    itemsPagination,
    itemsLoading,
    itemsError,
    success,
    error
  } = useAppSelector((state) => state.marketItemsReducer);

  // Local state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MarketItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState<MarketItemCreate>({
    name: '',
    description: '',
    category: '',
    unit: 'kg',
    image_url: '',
    is_active: true
  });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchMarketItems({ page: currentPage, limit: itemsPerPage }));
  }, [dispatch, currentPage, itemsPerPage]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  // Get unique categories for filter
  const categories = Array.from(new Set(marketItems.map(item => item.category).filter(Boolean)));

  // Filter market items based on search term and category
  const filteredItems = marketItems.filter((item: MarketItem) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Statistics
  const stats = {
    total: marketItems.length,
    active: marketItems.filter(item => item.is_active).length,
    inactive: marketItems.filter(item => !item.is_active).length,
    categories: categories.length
  };

  // Dialog handlers
  const handleCreateDialogOpen = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      unit: 'kg',
      image_url: '',
      is_active: true
    });
    setDialogOpen(true);
  };

  const handleEditDialogOpen = (item: MarketItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category || '',
      unit: item.unit,
      image_url: item.image_url || '',
      is_active: item.is_active
    });
    setDialogOpen(true);
  };

  const handleViewDialogOpen = (item: MarketItem) => {
    setSelectedItem(item);
    setViewDialogOpen(true);
  };

  const handleDeleteDialogOpen = (item: MarketItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      unit: 'kg',
      image_url: '',
      is_active: true
    });
  };

  const handleSubmit = async () => {
    if (selectedItem) {
      await dispatch(updateMarketItem({ id: selectedItem.id, data: formData as MarketItemUpdate }));
    } else {
      await dispatch(createMarketItem(formData));
    }
    if (!itemsError) {
      handleCloseDialog();
      dispatch(fetchMarketItems({ page: currentPage, limit: itemsPerPage }));
    }
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      await dispatch(deleteMarketItem(itemToDelete.id));
      if (!itemsError) {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        dispatch(fetchMarketItems({ page: currentPage, limit: itemsPerPage }));
      }
    }
  };

  const handleToggleStatus = async (item: MarketItem) => {
    await dispatch(toggleMarketItemStatus(item.id));
    if (!itemsError) {
      dispatch(fetchMarketItems({ page: currentPage, limit: itemsPerPage }));
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCategoryFilter('');
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircleIcon /> : <CancelIcon />;
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main', mb: 1 }}>
              Market Items Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage agricultural products and items available in the market
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateDialogOpen}
            sx={{ 
              bgcolor: 'success.main',
              '&:hover': { bgcolor: 'success.dark' }
            }}
          >
            Add Market Item
          </Button>
        </Box>

        {/* Success/Error Messages */}
        <Snackbar
          open={!!success}
          autoHideDuration={5000}
          onClose={() => dispatch(clearMessages())}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={() => dispatch(clearMessages())} severity="success">
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={5000}
          onClose={() => dispatch(clearMessages())}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={() => dispatch(clearMessages())} severity="error">
            {error}
          </Alert>
        </Snackbar>

        {/* Statistics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main' }}>
                  {stats.total}
                </Typography>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                  <CategoryIcon sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total Items
              </Typography>
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 500 }}>
                All market items
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: 'success.main' }}>
                  {stats.active}
                </Typography>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'success.main' }}>
                  <CheckCircleIcon sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Active Items
              </Typography>
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 500 }}>
                Currently available
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: 'warning.main' }}>
                  {stats.inactive}
                </Typography>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'warning.main' }}>
                  <CancelIcon sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Inactive Items
              </Typography>
              <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 500 }}>
                Temporarily unavailable
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: 'info.main' }}>
                  {stats.categories}
                </Typography>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'info.main' }}>
                  <DescriptionIcon sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Categories
              </Typography>
              <Typography variant="caption" sx={{ color: 'info.main', fontWeight: 500 }}>
                Product categories
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Search and Filters */}
        <Card sx={{ mb: 3, boxShadow: 'agriculture' }}>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
              <TextField
                placeholder="Search by name, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={() => dispatch(fetchMarketItems({ page: 1, limit: itemsPerPage }))}
                fullWidth
              >
                Search
              </Button>

              <Button
                variant="outlined"
                onClick={handleClearSearch}
                fullWidth
              >
                Clear
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Market Items Table */}
        <Card sx={{ boxShadow: 'agriculture' }}>
          <CardContent>
            {itemsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <Typography>Loading market items...</Typography>
              </Box>
            ) : itemsError ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <Typography color="error">Error: {itemsError}</Typography>
              </Box>
            ) : filteredItems.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <Typography color="text.secondary">No market items found</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.50' }}>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Item</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Unit</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredItems.map((item: MarketItem) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              <CategoryIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {item.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                                {item.description || 'No description'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<DescriptionIcon />}
                            label={item.category || 'No Category'}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScaleIcon sx={{ color: 'info.main', fontSize: 16 }} />
                            <Typography variant="body2">
                              {item.unit}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(item.is_active)}
                            label={item.is_active ? 'Active' : 'Inactive'}
                            size="small"
                            color={getStatusColor(item.is_active)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDialogOpen(item)}
                                sx={{ color: 'info.main' }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Item">
                              <IconButton
                                size="small"
                                onClick={() => handleEditDialogOpen(item)}
                                sx={{ color: 'warning.main' }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Item">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteDialogOpen(item)}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination */}
            {itemsPagination.totalPages > 1 && filteredItems.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={itemsPagination.totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedItem ? 'Edit Market Item' : 'Add New Market Item'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mt: 2 }}>
              <TextField
                label="Item Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
              />
              
              <TextField
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                fullWidth
                placeholder="e.g., Grains, Vegetables, Fruits"
              />
              
              <TextField
                label="Unit"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                fullWidth
                placeholder="e.g., kg, pieces, liters"
              />
              
              <TextField
                label="Image URL"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                fullWidth
                placeholder="https://example.com/image.jpg"
              />
              
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                multiline
                rows={3}
                placeholder="Describe the item, its uses, and characteristics..."
                sx={{ gridColumn: { xs: '1 / -1', md: '1 / -1' } }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                }
                label="Active"
                sx={{ gridColumn: { xs: '1 / -1', md: '1 / -1' } }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {selectedItem ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Market Item Details
          </DialogTitle>
          <DialogContent>
            {selectedItem && (
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Basic Information
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight={500}>
                        Name: {selectedItem.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Category: {selectedItem.category || 'No Category'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Unit: {selectedItem.unit}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Status & Details
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        icon={getStatusIcon(selectedItem.is_active)}
                        label={selectedItem.is_active ? 'Active' : 'Inactive'}
                        color={getStatusColor(selectedItem.is_active)}
                        sx={{ mb: 1 }}
                      />
                      {selectedItem.image_url && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">Image URL:</Typography>
                          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                            {selectedItem.image_url}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {selectedItem.description && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body2">
                      {selectedItem.description}
                    </Typography>
                  </Box>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Created: {new Date(selectedItem.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated: {new Date(selectedItem.updated_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button 
              onClick={() => {
                if (selectedItem) {
                  handleEditDialogOpen(selectedItem);
                  setViewDialogOpen(false);
                }
              }} 
              variant="contained"
            >
              Edit Item
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the market item{' '}
              <strong>{itemToDelete?.name}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action cannot be undone and will also remove all associated market prices.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default MarketItemsPage;
