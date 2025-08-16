'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Visibility,
  QrCode,
  Search,
  FilterList,
  Refresh,
  Storage,
  LocalShipping,
  Assessment,
  Schedule,
  CheckCircle,
  Error,
  Info,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/slices/store';
import {
  fetchFarmerWarehouseRequests,
  clearMessages,
  setSearchParams,
} from '@/slices/farmerWarehouseSlice/farmerWarehouse';
import AdminLayout from '@/components/layout/AdminLayout';

const WarehouseRequestsPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    requests,
    requestsPagination,
    requestsLoading,
    requestsError,
    searchParams,
    success,
    error,
  } = useAppSelector((state) => state.farmerWarehouseReducer);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchFarmerWarehouseRequests({
      page: page + 1,
      limit: rowsPerPage,
      status: (statusFilter as 'pending' | 'approved' | 'rejected' | 'completed') || undefined,
      request_type: (typeFilter as 'storage' | 'retrieval' | 'inspection') || undefined,
    }));
  }, [dispatch, page, rowsPerPage, statusFilter, typeFilter]);

  useEffect(() => {
    // Clear messages after 5 seconds
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = () => {
    dispatch(setSearchParams({ page: 1 }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setPage(0);
    dispatch(setSearchParams({ page: 1 }));
  };

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleCreateRequest = () => {
    router.push('/farmer-warehouse/requests/create');
  };

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

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'storage':
        return 'primary';
      case 'retrieval':
        return 'secondary';
      case 'inspection':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
            Warehouse Requests
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track your warehouse storage, retrieval, and inspection requests
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

        {/* Actions and Filters */}
        <Paper sx={{ p: 3, mb: 4, boxShadow: 'agriculture' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ color: 'primary.main' }}>
              Requests Management
            </Typography>
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
              New Request
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              label="Search Items"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by item name..."
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="storage">Storage</MenuItem>
                <MenuItem value="retrieval">Retrieval</MenuItem>
                <MenuItem value="inspection">Inspection</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Search />}
              onClick={handleSearch}
              fullWidth
              sx={{ borderColor: 'primary.main', color: 'primary.main' }}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleClearFilters}
              fullWidth
              sx={{ borderColor: 'grey.500', color: 'grey.700' }}
            >
              Clear
            </Button>
          </Box>
        </Paper>

        {/* Statistics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main' }}>
                  {requestsPagination.total}
                </Typography>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                  <Storage sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total Requests
              </Typography>
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 500 }}>
                All time
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: 'warning.main' }}>
                  {requests.filter(r => r.status === 'pending').length}
                </Typography>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'warning.main' }}>
                  <Schedule sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Pending
              </Typography>
              <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 500 }}>
                Awaiting approval
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
                Approved
              </Typography>
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 500 }}>
                Ready for action
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: 'info.main' }}>
                  {requests.filter(r => r.status === 'completed').length}
                </Typography>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'info.main' }}>
                  <CheckCircle sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Completed
              </Typography>
              <Typography variant="caption" sx={{ color: 'info.main', fontWeight: 500 }}>
                Successfully finished
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Requests Table */}
        <Paper sx={{ boxShadow: 'agriculture' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Item</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Warehouse</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Quantity</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Duration</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requestsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : requests.length > 0 ? (
                  requests.map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {getRequestTypeIcon(request.request_type)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              {request.item_name}
                            </Typography>
                            {request.storage_requirements && (
                              <Typography variant="caption" color="text.secondary">
                                {request.storage_requirements}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getRequestTypeIcon(request.request_type)}
                          label={request.request_type}
                          color={getRequestTypeColor(request.request_type) as any}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {request.warehouse_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.warehouse_address}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {request.quantity} units
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {request.storage_duration_days} days
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(request.status)}
                          label={request.status}
                          color={getStatusColor(request.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(request.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(request.created_at).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewRequest(request)}
                              sx={{ color: 'primary.main' }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {request.qr_code_url && (
                            <Tooltip title="View QR Code">
                              <IconButton
                                size="small"
                                sx={{ color: 'success.main' }}
                              >
                                <QrCode />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Storage sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                          No warehouse requests found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Create your first warehouse request to get started
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          onClick={handleCreateRequest}
                        >
                          Create Request
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={requestsPagination.total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        {/* View Request Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {selectedRequest && getRequestTypeIcon(selectedRequest.request_type)}
              </Avatar>
              <Typography variant="h6">
                Request Details - {selectedRequest?.item_name}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedRequest && (
                                   <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mt: 1 }}>
                       <Box>
                         <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                           Request Information
                         </Typography>
                         <Box sx={{ mb: 2 }}>
                           <Typography variant="body2" fontWeight={500}>
                             Item Name: {selectedRequest.item_name}
                           </Typography>
                           <Typography variant="body2" color="text.secondary">
                             Type: {selectedRequest.request_type}
                           </Typography>
                           <Typography variant="body2" color="text.secondary">
                             Quantity: {selectedRequest.quantity} units
                           </Typography>
                           <Typography variant="body2" color="text.secondary">
                             Duration: {selectedRequest.storage_duration_days} days
                           </Typography>
                         </Box>
                         {selectedRequest.storage_requirements && (
                           <Box sx={{ mb: 2 }}>
                             <Typography variant="body2" fontWeight={500}>
                               Storage Requirements:
                             </Typography>
                             <Typography variant="body2" color="text.secondary">
                               {selectedRequest.storage_requirements}
                             </Typography>
                           </Box>
                         )}
                         {selectedRequest.preferred_dates && (
                           <Box sx={{ mb: 2 }}>
                             <Typography variant="body2" fontWeight={500}>
                               Preferred Dates:
                             </Typography>
                             <Typography variant="body2" color="text.secondary">
                               {selectedRequest.preferred_dates}
                             </Typography>
                           </Box>
                         )}
                       </Box>
                       <Box>
                         <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                           Warehouse Information
                         </Typography>
                         <Box sx={{ mb: 2 }}>
                           <Typography variant="body2" fontWeight={500}>
                             Warehouse: {selectedRequest.warehouse_name}
                           </Typography>
                           <Typography variant="body2" color="text.secondary">
                             Address: {selectedRequest.warehouse_address}
                           </Typography>
                           <Typography variant="body2" color="text.secondary">
                             Contact: {selectedRequest.warehouse_contact_person}
                           </Typography>
                           <Typography variant="body2" color="text.secondary">
                             Phone: {selectedRequest.warehouse_contact_number}
                           </Typography>
                         </Box>
                         <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                           Status Information
                         </Typography>
                         <Box sx={{ mb: 2 }}>
                           <Chip
                             icon={getStatusIcon(selectedRequest.status)}
                             label={selectedRequest.status}
                             color={getStatusColor(selectedRequest.status) as any}
                             sx={{ mb: 1 }}
                           />
                           {selectedRequest.admin_notes && (
                             <Typography variant="body2" color="text.secondary">
                               Admin Notes: {selectedRequest.admin_notes}
                             </Typography>
                           )}
                           {selectedRequest.rejection_reason && (
                             <Typography variant="body2" color="text.secondary">
                               Rejection Reason: {selectedRequest.rejection_reason}
                             </Typography>
                           )}
                         </Box>
                       </Box>
                       {selectedRequest.qr_code_url && (
                         <Box sx={{ gridColumn: '1 / -1' }}>
                           <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                             QR Code
                           </Typography>
                           <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                             <QrCode sx={{ fontSize: 64, color: 'primary.main' }} />
                             <Typography variant="body2" color="text.secondary">
                               QR Code available for this request
                             </Typography>
                           </Box>
                         </Box>
                       )}
                     </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            {selectedRequest?.status === 'pending' && (
              <Button
                variant="outlined"
                onClick={() => {
                  setViewDialogOpen(false);
                  // Handle edit functionality
                }}
              >
                Edit Request
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default WarehouseRequestsPage;
