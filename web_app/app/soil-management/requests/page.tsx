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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
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
  Schedule,
  Upload,
  Visibility,
  Person,
  Phone,
  CalendarToday,
  Notes,
  Close,
  Save,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/slices/store';
import {
  fetchSoilTestingRequests,
  searchSoilTestingRequests,
  createSoilTestingRequest,
  updateSoilTestingRequest,
  getPendingSoilTestingRequests,
  clearMessages,
  setSearchParams,
} from '@/slices/soilTestingSlice/soilTesting';
import { SoilTestingRequest, SoilTestingRequestCreateData, SoilTestingRequestUpdateData, SoilTestingRequestSearchParams } from '@/types/types';
import SoilTestingRequestsTable from '@/components/soil-management/SoilTestingRequestsTable';
import SoilTestingRequestForm from '@/components/soil-management/SoilTestingRequestForm';
import AdminLayout from '@/components/layout/AdminLayout';

const SoilTestingRequestsPage = () => {
  const dispatch = useAppDispatch();
  const { requests, requestsPagination, loading, error, success } = useAppSelector((state) => state.soilTestingReducer);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useState<SoilTestingRequestSearchParams>({
    status: '',
    date_from: '',
    date_to: '',
    page: 1,
    limit: 10,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedRequest, setSelectedRequest] = useState<SoilTestingRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [uploadReportDialogOpen, setUploadReportDialogOpen] = useState(false);

  // Form states for different actions
  const [approveFormData, setApproveFormData] = useState({
    admin_notes: '',
    approved_date: '',
    approved_start_time: '',
    approved_end_time: '',
    field_officer_id: '',
  });

  const [rejectFormData, setRejectFormData] = useState({
    rejection_reason: '',
    admin_notes: '',
  });

  const [scheduleFormData, setScheduleFormData] = useState({
    approved_date: '',
    approved_start_time: '',
    approved_end_time: '',
    field_officer_id: '',
    admin_notes: '',
  });

  useEffect(() => {
    if (activeTab === 0) {
      dispatch(fetchSoilTestingRequests({ page: currentPage, limit: 10 }));
    } else if (activeTab === 1) {
      dispatch(getPendingSoilTestingRequests({ page: currentPage, limit: 10 }));
    }
  }, [dispatch, currentPage, activeTab]);

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
    dispatch(searchSoilTestingRequests(searchParams));
  };

  const handleClearSearch = () => {
    setSearchParams({
      status: '',
      date_from: '',
      date_to: '',
      page: 1,
      limit: 10,
    });
    setSearchTerm('');
    if (activeTab === 0) {
      dispatch(fetchSoilTestingRequests({ page: 1, limit: 10 }));
    } else {
      dispatch(getPendingSoilTestingRequests({ page: 1, limit: 10 }));
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    if (activeTab === 0) {
      dispatch(fetchSoilTestingRequests({ page, limit: 10 }));
    } else {
      dispatch(getPendingSoilTestingRequests({ page, limit: 10 }));
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setCurrentPage(1);
    if (newValue === 0) {
      dispatch(fetchSoilTestingRequests({ page: 1, limit: 10 }));
    } else {
      dispatch(getPendingSoilTestingRequests({ page: 1, limit: 10 }));
    }
  };

  const handleCreateRequest = () => {
    setFormMode('create');
    setSelectedRequest(null);
    setFormOpen(true);
  };

  const handleEditRequest = (request: SoilTestingRequest) => {
    setFormMode('edit');
    setSelectedRequest(request);
    setFormOpen(true);
  };

  const handleViewRequest = (request: SoilTestingRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleApproveRequest = (request: SoilTestingRequest) => {
    setSelectedRequest(request);
    setApproveDialogOpen(true);
  };

  const handleRejectRequest = (request: SoilTestingRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const handleScheduleRequest = (request: SoilTestingRequest) => {
    setSelectedRequest(request);
    setScheduleDialogOpen(true);
  };

  const handleUploadReport = (request: SoilTestingRequest) => {
    setSelectedRequest(request);
    setUploadReportDialogOpen(true);
  };

  const handleFormSubmit = async (data: SoilTestingRequestCreateData | SoilTestingRequestUpdateData) => {
    try {
      if (formMode === 'create') {
        await dispatch(createSoilTestingRequest(data as SoilTestingRequestCreateData));
      } else {
        await dispatch(updateSoilTestingRequest({
          id: selectedRequest!.id!,
          data: data as SoilTestingRequestUpdateData,
        }));
      }
      setFormOpen(false);
      // Refresh the list
      if (activeTab === 0) {
        dispatch(fetchSoilTestingRequests({ page: currentPage, limit: 10 }));
      } else {
        dispatch(getPendingSoilTestingRequests({ page: currentPage, limit: 10 }));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleApproveSubmit = async () => {
    if (selectedRequest) {
      try {
        await dispatch(updateSoilTestingRequest({
          id: selectedRequest.id!,
          data: {
            status: 'approved',
            admin_notes: approveFormData.admin_notes,
            approved_date: approveFormData.approved_date,
            approved_start_time: approveFormData.approved_start_time,
            approved_end_time: approveFormData.approved_end_time,
            field_officer_id: approveFormData.field_officer_id ? parseInt(approveFormData.field_officer_id) : undefined,
          },
        }));
        setApproveDialogOpen(false);
        setApproveFormData({
          admin_notes: '',
          approved_date: '',
          approved_start_time: '',
          approved_end_time: '',
          field_officer_id: '',
        });
        // Refresh the list
        if (activeTab === 0) {
          dispatch(fetchSoilTestingRequests({ page: currentPage, limit: 10 }));
        } else {
          dispatch(getPendingSoilTestingRequests({ page: currentPage, limit: 10 }));
        }
      } catch (error) {
        console.error('Error approving request:', error);
      }
    }
  };

  const handleRejectSubmit = async () => {
    if (selectedRequest) {
      try {
        await dispatch(updateSoilTestingRequest({
          id: selectedRequest.id!,
          data: {
            status: 'rejected',
            rejection_reason: rejectFormData.rejection_reason,
            admin_notes: rejectFormData.admin_notes,
          },
        }));
        setRejectDialogOpen(false);
        setRejectFormData({
          rejection_reason: '',
          admin_notes: '',
        });
        // Refresh the list
        if (activeTab === 0) {
          dispatch(fetchSoilTestingRequests({ page: currentPage, limit: 10 }));
        } else {
          dispatch(getPendingSoilTestingRequests({ page: currentPage, limit: 10 }));
        }
      } catch (error) {
        console.error('Error rejecting request:', error);
      }
    }
  };

  const handleScheduleSubmit = async () => {
    if (selectedRequest) {
      try {
        await dispatch(updateSoilTestingRequest({
          id: selectedRequest.id!,
          data: {
            status: 'approved',
            approved_date: scheduleFormData.approved_date,
            approved_start_time: scheduleFormData.approved_start_time,
            approved_end_time: scheduleFormData.approved_end_time,
            field_officer_id: scheduleFormData.field_officer_id ? parseInt(scheduleFormData.field_officer_id) : undefined,
            admin_notes: scheduleFormData.admin_notes,
          },
        }));
        setScheduleDialogOpen(false);
        setScheduleFormData({
          approved_date: '',
          approved_start_time: '',
          approved_end_time: '',
          field_officer_id: '',
          admin_notes: '',
        });
        // Refresh the list
        if (activeTab === 0) {
          dispatch(fetchSoilTestingRequests({ page: currentPage, limit: 10 }));
        } else {
          dispatch(getPendingSoilTestingRequests({ page: currentPage, limit: 10 }));
        }
      } catch (error) {
        console.error('Error scheduling request:', error);
      }
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedRequest(null);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedRequest(null);
  };

  const stats = [
    {
      title: 'Total Requests',
      value: requests.length,
      icon: <Science sx={{ fontSize: 24, color: '#52B788' }} />,
      color: '#52B788',
    },
    {
      title: 'Pending Requests',
      value: requests.filter(req => req.status === 'pending').length,
      icon: <Schedule sx={{ fontSize: 24, color: '#f59e0b' }} />,
      color: '#f59e0b',
    },
    {
      title: 'Approved Requests',
      value: requests.filter(req => req.status === 'approved').length,
      icon: <CheckCircle sx={{ fontSize: 24, color: '#16a34a' }} />,
      color: '#16a34a',
    },
    {
      title: 'Rejected Requests',
      value: requests.filter(req => req.status === 'rejected').length,
      icon: <Cancel sx={{ fontSize: 24, color: '#dc2626' }} />,
      color: '#dc2626',
    },
  ];

  const timeSlots = [
    '08:00-10:00',
    '10:00-12:00',
    '12:00-14:00',
    '14:00-16:00',
    '16:00-18:00',
  ];

  const fieldOfficers = [
    { id: 1, name: 'Dr. Kamal Perera', specialization: 'Soil Chemistry' },
    { id: 2, name: 'Dr. Nimal Silva', specialization: 'Agricultural Science' },
    { id: 3, name: 'Dr. Sunil Fernando', specialization: 'Environmental Science' },
  ];

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
            Soil Testing Requests
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage soil testing requests from farmers across Sri Lanka. Review, approve, reject, and schedule soil testing appointments.
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
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

        {/* Tabs */}
        <Paper sx={{ mb: 3, boxShadow: 'agriculture' }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="All Requests" />
            <Tab label="Pending Requests" />
          </Tabs>
        </Paper>

        {/* Search and Actions Bar */}
        <Paper sx={{ p: 3, mb: 3, boxShadow: 'agriculture' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Status"
              value={searchParams.status}
              onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
              select
              size="small"
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
            
            <TextField
              fullWidth
              label="Date From"
              type="date"
              value={searchParams.date_from || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, date_from: e.target.value }))}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              fullWidth
              label="Date To"
              type="date"
              value={searchParams.date_to || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, date_to: e.target.value }))}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleClearSearch}
                fullWidth
              >
                Clear
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Search />}
                onClick={handleSearch}
                fullWidth
              >
                Search
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateRequest}
              sx={{ 
                backgroundColor: 'primary.main',
                '&:hover': { backgroundColor: 'primary.dark' }
              }}
            >
              Create Request
            </Button>
          </Box>
        </Paper>

        {/* Requests Table */}
        <Paper sx={{ boxShadow: 'agriculture' }}>
          <SoilTestingRequestsTable
            requests={requests}
            onView={handleViewRequest}
            onEdit={handleEditRequest}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            onSchedule={handleScheduleRequest}
            onUploadReport={handleUploadReport}
            loading={loading}
          />
        </Paper>

        {/* Pagination */}
        {requestsPagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={requestsPagination.totalPages}
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
        <SoilTestingRequestForm
          open={formOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          request={selectedRequest}
          loading={loading}
          mode={formMode}
        />

        {/* View Dialog */}
        {selectedRequest && (
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
              Request Details: {selectedRequest.farmer_first_name} {selectedRequest.farmer_last_name}
            </DialogTitle>
            
            <DialogContent sx={{ pt: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Farmer Information</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedRequest.farmer_first_name} {selectedRequest.farmer_last_name} (ID: {selectedRequest.farmer_id})
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.farmer_phone}</Typography>
                  
                  {selectedRequest.farmer_location_address && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.farmer_location_address}</Typography>
                    </>
                  )}
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Collection Center</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.center_name || 'N/A'}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Preferred Date</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {new Date(selectedRequest.preferred_date).toLocaleDateString()}
                  </Typography>
                  
                  {selectedRequest.preferred_time_slot && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">Preferred Time</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.preferred_time_slot}</Typography>
                    </>
                  )}
                </Box>
                
                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    label={(selectedRequest.status ? selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1) : 'Pending')}
                    color={selectedRequest.status === 'pending' ? 'warning' : selectedRequest.status === 'approved' ? 'success' : 'error'}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Box>
                
                {selectedRequest.additional_notes && (
                  <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                    <Typography variant="subtitle2" color="text.secondary">Additional Notes</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.additional_notes}</Typography>
                  </Box>
                )}
                
                {selectedRequest.admin_notes && (
                  <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                    <Typography variant="subtitle2" color="text.secondary">Admin Notes</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedRequest.admin_notes}</Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button onClick={handleCloseViewDialog}>Close</Button>
              <Button
                variant="contained"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleEditRequest(selectedRequest);
                }}
                startIcon={<Edit />}
              >
                Edit Request
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Approve Dialog */}
        <Dialog
          open={approveDialogOpen}
          onClose={() => setApproveDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ color: 'success.main' }} />
              <Typography variant="h6">Approve Soil Testing Request</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {/* Request Information Section */}
              <Box sx={{ mb: 3, p: 2, borderRadius: 1, backgroundColor: 'primary.50' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Request Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Farmer</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedRequest ? `${selectedRequest.farmer_first_name} ${selectedRequest.farmer_last_name}` : 'Unknown Farmer'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedRequest?.farmer_phone || 'No phone'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Collection Center</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedRequest?.center_name || 'Unknown Center'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Preferred Date</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedRequest?.preferred_date ? new Date(selectedRequest.preferred_date).toLocaleDateString() : 'Not specified'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Approval Form Section */}
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Approval Details
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Admin Notes */}
                <TextField
                  fullWidth
                  label="Admin Notes"
                  value={approveFormData.admin_notes}
                  onChange={(e) => setApproveFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                  multiline
                  rows={3}
                  placeholder="Add any notes or instructions for the farmer..."
                  helperText="Optional: Provide additional context or instructions"
                />

                {/* Date and Field Officer Row */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Approved Date *"
                    type="date"
                    value={approveFormData.approved_date}
                    onChange={(e) => setApproveFormData(prev => ({ ...prev, approved_date: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    required
                    helperText="Select the date for soil collection"
                  />
                  
                  <FormControl fullWidth required>
                    <InputLabel>Field Officer *</InputLabel>
                    <Select
                      value={approveFormData.field_officer_id}
                      onChange={(e) => setApproveFormData(prev => ({ ...prev, field_officer_id: e.target.value }))}
                      label="Field Officer *"
                    >
                      <MenuItem value="">
                        <em>Select a field officer</em>
                      </MenuItem>
                      {fieldOfficers.map((officer) => (
                        <MenuItem key={officer.id} value={officer.id}>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {officer.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {officer.specialization}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Time Slots Row */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Start Time *</InputLabel>
                    <Select
                      value={approveFormData.approved_start_time}
                      onChange={(e) => setApproveFormData(prev => ({ ...prev, approved_start_time: e.target.value }))}
                      label="Start Time *"
                    >
                      <MenuItem value="">
                        <em>Select start time</em>
                      </MenuItem>
                      {timeSlots.map((slot) => (
                        <MenuItem key={slot} value={slot.split('-')[0]}>
                          {slot.split('-')[0]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth required>
                    <InputLabel>End Time *</InputLabel>
                    <Select
                      value={approveFormData.approved_end_time}
                      onChange={(e) => setApproveFormData(prev => ({ ...prev, approved_end_time: e.target.value }))}
                      label="End Time *"
                    >
                      <MenuItem value="">
                        <em>Select end time</em>
                      </MenuItem>
                      {timeSlots.map((slot) => (
                        <MenuItem key={slot} value={slot.split('-')[1]}>
                          {slot.split('-')[1]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button 
              onClick={() => setApproveDialogOpen(false)} 
              variant="outlined"
              startIcon={<Close />}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApproveSubmit} 
              variant="contained" 
              color="success"
              startIcon={<CheckCircle />}
              disabled={!approveFormData.approved_date || !approveFormData.field_officer_id || !approveFormData.approved_start_time || !approveFormData.approved_end_time}
            >
              Approve Request
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog
          open={rejectDialogOpen}
          onClose={() => setRejectDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Cancel sx={{ color: 'error.main' }} />
              <Typography variant="h6">Reject Soil Testing Request</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {/* Request Information Section */}
              <Box sx={{ mb: 3, p: 2, borderRadius: 1, backgroundColor: 'primary.50' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Request Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Farmer</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedRequest ? `${selectedRequest.farmer_first_name} ${selectedRequest.farmer_last_name}` : 'Unknown Farmer'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedRequest?.farmer_phone || 'No phone'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Collection Center</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedRequest?.center_name || 'Unknown Center'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Preferred Date</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedRequest?.preferred_date ? new Date(selectedRequest.preferred_date).toLocaleDateString() : 'Not specified'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Rejection Form Section */}
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Rejection Details
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Rejection Reason */}
                <TextField
                  fullWidth
                  label="Rejection Reason *"
                  value={rejectFormData.rejection_reason}
                  onChange={(e) => setRejectFormData(prev => ({ ...prev, rejection_reason: e.target.value }))}
                  multiline
                  rows={3}
                  required
                  placeholder="Please provide a clear reason for rejection..."
                  helperText="Required: Explain why this request is being rejected"
                  error={!rejectFormData.rejection_reason.trim()}
                />

                {/* Admin Notes */}
                <TextField
                  fullWidth
                  label="Admin Notes"
                  value={rejectFormData.admin_notes}
                  onChange={(e) => setRejectFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                  multiline
                  rows={2}
                  placeholder="Optional: Add any additional notes or suggestions..."
                  helperText="Optional: Provide additional context or suggestions for the farmer"
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button 
              onClick={() => setRejectDialogOpen(false)} 
              variant="outlined"
              startIcon={<Close />}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRejectSubmit} 
              variant="contained" 
              color="error"
              startIcon={<Cancel />}
              disabled={!rejectFormData.rejection_reason.trim()}
            >
              Reject Request
            </Button>
          </DialogActions>
        </Dialog>

        {/* Schedule Dialog */}
        <Dialog
          open={scheduleDialogOpen}
          onClose={() => setScheduleDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule sx={{ color: 'primary.main' }} />
              <Typography variant="h6">Schedule Soil Testing</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {/* Request Information Section */}
              <Box sx={{ mb: 3, p: 2, borderRadius: 1, backgroundColor: 'primary.50' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Request Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Farmer</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedRequest ? `${selectedRequest.farmer_first_name} ${selectedRequest.farmer_last_name}` : 'Unknown Farmer'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedRequest?.farmer_phone || 'No phone'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Collection Center</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedRequest?.center_name || 'Unknown Center'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Preferred Date</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedRequest?.preferred_date ? new Date(selectedRequest.preferred_date).toLocaleDateString() : 'Not specified'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Scheduling Form Section */}
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Scheduling Details
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Admin Notes */}
                <TextField
                  fullWidth
                  label="Admin Notes"
                  value={scheduleFormData.admin_notes}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                  multiline
                  rows={2}
                  placeholder="Add any notes or instructions for the farmer..."
                  helperText="Optional: Provide additional context or instructions"
                />

                {/* Date and Field Officer Row */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Scheduled Date *"
                    type="date"
                    value={scheduleFormData.approved_date}
                    onChange={(e) => setScheduleFormData(prev => ({ ...prev, approved_date: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    required
                    helperText="Select the date for soil collection"
                  />
                  
                  <FormControl fullWidth required>
                    <InputLabel>Field Officer *</InputLabel>
                    <Select
                      value={scheduleFormData.field_officer_id}
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, field_officer_id: e.target.value }))}
                      label="Field Officer *"
                    >
                      <MenuItem value="">
                        <em>Select a field officer</em>
                      </MenuItem>
                      {fieldOfficers.map((officer) => (
                        <MenuItem key={officer.id} value={officer.id}>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {officer.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {officer.specialization}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Time Slots Row */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Start Time *</InputLabel>
                    <Select
                      value={scheduleFormData.approved_start_time}
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, approved_start_time: e.target.value }))}
                      label="Start Time *"
                    >
                      <MenuItem value="">
                        <em>Select start time</em>
                      </MenuItem>
                      {timeSlots.map((slot) => (
                        <MenuItem key={slot} value={slot.split('-')[0]}>
                          {slot.split('-')[0]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth required>
                    <InputLabel>End Time *</InputLabel>
                    <Select
                      value={scheduleFormData.approved_end_time}
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, approved_end_time: e.target.value }))}
                      label="End Time *"
                    >
                      <MenuItem value="">
                        <em>Select end time</em>
                      </MenuItem>
                      {timeSlots.map((slot) => (
                        <MenuItem key={slot} value={slot.split('-')[1]}>
                          {slot.split('-')[1]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button 
              onClick={() => setScheduleDialogOpen(false)} 
              variant="outlined"
              startIcon={<Close />}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleScheduleSubmit} 
              variant="contained" 
              color="primary"
              startIcon={<Schedule />}
              disabled={!scheduleFormData.approved_date || !scheduleFormData.field_officer_id || !scheduleFormData.approved_start_time || !scheduleFormData.approved_end_time}
            >
              Schedule Testing
            </Button>
          </DialogActions>
        </Dialog>

        {/* Upload Report Dialog */}
        <Dialog
          open={uploadReportDialogOpen}
          onClose={() => setUploadReportDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Upload Soil Testing Report</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This feature will be implemented to allow field officers to upload soil testing reports.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadReportDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

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

export default SoilTestingRequestsPage;
