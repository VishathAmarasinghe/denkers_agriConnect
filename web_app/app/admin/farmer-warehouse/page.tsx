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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Pagination,
  InputAdornment,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  Search,
  Refresh,
  Storage,
  Schedule,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/slices/store';
import {
  fetchAdminPendingRequests,
  approveFarmerWarehouseRequest,
  rejectFarmerWarehouseRequest,
  clearMessages,
} from '@/slices/farmerWarehouseSlice/farmerWarehouse';
import AdminLayout from '@/components/layout/AdminLayout';

const AdminFarmerWarehousePage = () => {
  const dispatch = useAppDispatch();
  const {
    adminPendingRequests,
    adminPendingRequestsPagination,
    adminPendingRequestsLoading,
    adminPendingRequestsError,
    success,
    error,
  } = useAppSelector((state) => state.farmerWarehouseReducer);

  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    dispatch(fetchAdminPendingRequests({ page: currentPage, limit: itemsPerPage }));
  }, [dispatch, currentPage, itemsPerPage]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleApproveRequest = (request: any) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setApproveDialogOpen(true);
  };

  const handleRejectRequest = (request: any) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setAdminNotes('');
    setRejectDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (selectedRequest) {
      await dispatch(approveFarmerWarehouseRequest({
        id: selectedRequest.id,
        adminNotes: adminNotes,
      }));
      if (!adminPendingRequestsError) {
        setApproveDialogOpen(false);
        setSelectedRequest(null);
        dispatch(fetchAdminPendingRequests({ page: currentPage, limit: itemsPerPage }));
      }
    }
  };

  const confirmReject = async () => {
    if (selectedRequest && rejectionReason) {
      await dispatch(rejectFarmerWarehouseRequest({
        id: selectedRequest.id,
        rejectionReason: rejectionReason,
      }));
      if (!adminPendingRequestsError) {
        setRejectDialogOpen(false);
        setSelectedRequest(null);
        dispatch(fetchAdminPendingRequests({ page: currentPage, limit: itemsPerPage }));
      }
    }
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
        return <CheckCircleIcon />;
      case 'rejected':
        return <ErrorIcon />;
      case 'completed':
        return <CheckCircleIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const filteredRequests = adminPendingRequests.filter((request: any) => {
    const matchesSearch = 
      request.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main', mb: 1 }}>
            Farmer Warehouse Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage farmer warehouse requests and operations
          </Typography>
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
        <Paper sx={{ p: 3, mb: 3, boxShadow: 'agriculture' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
            <TextField
              placeholder="Search by item or farmer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
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

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                dispatch(fetchAdminPendingRequests({ page: 1, limit: itemsPerPage }));
              }}
              fullWidth
            >
              Clear & Refresh
            </Button>
          </Box>
        </Paper>

        {/* Requests Table */}
        <Card sx={{ boxShadow: 'agriculture' }}>
          <CardContent>
            {adminPendingRequestsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <Typography>Loading requests...</Typography>
              </Box>
            ) : adminPendingRequestsError ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <Typography color="error">Error: {adminPendingRequestsError}</Typography>
              </Box>
            ) : filteredRequests.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <Typography color="text.secondary">No requests found</Typography>
              </Box>
            ) : (
              <>
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'primary.50' }}>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Request</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Farmer</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Warehouse</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRequests.map((request: any) => (
                        <TableRow key={request.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                <Storage sx={{ fontSize: 16 }} />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {request.item_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {request.quantity} kg • {request.storage_duration_days} days
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {request.farmer_name || 'Unknown Farmer'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {request.farmer_phone || 'No phone'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {request.warehouse_name || 'Unknown Warehouse'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(request.status)}
                              label={request.status}
                              size="small"
                              color={getStatusColor(request.status)}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewRequest(request)}
                                  sx={{ color: 'info.main' }}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              {request.status === 'pending' && (
                                <>
                                  <Tooltip title="Approve Request">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleApproveRequest(request)}
                                      sx={{ color: 'success.main' }}
                                    >
                                      <CheckCircle />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject Request">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRejectRequest(request)}
                                      sx={{ color: 'error.main' }}
                                    >
                                      <Cancel />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {adminPendingRequestsPagination.totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={adminPendingRequestsPagination.totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* View Request Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Request Details</DialogTitle>
          <DialogContent>
            {selectedRequest && (
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Request Information
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Item:</strong> {selectedRequest.item_name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Quantity:</strong> {selectedRequest.quantity} kg
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Duration:</strong> {selectedRequest.storage_duration_days} days
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Type:</strong> {selectedRequest.request_type}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Farmer Information
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Name:</strong> {selectedRequest.farmer_name || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Phone:</strong> {selectedRequest.farmer_phone || 'No phone'}
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

        {/* Approve Request Dialog */}
        <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
          <DialogTitle>Approve Request</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Are you sure you want to approve this request for{' '}
              <strong>{selectedRequest?.item_name}</strong>?
            </Typography>
            <TextField
              label="Admin Notes (Optional)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Add any notes or instructions for the farmer..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmApprove} variant="contained" color="success">
              Approve Request
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reject Request Dialog */}
        <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
          <DialogTitle>Reject Request</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Are you sure you want to reject this request for{' '}
              <strong>{selectedRequest?.item_name}</strong>?
            </Typography>
            <TextField
              label="Rejection Reason *"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Please provide a reason for rejection..."
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Admin Notes (Optional)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Add any additional notes..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={confirmReject} 
              variant="contained" 
              color="error"
              disabled={!rejectionReason.trim()}
            >
              Reject Request
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default AdminFarmerWarehousePage;
