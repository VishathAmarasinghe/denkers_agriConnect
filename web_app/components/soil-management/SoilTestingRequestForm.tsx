import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Close,
  Science,
  LocationOn,
  Phone,
  CalendarToday,
  Schedule,
  Notes,
  Save,
  Cancel,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SoilTestingRequest, SoilTestingRequestCreateData, SoilTestingRequestUpdateData } from '@/types/types';

interface SoilTestingRequestFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SoilTestingRequestCreateData | SoilTestingRequestUpdateData) => void;
  request?: SoilTestingRequest | null;
  loading: boolean;
  mode: 'create' | 'edit';
}

const SoilTestingRequestForm: React.FC<SoilTestingRequestFormProps> = ({
  open,
  onClose,
  onSubmit,
  request,
  loading,
  mode,
}) => {
  const [formData, setFormData] = useState<SoilTestingRequestCreateData>({
    soil_collection_center_id: 0,
    preferred_date: '',
    preferred_time_slot: '',
    farmer_phone: '',
    farmer_location_address: '',
    farmer_latitude: undefined,
    farmer_longitude: undefined,
    additional_notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (request && mode === 'edit') {
      // For edit mode, we only allow updating certain fields
      setFormData({
        soil_collection_center_id: request.soil_collection_center_id,
        preferred_date: request.preferred_date,
        preferred_time_slot: request.preferred_time_slot || '',
        farmer_phone: request.farmer_phone,
        farmer_location_address: request.farmer_location_address || '',
        farmer_latitude: request.farmer_latitude,
        farmer_longitude: request.farmer_longitude,
        additional_notes: request.additional_notes || '',
      });
    } else {
      setFormData({
        soil_collection_center_id: 0,
        preferred_date: '',
        preferred_time_slot: '',
        farmer_phone: '',
        farmer_location_address: '',
        farmer_latitude: undefined,
        farmer_longitude: undefined,
        additional_notes: '',
      });
    }
    setErrors({});
  }, [request, mode, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.soil_collection_center_id) {
      newErrors.soil_collection_center_id = 'Collection center is required';
    }

    if (!formData.preferred_date) {
      newErrors.preferred_date = 'Preferred date is required';
    }

    if (!formData.farmer_phone) {
      newErrors.farmer_phone = 'Farmer phone is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.farmer_phone)) {
      newErrors.farmer_phone = 'Please enter a valid phone number';
    }

    if (formData.farmer_latitude !== undefined && formData.farmer_longitude !== undefined) {
      if (formData.farmer_latitude < -90 || formData.farmer_latitude > 90) {
        newErrors.farmer_latitude = 'Latitude must be between -90 and 90';
      }
      if (formData.farmer_longitude < -180 || formData.farmer_longitude > 180) {
        newErrors.farmer_longitude = 'Longitude must be between -180 and 180';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const timeSlots = [
    '08:00-10:00',
    '10:00-12:00',
    '12:00-14:00',
    '14:00-16:00',
    '16:00-18:00',
  ];

  // Mock collection centers - in real app, this would come from API
  const collectionCenters = [
    { id: 1, name: 'Colombo Soil Testing Center', address: 'Colombo, Western Province' },
    { id: 2, name: 'Kandy Agricultural Center', address: 'Kandy, Central Province' },
    { id: 3, name: 'Galle Soil Lab', address: 'Galle, Southern Province' },
    { id: 4, name: 'Jaffna Testing Facility', address: 'Jaffna, Northern Province' },
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Science sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={600}>
            {mode === 'create' ? 'Create New Soil Testing Request' : 'Edit Soil Testing Request'}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={loading}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          {/* Collection Center Selection */}
          <Box>
            <FormControl fullWidth error={!!errors.soil_collection_center_id}>
              <InputLabel>Collection Center *</InputLabel>
              <Select
                value={formData.soil_collection_center_id}
                onChange={(e) => handleInputChange('soil_collection_center_id', e.target.value)}
                label="Collection Center *"
                disabled={loading}
              >
                {collectionCenters.map((center) => (
                  <MenuItem key={center.id} value={center.id}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {center.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {center.address}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.soil_collection_center_id && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.soil_collection_center_id}
                </Typography>
              )}
            </FormControl>
          </Box>

          {/* Preferred Date */}
          <Box>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Preferred Date *"
                value={formData.preferred_date ? new Date(formData.preferred_date) : null}
                onChange={(date) => handleInputChange('preferred_date', date ? date.toISOString().split('T')[0] : '')}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.preferred_date,
                    helperText: errors.preferred_date,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          {/* Time Slot */}
          <Box>
            <FormControl fullWidth>
              <InputLabel>Preferred Time Slot</InputLabel>
              <Select
                value={formData.preferred_time_slot}
                onChange={(e) => handleInputChange('preferred_time_slot', e.target.value)}
                label="Preferred Time Slot"
                disabled={loading}
              >
                <MenuItem value="">
                  <em>No preference</em>
                </MenuItem>
                {timeSlots.map((slot) => (
                  <MenuItem key={slot} value={slot}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                      {slot}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Farmer Phone */}
          <Box>
            <TextField
              fullWidth
              label="Farmer Phone *"
              value={formData.farmer_phone}
              onChange={(e) => handleInputChange('farmer_phone', e.target.value)}
              error={!!errors.farmer_phone}
              helperText={errors.farmer_phone}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Location Address */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <TextField
              fullWidth
              label="Farmer Location Address"
              value={formData.farmer_location_address}
              onChange={(e) => handleInputChange('farmer_location_address', e.target.value)}
              disabled={loading}
              multiline
              rows={2}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Coordinates */}
          <Box>
            <TextField
              fullWidth
              label="Latitude"
              type="number"
              value={formData.farmer_latitude || ''}
              onChange={(e) => handleInputChange('farmer_latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
              error={!!errors.farmer_latitude}
              helperText={errors.farmer_latitude || 'Optional: Enter latitude coordinate'}
              disabled={loading}
              inputProps={{
                step: 0.0001,
                min: -90,
                max: 90,
              }}
            />
          </Box>

          <Box>
            <TextField
              fullWidth
              label="Longitude"
              type="number"
              value={formData.farmer_longitude || ''}
              onChange={(e) => handleInputChange('farmer_longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
              error={!!errors.farmer_longitude}
              helperText={errors.farmer_longitude || 'Optional: Enter longitude coordinate'}
              disabled={loading}
              inputProps={{
                step: 0.0001,
                min: -180,
                max: 180,
              }}
            />
          </Box>

          {/* Additional Notes */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <TextField
              fullWidth
              label="Additional Notes"
              value={formData.additional_notes}
              onChange={(e) => handleInputChange('additional_notes', e.target.value)}
              disabled={loading}
              multiline
              rows={3}
              placeholder="Any special requirements, soil type information, or additional context..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Notes sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Form Info */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Note:</strong> This form creates a soil testing request that will be reviewed by administrators. 
                Once approved, you'll be notified of the scheduled testing date and time.
              </Typography>
            </Alert>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          startIcon={<Cancel />}
          variant="outlined"
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <Save />}
          variant="contained"
          sx={{ 
            backgroundColor: 'primary.main',
            '&:hover': { backgroundColor: 'primary.dark' }
          }}
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Request' : 'Update Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SoilTestingRequestForm;
