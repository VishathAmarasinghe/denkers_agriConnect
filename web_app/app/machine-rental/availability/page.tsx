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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Avatar,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Settings,
  TrendingUp,
  Schedule,
  Warning,
  Refresh,
  CalendarToday,
  Block,
  CheckBox,
  DateRange,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/slices/store';
import {
  fetchEquipment,
  setEquipmentAvailability,
  checkEquipmentAvailability,
  clearMessages,
} from '@/slices/machineRentalSlice/machineRental';
import { Equipment, EquipmentAvailability } from '@/types/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const AvailabilityPage = () => {
  const dispatch = useAppDispatch();
  const { 
    equipment, 
    equipmentAvailability, 
    loading, 
    error, 
    success 
  } = useAppSelector((state) => state.machineRentalReducer);
  
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [availabilityStartDate, setAvailabilityStartDate] = useState<Date | null>(null);
  const [availabilityEndDate, setAvailabilityEndDate] = useState<Date | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [reason, setReason] = useState('');
  
  // Separate state for availability checker
  const [checkerStartDate, setCheckerStartDate] = useState<Date | null>(null);
  const [checkerEndDate, setCheckerEndDate] = useState<Date | null>(null);
  const [selectedEquipmentForCheck, setSelectedEquipmentForCheck] = useState<Equipment | null>(null);
  
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [equipmentToView, setEquipmentToView] = useState<Equipment | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

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
      await dispatch(fetchEquipment({ page: 1, limit: 100 }));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSetAvailability = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setAvailabilityStartDate(null);
    setAvailabilityEndDate(null);
    setIsAvailable(true);
    setReason('');
    setAvailabilityDialogOpen(true);
  };

  const handleCheckAvailability = async (equipment: Equipment) => {
    if (checkerStartDate && checkerEndDate) {
      try {
        await dispatch(checkEquipmentAvailability({
          equipmentId: equipment.id,
          startDate: checkerStartDate.toISOString().split('T')[0],
          endDate: checkerEndDate.toISOString().split('T')[0],
        }));
      } catch (error) {
        console.error('Error checking availability:', error);
      }
    }
  };

  const handleAvailabilitySubmit = async () => {
    if (selectedEquipment && availabilityStartDate && availabilityEndDate) {
      try {
        // Generate array of dates between start and end date
        const dates: string[] = [];
        const currentDate = new Date(availabilityStartDate);
        const endDate = new Date(availabilityEndDate);
        
        while (currentDate <= endDate) {
          dates.push(currentDate.toISOString().split('T')[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }

        await dispatch(setEquipmentAvailability({
          equipmentId: selectedEquipment.id,
          dates,
          isAvailable,
          reason: reason?.trim() || undefined,
        }));
        setAvailabilityDialogOpen(false);
        setSelectedEquipment(null);
        setAvailabilityStartDate(null);
        setAvailabilityEndDate(null);
        setIsAvailable(true);
        setReason('');
        fetchData();
      } catch (error) {
        console.error('Error setting availability:', error);
      }
    }
  };

  const handleCloseAvailabilityDialog = () => {
    setAvailabilityDialogOpen(false);
    setSelectedEquipment(null);
    setAvailabilityStartDate(null);
    setAvailabilityEndDate(null);
    setIsAvailable(true);
    setReason('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'rented': return 'warning';
      case 'maintenance': return 'error';
      case 'out_of_service': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle />;
      case 'rented': return <TrendingUp />;
      case 'maintenance': return <Warning />;
      case 'out_of_service': return <Block />;
      default: return <Settings />;
    }
  };

  const stats = [
    {
      title: 'Total Equipment',
      value: equipment.length,
      icon: <Settings sx={{ fontSize: 24, color: '#2563eb' }} />,
      color: '#2563eb',
    },
    {
      title: 'Available Now',
      value: equipment.filter(eq => eq.is_available && eq.current_status === 'available').length,
      icon: <CheckCircle sx={{ fontSize: 24, color: '#059669' }} />,
      color: '#059669',
    },
    {
      title: 'Currently Rented',
      value: equipment.filter(eq => eq.current_status === 'rented').length,
      icon: <TrendingUp sx={{ fontSize: 24, color: '#d97706' }} />,
      color: '#d97706',
    },
    {
      title: 'Under Maintenance',
      value: equipment.filter(eq => eq.current_status === 'maintenance').length,
      icon: <Warning sx={{ fontSize: 24, color: '#dc2626' }} />,
      color: '#dc2626',
    },
  ];

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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AdminLayout>
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
              Equipment Availability Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Set and manage equipment availability schedules, maintenance periods, and rental blocks.
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

          {/* Availability Checker */}
          <Paper sx={{ p: 3, mb: 3, boxShadow: 'agriculture' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Check Equipment Availability
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2, alignItems: 'center' }}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Equipment</InputLabel>
                <Select
                  value={selectedEquipmentForCheck?.id || ''}
                  onChange={(e) => {
                    const eq = equipment.find(eq => eq.id === e.target.value);
                    setSelectedEquipmentForCheck(eq || null);
                  }}
                  label="Select Equipment"
                >
                  {equipment.map((eq) => (
                    <MenuItem key={eq.id} value={eq.id}>
                      {eq.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <DatePicker
                label="Start Date"
                value={checkerStartDate}
                onChange={(newValue) => setCheckerStartDate(newValue ? new Date(newValue as any) : null)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              
              <DatePicker
                label="End Date"
                value={checkerEndDate}
                onChange={(newValue) => setCheckerEndDate(newValue ? new Date(newValue as any) : null)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              
              <Button
                variant="contained"
                onClick={() => selectedEquipmentForCheck && handleCheckAvailability(selectedEquipmentForCheck)}
                disabled={!selectedEquipmentForCheck || !checkerStartDate || !checkerEndDate}
                fullWidth
                sx={{ 
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)' }
                }}
              >
                Check
              </Button>
            </Box>
            
            {/* Availability Check Results */}
            {equipmentAvailability && Object.keys(equipmentAvailability).length > 0 && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Availability Results:
                </Typography>
                <Typography variant="body2">
                  Available Dates: {equipmentAvailability.available_dates?.join(', ') || 'None'}
                </Typography>
                <Typography variant="body2">
                  Unavailable Dates: {equipmentAvailability.unavailable_dates?.join(', ') || 'None'}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Actions Bar */}
          <Paper sx={{ p: 3, mb: 3, boxShadow: 'agriculture' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={600}>
                Equipment Availability
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

          {/* Equipment Table */}
          <Paper sx={{ boxShadow: 'agriculture' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.50' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Equipment</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Current Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Availability</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {equipment.map((eq) => (
                    <TableRow key={eq.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                            <Settings sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {eq.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {eq.description || 'No description'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {eq.category_name || 'Unknown'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(eq.current_status)}
                          label={eq.current_status.charAt(0).toUpperCase() + eq.current_status.slice(1)}
                          color={getStatusColor(eq.current_status) as any}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          icon={eq.is_available ? <CheckCircle /> : <Cancel />}
                          label={eq.is_available ? 'Available' : 'Unavailable'}
                          color={eq.is_available ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Set Availability">
                            <IconButton
                              size="small"
                              onClick={() => handleSetAvailability(eq)}
                              sx={{ color: 'primary.main' }}
                            >
                              <CalendarToday />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              sx={{ color: 'primary.main' }}
                              onClick={() => {
                                setEquipmentToView(eq);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Visibility />
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

          {/* Set Availability Dialog */}
          <Dialog
            open={availabilityDialogOpen}
            onClose={handleCloseAvailabilityDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Set Equipment Availability</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Setting availability for: <strong>{selectedEquipment?.name}</strong>
                </Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                <DatePicker
                  label="Start Date"
                  value={availabilityStartDate}
                  onChange={(newValue) => setAvailabilityStartDate(newValue ? new Date(newValue as any) : null)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                
                <DatePicker
                  label="End Date"
                  value={availabilityEndDate}
                  onChange={(newValue) => setAvailabilityEndDate(newValue ? new Date(newValue as any) : null)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={isAvailable ? 'Available for Rent' : 'Not Available for Rent'}
                  sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}
                />
                
                <TextField
                  fullWidth
                  label="Reason (Optional)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={isAvailable ? "e.g., Regular availability" : "e.g., Maintenance, Out of service"}
                  multiline
                  rows={2}
                  sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAvailabilityDialog}>Cancel</Button>
              <Button 
                onClick={handleAvailabilitySubmit} 
                variant="contained"
                disabled={!availabilityStartDate || !availabilityEndDate}
                sx={{ 
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)' }
                }}
              >
                Set Availability
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
              <Settings sx={{ color: 'primary.main' }} />
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
                            icon={equipmentToView.is_active ? <CheckCircle /> : <CheckCircle />}
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
                        <Typography variant="h6" fontWeight={600} color="primary.main">
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
                      <Typography variant="body2" color="text.secondary">Updated</Typography>
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
            </DialogActions>
          </Dialog>
        </Box>
      </AdminLayout>
    </LocalizationProvider>
  );
};

export default AvailabilityPage;
