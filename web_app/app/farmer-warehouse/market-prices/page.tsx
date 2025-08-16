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
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Source as SourceIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/slices/store';
import {
  fetchMarketPrices,
  createMarketPrice,
  updateMarketPrice,
  deleteMarketPrice,
  clearMessages
} from '@/slices/farmerWarehouseSlice/farmerWarehouse';
import {
  fetchMarketItems,
  clearMessages as clearMarketItemMessages
} from '@/slices/marketItemsSlice/marketItems';
import { MarketPrice, MarketPriceCreate, MarketPriceUpdate } from '@/types/types';
import { AppConfig } from '@/config/config';
import AdminLayout from '@/components/layout/AdminLayout';

const MarketPricesPage = () => {
  const dispatch = useAppDispatch();
  const {
    marketPrices,
    marketPricesPagination,
    marketPricesLoading,
    marketPricesError,
    success,
    error
  } = useAppSelector((state) => state.farmerWarehouseReducer);

  const {
    items: marketItems,
    itemsLoading: marketItemsLoading
  } = useAppSelector((state) => state.marketItemsReducer);

  // Local state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<MarketPrice | null>(null);
  const [priceToDelete, setPriceToDelete] = useState<MarketPrice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState<MarketPriceCreate>({
    market_item_id: 0,
    current_price: 0,
    price_date: new Date(),
    source: 'admin',
    notes: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchMarketPrices({ page: currentPage, limit: itemsPerPage }));
    dispatch(fetchMarketItems({ page: 1, limit: 1000 }));
  }, [dispatch, currentPage, itemsPerPage]);

  // Debug logging
  useEffect(() => {
    if (marketPrices.length > 0) {
      console.log('Market Prices Data:', marketPrices);
      console.log('First Price:', marketPrices[0]);
      console.log('First Price current_price type:', typeof marketPrices[0]?.current_price);
      console.log('First Price current_price value:', marketPrices[0]?.current_price);
    }
  }, [marketPrices]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
        dispatch(clearMarketItemMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // Handle dialog open for create
  const handleCreateDialogOpen = () => {
    setFormData({
      market_item_id: 0,
      current_price: 0,
      price_date: new Date(),
      source: 'admin',
      notes: ''
    });
    setSelectedPrice(null);
    setDialogOpen(true);
  };

  // Handle dialog open for edit
  const handleEditDialogOpen = (price: MarketPrice) => {
    setSelectedPrice(price);
    setFormData({
      market_item_id: price.market_item_id,
      current_price: price.current_price,
      price_date: new Date(price.price_date),
      source: price.source,
      notes: price.notes || ''
    });
    setDialogOpen(true);
  };

  // Handle dialog open for view
  const handleViewDialogOpen = (price: MarketPrice) => {
    setSelectedPrice(price);
    setViewDialogOpen(true);
  };

  // Handle dialog open for delete
  const handleDeleteDialogOpen = (price: MarketPrice) => {
    setPriceToDelete(price);
    setDeleteDialogOpen(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (selectedPrice) {
      // Update existing price
      await dispatch(updateMarketPrice({
        id: selectedPrice.id,
        data: formData
      }));
    } else {
      // Create new price
      await dispatch(createMarketPrice(formData));
    }
    
    if (!error) {
      setDialogOpen(false);
      setSelectedPrice(null);
      // Refresh the list
      dispatch(fetchMarketPrices({ page: currentPage, limit: itemsPerPage }));
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (priceToDelete) {
      await dispatch(deleteMarketPrice(priceToDelete.id));
      if (!error) {
        setDeleteDialogOpen(false);
        setPriceToDelete(null);
        // Refresh the list
        dispatch(fetchMarketPrices({ page: currentPage, limit: itemsPerPage }));
      }
    }
  };

  // Get market item name by ID
  const getMarketItemName = (marketItemId: number) => {
    const item = marketItems.find(item => item.id === marketItemId);
    return item ? item.name : 'Unknown Item';
  };

  // Get market item details by ID
  const getMarketItemDetails = (marketItemId: number) => {
    const item = marketItems.find(item => item.id === marketItemId);
    return item || null;
  };

  // Transform and validate market prices data
  const transformMarketPrices = (prices: MarketPrice[]) => {
    return prices.map(price => ({
      ...price,
      current_price: typeof price.current_price === 'number' ? price.current_price : Number(price.current_price || 0),
      price_date: new Date(price.price_date),
      created_at: new Date(price.created_at),
      updated_at: new Date(price.updated_at)
    }));
  };

  // Filter market prices based on search term
  const filteredPrices = transformMarketPrices(marketPrices).filter((price: MarketPrice) => {
    const itemName = getMarketItemName(price.market_item_id);
    return itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           price.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
           price.notes?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main', mb: 1 }}>
              Market Prices Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage daily market prices for agricultural products
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
            Add Market Price
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

      {/* Search and Filters */}
      <Card sx={{ mb: 3, boxShadow: 'agriculture' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search by item name, source, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outlined"
              onClick={() => setSearchTerm('')}
              disabled={!searchTerm}
            >
              Clear
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Market Prices Table */}
      <Card sx={{ boxShadow: 'agriculture' }}>
        <CardContent>
          {marketPricesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography>Loading market prices...</Typography>
            </Box>
          ) : marketPricesError ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography color="error">Error: {marketPricesError}</Typography>
            </Box>
          ) : filteredPrices.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography color="text.secondary">No market prices found</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.50' }}>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Source</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Notes</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPrices.map((price: MarketPrice) => {
                    const item = getMarketItemDetails(price.market_item_id);
                    return (
                      <TableRow key={price.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              <CategoryIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {item?.name || 'Unknown Item'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item?.category || 'No Category'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MoneyIcon sx={{ color: 'success.main', fontSize: 20 }} />
                            <Typography variant="body2" fontWeight={600} color="success.main">
                              Rs. {typeof price.current_price === 'number' ? price.current_price.toFixed(2) : Number(price.current_price || 0).toFixed(2)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              per {item?.unit || 'unit'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon sx={{ color: 'info.main', fontSize: 16 }} />
                            <Typography variant="body2">
                              {new Date(price.price_date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<SourceIcon />}
                            label={price.source}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {price.notes || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDialogOpen(price)}
                                sx={{ color: 'info.main' }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Price">
                              <IconButton
                                size="small"
                                onClick={() => handleEditDialogOpen(price)}
                                sx={{ color: 'warning.main' }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Price">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteDialogOpen(price)}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {marketPricesPagination.totalPages > 1 && filteredPrices.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={marketPricesPagination.totalPages}
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
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPrice ? 'Edit Market Price' : 'Add New Market Price'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Market Item</InputLabel>
              <Select
                value={formData.market_item_id}
                onChange={(e) => setFormData({ ...formData, market_item_id: Number(e.target.value) })}
                label="Market Item"
                disabled={marketItemsLoading}
              >
                {marketItems.map((item: any) => (
                  <MenuItem key={item.id} value={item.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CategoryIcon sx={{ fontSize: 16 }} />
                      {item.name} ({item.category}) - {item.unit}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Price (Rs.)"
              type="number"
              value={formData.current_price}
              onChange={(e) => setFormData({ ...formData, current_price: Number(e.target.value) })}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
              }}
            />

            <TextField
              label="Date"
              type="date"
              value={formData.price_date.toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, price_date: new Date(e.target.value) })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Source"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              fullWidth
              placeholder="e.g., admin, market_survey, farmer_report"
            />

            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Additional notes about this price..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.market_item_id || !formData.current_price || !formData.price_date}
          >
            {selectedPrice ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Market Price Details
        </DialogTitle>
        <DialogContent>
          {selectedPrice && (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Item Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={500}>
                      Item: {getMarketItemName(selectedPrice.market_item_id)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Category: {getMarketItemDetails(selectedPrice.market_item_id)?.category || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Unit: {getMarketItemDetails(selectedPrice.market_item_id)?.unit || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Price Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      Rs. {typeof selectedPrice.current_price === 'number' ? selectedPrice.current_price.toFixed(2) : Number(selectedPrice.current_price || 0).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      per {getMarketItemDetails(selectedPrice.market_item_id)?.unit || 'unit'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Date & Source
                  </Typography>
                  <Typography variant="body2">
                    Date: {new Date(selectedPrice.price_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    Source: {selectedPrice.source}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Additional Information
                  </Typography>
                  <Typography variant="body2">
                    Notes: {selectedPrice.notes || 'No additional notes'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(selectedPrice.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the market price for{' '}
            <strong>{priceToDelete ? getMarketItemName(priceToDelete.market_item_id) : ''}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
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

export default MarketPricesPage;
