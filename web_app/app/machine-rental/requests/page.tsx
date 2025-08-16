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
  CheckCircle,
  Cancel,
  Visibility,
  Refresh,
  Search,
  TrendingUp,
  Warning,
  Schedule,
  Person,
  Agriculture,
  LocationOn,
  Phone,
  QrCode,
  ConfirmationNumber,
  Payment,
  DirectionsCar,
  Assignment,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/slices/store';
import {
  fetchRentalRequests,
  approveRentalRequest,
  rejectRentalRequest,
  confirmPickup,
  confirmReturn,
  clearMessages,
  setRentalSearchParams,
} from '@/slices/machineRentalSlice/machineRental';
import { EquipmentRentalRequest } from '@/types/types';
import AdminLayout from '@/components/layout/AdminLayout';

const RentalRequestsPage = () => {
  const dispatch = useAppDispatch();
  const { 
    rentalRequests, 
    rentalRequestsPagination, 
    loading, 
    error, 
    success,
    rentalSearchParams 
  } = useAppSelector((state) => state.machineRentalReducer);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [pickupDialogOpen, setPickupDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<EquipmentRentalRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [pickupCode, setPickupCode] = useState('');
  const [returnCode, setReturnCode] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [requestToView, setRequestToView] = useState<EquipmentRentalRequest | null>(null);

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
      await dispatch(fetchRentalRequests({ ...rentalSearchParams, page: currentPage, limit: 10 }));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  if (loading && rentalRequests.length === 0) {
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
          Rental Requests Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage equipment rental requests, approve/reject applications, and track pickup/return status.
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
                  {rentalRequests.length}
                </Typography>
                <Assignment sx={{ fontSize: 24, color: '#2563eb' }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Requests
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#d97706' }}>
                  {rentalRequests.filter(req => req.status === 'pending').length}
                </Typography>
                <Schedule sx={{ fontSize: 24, color: '#d97706' }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Pending Approval
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#059669' }}>
                  {rentalRequests.filter(req => req.status === 'active').length}
                </Typography>
                <TrendingUp sx={{ fontSize: 24, color: '#059669' }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Active Rentals
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 'agriculture', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#059669' }}>
                  {rentalRequests.filter(req => req.status === 'completed').length}
                </Typography>
                <CheckCircle sx={{ fontSize: 24, color: '#059669' }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        {/* Search and Actions Bar */}
        <Paper sx={{ p: 3, mb: 3, boxShadow: 'agriculture' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
            <TextField
              fullWidth
              label="Search Requests"
              value={rentalSearchParams.search || ''}
              onChange={(e) => {
                dispatch(setRentalSearchParams({ search: e.target.value, page: 1 }));
                setCurrentPage(1);
                fetchData();
              }}
              placeholder="Search by farmer name, equipment..."
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
              <InputLabel>Status</InputLabel>
              <Select
                value={rentalSearchParams.status || ''}
                onChange={(e) => {
                  dispatch(setRentalSearchParams({ status: e.target.value === '' ? undefined : e.target.value, page: 1 }));
                  setCurrentPage(1);
                  fetchData();
                }}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="returned">Returned</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={600}>
              Rental Requests
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchData}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Paper>

        {/* Rental Requests Table */}
        <Paper sx={{ boxShadow: 'agriculture' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Request Details</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Equipment</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Rental Period</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rentalRequests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                          <Person sx={{ fontSize: 24 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {request.farmer_name || 'Unknown Farmer'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {request.receiver_name} • {request.receiver_phone}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {request.delivery_address}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {request.equipment_name || 'Unknown Equipment'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.category_name || 'Unknown Category'}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {new Date(request.start_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          to {new Date(request.end_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {request.rental_duration} days
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          Rs. {request.total_amount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          + Rs. {request.delivery_fee} delivery
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          + Rs. {request.security_deposit} deposit
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        icon={<Schedule />}
                        label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        color="default"
                        size="small"
                        variant="outlined"
                      />
                      {request.status === 'approved' && request.approved_by_name && (
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                          Approved by: {request.approved_by_name}
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            sx={{ color: 'primary.main' }}
                            onClick={() => {
                              setRequestToView(request);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        {request.status === 'pending' && (
                          <>
                            <Tooltip title="Approve Request">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setApprovalDialogOpen(true);
                                }}
                                sx={{ color: 'success.main' }}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Reject Request">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setRejectionDialogOpen(true);
                                }}
                                sx={{ color: 'error.main' }}
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        
                        {request.status === 'approved' && (
                          <Tooltip title="Confirm Pickup">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedRequest(request);
                                setPickupDialogOpen(true);
                              }}
                              sx={{ color: 'info.main' }}
                            >
                              <DirectionsCar />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {request.status === 'active' && (
                          <Tooltip title="Confirm Return">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedRequest(request);
                                setReturnDialogOpen(true);
                              }}
                              sx={{ color: 'success.main' }}
                            >
                              <Assignment />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Pagination */}
        {rentalRequestsPagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={rentalRequestsPagination.totalPages}
              page={currentPage}
              onChange={(event, page) => {
                setCurrentPage(page);
                dispatch(setRentalSearchParams({ page }));
              }}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}

        {/* Approval Dialog */}
        <Dialog
          open={approvalDialogOpen}
          onClose={() => setApprovalDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            backgroundColor: 'success.50', 
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <CheckCircle sx={{ color: 'success.main' }} />
            Approve Rental Request
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Approve rental request for <strong>{selectedRequest?.equipment_name}</strong> by <strong>{selectedRequest?.farmer_name}</strong>?
            </Typography>
            <TextField
              fullWidth
              label="Admin Notes (Optional)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any notes for the farmer..."
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={async () => {
                if (selectedRequest) {
                  try {
                    await dispatch(approveRentalRequest({ 
                      requestId: selectedRequest.id, 
                      adminNotes: adminNotes.trim() 
                    }));
                    setApprovalDialogOpen(false);
                    setSelectedRequest(null);
                    setAdminNotes('');
                    fetchData();
                  } catch (error) {
                    console.error('Error approving request:', error);
                  }
                }
              }}
              sx={{ bgcolor: 'success.main' }}
            >
              Approve Request
            </Button>
          </DialogActions>
        </Dialog>

        {/* Rejection Dialog */}
        <Dialog
          open={rejectionDialogOpen}
          onClose={() => setRejectionDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            backgroundColor: 'error.50', 
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Cancel sx={{ color: 'error.main' }} />
            Reject Rental Request
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Reject rental request for <strong>{selectedRequest?.equipment_name}</strong> by <strong>{selectedRequest?.farmer_name}</strong>?
            </Typography>
            <TextField
              fullWidth
              label="Rejection Reason *"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              multiline
              rows={3}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectionDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={async () => {
                if (selectedRequest && rejectionReason.trim()) {
                  try {
                    await dispatch(rejectRentalRequest({ 
                      requestId: selectedRequest.id, 
                      rejectionReason: rejectionReason.trim(),
                      adminNotes: ''
                    }));
                    setRejectionDialogOpen(false);
                    setSelectedRequest(null);
                    setRejectionReason('');
                    fetchData();
                  } catch (error) {
                    console.error('Error rejecting request:', error);
                  }
                }
              }}
              disabled={!rejectionReason.trim()}
              sx={{ bgcolor: 'error.main' }}
            >
              Reject Request
            </Button>
          </DialogActions>
        </Dialog>

        {/* Pickup Confirmation Dialog */}
        <Dialog
          open={pickupDialogOpen}
          onClose={() => setPickupDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            backgroundColor: 'info.50', 
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <DirectionsCar sx={{ color: 'info.main' }} />
            Confirm Equipment Pickup
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Confirm pickup for <strong>{selectedRequest?.equipment_name}</strong> by <strong>{selectedRequest?.farmer_name}</strong>?
            </Typography>
            <TextField
              fullWidth
              label="Pickup Code *"
              value={pickupCode}
              onChange={(e) => setPickupCode(e.target.value)}
              placeholder="Enter pickup verification code..."
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPickupDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={async () => {
                if (selectedRequest && pickupCode.trim()) {
                  try {
                    await dispatch(confirmPickup(selectedRequest.id));
                    setPickupDialogOpen(false);
                    setSelectedRequest(null);
                    setPickupCode('');
                    fetchData();
                  } catch (error) {
                    console.error('Error confirming pickup:', error);
                  }
                }
              }}
              disabled={!pickupCode.trim()}
              sx={{ bgcolor: 'info.main' }}
            >
              Confirm Pickup
            </Button>
          </DialogActions>
        </Dialog>

        {/* Return Confirmation Dialog */}
        <Dialog
          open={returnDialogOpen}
          onClose={() => setReturnDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            backgroundColor: 'success.50', 
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Assignment sx={{ color: 'success.main' }} />
            Confirm Equipment Return
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Confirm return for <strong>{selectedRequest?.equipment_name}</strong> by <strong>{selectedRequest?.farmer_name}</strong>?
            </Typography>
            <TextField
              fullWidth
              label="Return Code *"
              value={returnCode}
              onChange={(e) => setReturnCode(e.target.value)}
              placeholder="Enter return verification code..."
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReturnDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={async () => {
                if (selectedRequest && returnCode.trim()) {
                  try {
                    await dispatch(confirmReturn(selectedRequest.id));
                    setReturnDialogOpen(false);
                    setSelectedRequest(null);
                    setReturnCode('');
                    fetchData();
                  } catch (error) {
                    console.error('Error confirming return:', error);
                  }
                }
              }}
              disabled={!returnCode.trim()}
              sx={{ bgcolor: 'success.main' }}
            >
              Confirm Return
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Rental Request Details Dialog */}
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
            <Visibility sx={{ color: 'primary.main' }} />
            Rental Request Details
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            {requestToView && (
              <Box sx={{ display: 'grid', gap: 3 }}>
                {/* Basic Information */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Request Information
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Request ID</Typography>
                        <Typography variant="body1" fontWeight={500}>#{requestToView.id}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Chip
                          label={requestToView.status.charAt(0).toUpperCase() + requestToView.status.slice(1)}
                          color={
                            requestToView.status === 'approved' ? 'success' : 
                            requestToView.status === 'rejected' ? 'error' : 
                            requestToView.status === 'completed' ? 'info' : 'warning'
                          }
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Request Date</Typography>
                        <Typography variant="body1">
                          {new Date(requestToView.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Equipment Details
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Equipment Name</Typography>
                        <Typography variant="body1" fontWeight={500}>{requestToView.equipment_name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Category</Typography>
                        <Typography variant="body1" fontWeight={500}>{requestToView.category_name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Rental Duration</Typography>
                        <Typography variant="body1" fontWeight={500}>{requestToView.rental_duration} days</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Rental Period */}
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Rental Period
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Start Date</Typography>
                      <Typography variant="h6" fontWeight={600} color="primary.main">
                        {new Date(requestToView.start_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">End Date</Typography>
                      <Typography variant="h6" fontWeight={600} color="primary.main">
                        {new Date(requestToView.end_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Financial Information */}
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Financial Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                      <Typography variant="h6" fontWeight={600} color="success.main">
                        Rs. {requestToView.total_amount}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Delivery Fee</Typography>
                      <Typography variant="h6" fontWeight={600} color="warning.main">
                        Rs. {requestToView.delivery_fee}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Security Deposit</Typography>
                      <Typography variant="h6" fontWeight={600} color="warning.main">
                        Rs. {requestToView.security_deposit}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Delivery Information */}
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Delivery Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Receiver Name</Typography>
                      <Typography variant="body1" fontWeight={500}>{requestToView.receiver_name}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Receiver Phone</Typography>
                      <Typography variant="body1" fontWeight={500}>{requestToView.receiver_phone}</Typography>
                    </Box>
                    <Box sx={{ gridColumn: { xs: '1 / -1', md: '1 / -1' } }}>
                      <Typography variant="body2" color="text.secondary">Delivery Address</Typography>
                      <Typography variant="body1">{requestToView.delivery_address}</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Additional Notes */}
                {requestToView.additional_notes && (
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Additional Notes
                    </Typography>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body1">{requestToView.additional_notes}</Typography>
                    </Box>
                  </Box>
                )}

                {/* Admin Notes */}
                {requestToView.admin_notes && (
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Admin Notes
                    </Typography>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body1">{requestToView.admin_notes}</Typography>
                    </Box>
                  </Box>
                )}

                {/* Timestamps */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Created</Typography>
                    <Typography variant="body1">
                      {new Date(requestToView.created_at).toLocaleDateString('en-US', {
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
                      {new Date(requestToView.updated_at).toLocaleDateString('en-US', {
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
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default RentalRequestsPage;
