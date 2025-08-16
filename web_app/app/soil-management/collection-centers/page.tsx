'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  Pagination,
  Alert,
  Snackbar,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Science,
  LocationOn,
  Refresh,
  Download,
  Edit,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/slices/store';
import {
  fetchSoilCollectionCenters,
  searchSoilCollectionCenters,
  createSoilCollectionCenter,
  updateSoilCollectionCenter,
  clearMessages,
  setSearchParams,
} from '@/slices/soilCollectionSlice/soilCollection';
import { SoilCollectionCenter, SoilCollectionCenterCreateData, SoilCollectionCenterUpdateData, SoilCollectionCenterSearchParams } from '@/types/types';
import SoilCollectionCentersTable from '@/components/soil-management/SoilCollectionCentersTable';
import SoilCollectionCenterForm from '@/components/soil-management/SoilCollectionCenterForm';
import AdminLayout from '@/components/layout/AdminLayout';

const SoilCollectionCentersPage = () => {
  const dispatch = useAppDispatch();
  const { centers, pagination, loading, error, success } = useAppSelector((state) => state.soilCollectionReducer);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useState<SoilCollectionCenterSearchParams>({
    name: '',
    province: '',
    district: '',
    is_active: undefined,
    page: 1,
    limit: 10,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedCenter, setSelectedCenter] = useState<SoilCollectionCenter | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchSoilCollectionCenters({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  useEffect(() => {
    // Auto-hide success/error messages after 5 seconds
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  const handleSearch = () => {
    dispatch(searchSoilCollectionCenters(searchParams));
  };

  const handleClearSearch = () => {
    setSearchParams({
      name: '',
      province: '',
      district: '',
      is_active: undefined,
      page: 1,
      limit: 10,
    });
    setSearchTerm('');
    dispatch(fetchSoilCollectionCenters({ page: 1, limit: 10 }));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    if (searchTerm.trim()) {
      dispatch(searchSoilCollectionCenters({
        name: searchTerm.trim(),
        page,
        limit: 10,
      }));
    } else {
      dispatch(fetchSoilCollectionCenters({ page, limit: 10 }));
    }
  };

  const handleCreateCenter = () => {
    setFormMode('create');
    setSelectedCenter(null);
    setFormOpen(true);
  };

  const handleEditCenter = (center: SoilCollectionCenter) => {
    setFormMode('edit');
    setSelectedCenter(center);
    setFormOpen(true);
  };

  const handleViewCenter = (center: SoilCollectionCenter) => {
    setSelectedCenter(center);
    setViewDialogOpen(true);
  };

  const handleFormSubmit = async (data: SoilCollectionCenterCreateData | SoilCollectionCenterUpdateData) => {
    try {
      if (formMode === 'create') {
        await dispatch(createSoilCollectionCenter(data as SoilCollectionCenterCreateData));
      } else {
        await dispatch(updateSoilCollectionCenter({
          id: selectedCenter!.id!,
          data: data as SoilCollectionCenterUpdateData,
        }));
      }
      setFormOpen(false);
      // Refresh the list
      if (searchTerm.trim()) {
        dispatch(searchSoilCollectionCenters({
          name: searchTerm.trim(),
          page: currentPage,
          limit: 10,
        }));
      } else {
        dispatch(fetchSoilCollectionCenters({ page: currentPage, limit: 10 }));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedCenter(null);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedCenter(null);
  };

  const stats = [
    {
      title: 'Total Centers',
      value: centers.length,
      icon: <Science sx={{ fontSize: 24, color: '#52B788' }} />,
      color: '#52B788',
    },
    {
      title: 'Active Centers',
      value: centers.filter(center => center.is_active).length,
      icon: <CheckCircle sx={{ fontSize: 24, color: '#16a34a' }} />,
      color: '#16a34a',
    },
    {
      title: 'Inactive Centers',
      value: centers.filter(center => !center.is_active).length,
      icon: <Cancel sx={{ fontSize: 24, color: '#dc2626' }} />,
      color: '#dc2626',
    },
  ];

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
            Soil Collection Centers
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage soil collection centers across Sri Lanka for agricultural soil testing services.
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
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

        {/* Search and Actions Bar */}
        <Paper sx={{ p: 3, mb: 3, boxShadow: 'agriculture' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Search by name"
              value={searchParams.name || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter center name..."
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#52B788' },
                  '&.Mui-focused fieldset': { borderColor: '#52B788' },
                },
                '& .MuiInputLabel-root': { 
                  color: '#64748b',
                  '&.Mui-focused': { color: '#52B788' }
                },
              }}
            />
            
            <TextField
              fullWidth
              label="Province"
              value={searchParams.province || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, province: e.target.value }))}
              placeholder="Enter province..."
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#52B788' },
                  '&.Mui-focused fieldset': { borderColor: '#52B788' },
                },
                '& .MuiInputLabel-root': { 
                  color: '#64748b',
                  '&.Mui-focused': { color: '#52B788' }
                },
              }}
            />
            
            <TextField
              fullWidth
              label="District"
              value={searchParams.district || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, district: e.target.value }))}
              placeholder="Enter district..."
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#52B788' },
                  '&.Mui-focused fieldset': { borderColor: '#52B788' },
                },
                '& .MuiInputLabel-root': { 
                  color: '#64748b',
                  '&.Mui-focused': { color: '#52B788' }
                },
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleClearSearch}
              disabled={!searchTerm.trim()}
            >
              Clear
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Search />}
              onClick={handleSearch}
              disabled={!searchTerm.trim()}
            >
              Search
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateCenter}
              sx={{ 
                backgroundColor: 'primary.main',
                '&:hover': { backgroundColor: 'primary.dark' }
              }}
            >
              Add Center
            </Button>
          </Box>
        </Paper>

        {/* Centers Table */}
        <Paper sx={{ boxShadow: 'agriculture' }}>
          <SoilCollectionCentersTable
            centers={centers}
            onEdit={handleEditCenter}
            onView={handleViewCenter}
            loading={loading}
          />
        </Paper>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={pagination.totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}

        {/* Form Dialog */}
        <SoilCollectionCenterForm
          open={formOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          center={selectedCenter}
          loading={loading}
          mode={formMode}
        />

        {/* View Dialog */}
        {selectedCenter && (
          <Dialog
            open={viewDialogOpen}
            onClose={handleCloseViewDialog}
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
              <Science sx={{ color: 'primary.main' }} />
              Center Details: {selectedCenter.name}
            </DialogTitle>
            
            <DialogContent sx={{ pt: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Center Name</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedCenter.name}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Contact Number</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedCenter.contact_number}</Typography>
                  
                  {selectedCenter.contact_person && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">Contact Person</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>{selectedCenter.contact_person}</Typography>
                    </>
                  )}
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedCenter.address}</Typography>
                  
                  {selectedCenter.latitude && selectedCenter.longitude && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">Coordinates</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedCenter.latitude.toFixed(4)}, {selectedCenter.longitude.toFixed(4)}
                      </Typography>
                    </>
                  )}
                </Box>
                
                {selectedCenter.description && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedCenter.description}</Typography>
                  </Box>
                )}
                
                {selectedCenter.services_offered && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Services Offered</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedCenter.services_offered}</Typography>
                  </Box>
                )}
                
                {selectedCenter.operating_hours && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Operating Hours</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedCenter.operating_hours}</Typography>
                  </Box>
                )}
                
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedCenter.is_active ? 'Active' : 'Inactive'}
                    color={selectedCenter.is_active ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Box>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button onClick={handleCloseViewDialog}>Close</Button>
              <Button
                variant="contained"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleEditCenter(selectedCenter);
                }}
                startIcon={<Edit />}
              >
                Edit Center
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Success/Error Messages */}
        <Snackbar
          open={!!success}
          autoHideDuration={5000}
          onClose={() => dispatch(clearMessages())}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={() => dispatch(clearMessages())} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={5000}
          onClose={() => dispatch(clearMessages())}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={() => dispatch(clearMessages())} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </AdminLayout>
  );
};

export default SoilCollectionCentersPage;
