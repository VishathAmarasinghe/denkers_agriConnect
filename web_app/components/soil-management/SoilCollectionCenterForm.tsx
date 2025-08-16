'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
} from '@mui/material';

import {
  Science,
  LocationOn,
  Phone,
  Person,
  Schedule,
  Description,
  Image,
} from '@mui/icons-material';
import { SoilCollectionCenter, SoilCollectionCenterCreateData, SoilCollectionCenterUpdateData, GooglePlaceResult } from '@/types/types';
import GooglePlacesAutocomplete from '@/components/ui/GooglePlacesAutocomplete';

interface SoilCollectionCenterFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SoilCollectionCenterCreateData | SoilCollectionCenterUpdateData) => void;
  center?: SoilCollectionCenter | null;
  loading?: boolean;
  mode: 'create' | 'edit';
}

const SoilCollectionCenterForm: React.FC<SoilCollectionCenterFormProps> = ({
  open,
  onClose,
  onSubmit,
  center,
  loading = false,
  mode,
}) => {
  const [formData, setFormData] = useState<SoilCollectionCenterCreateData & { is_active?: boolean }>({
    name: '',
    location_id: 1, // Default location ID
    address: '',
    contact_number: '',
    contact_person: '',
    description: '',
    image_url: '',
    latitude: undefined,
    longitude: undefined,
    place_id: '',
    operating_hours: '',
    services_offered: '',
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPlace, setSelectedPlace] = useState<GooglePlaceResult | null>(null);

  useEffect(() => {
    if (center && mode === 'edit') {
      setFormData({
        name: center.name || '',
        location_id: center.location_id || 1,
        address: center.address || '',
        contact_number: center.contact_number || '',
        contact_person: center.contact_person || '',
        description: center.description || '',
        image_url: center.image_url || '',
        latitude: center.latitude || undefined,
        longitude: center.longitude || undefined,
        place_id: center.place_id || '',
        operating_hours: center.operating_hours || '',
        services_offered: center.services_offered || '',
        is_active: center.is_active,
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        location_id: 1,
        address: '',
        contact_number: '',
        contact_person: '',
        description: '',
        image_url: '',
        latitude: undefined,
        longitude: undefined,
        place_id: '',
        operating_hours: '',
        services_offered: '',
      });
    }
    setErrors({});
    setSelectedPlace(null);
  }, [center, mode, open]);

  const handleInputChange = (field: keyof (SoilCollectionCenterCreateData & { is_active?: boolean }), value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePlaceSelect = (place: GooglePlaceResult) => {
    setSelectedPlace(place);
    setFormData(prev => ({
      ...prev,
      place_id: place.place_id,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      address: place.description,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Center name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.contact_number.trim()) {
      newErrors.contact_number = 'Contact number is required';
    }

    if (formData.contact_number && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.contact_number)) {
      newErrors.contact_number = 'Please enter a valid contact number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const submitData = mode === 'edit' && center?.id 
        ? { ...formData, id: center.id } as SoilCollectionCenterUpdateData
        : formData;
      
      onSubmit(submitData);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

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
        gap: 1
      }}>
        <Science sx={{ color: 'primary.main' }} />
        {mode === 'create' ? 'Add New Soil Collection Center' : 'Edit Soil Collection Center'}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'grid', gap: 3 }}>
          {/* Basic Information */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              Basic Information
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Center Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Science sx={{ color: '#52B788', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Contact Number"
              value={formData.contact_number}
              onChange={(e) => handleInputChange('contact_number', e.target.value)}
              error={!!errors.contact_number}
              helperText={errors.contact_number}
              required
              placeholder="+94 11 123 4567"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: '#52B788', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Contact Person"
              value={formData.contact_person}
              onChange={(e) => handleInputChange('contact_person', e.target.value)}
              placeholder="John Doe"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: '#52B788', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Operating Hours"
              value={formData.operating_hours}
              onChange={(e) => handleInputChange('operating_hours', e.target.value)}
              placeholder="8:00 AM - 5:00 PM"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Schedule sx={{ color: '#52B788', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={3}
              placeholder="Brief description of the center and its services..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description sx={{ color: '#52B788', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box>
            <TextField
              fullWidth
              label="Services Offered"
              value={formData.services_offered}
              onChange={(e) => handleInputChange('services_offered', e.target.value)}
              multiline
              rows={2}
              placeholder="Soil testing, sample collection, analysis reports..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Science sx={{ color: '#52B788', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              Location & Address
            </Typography>
          </Box>

          <Box>
            <GooglePlacesAutocomplete
              value={formData.address}
              onChange={(value) => handleInputChange('address', value)}
              onPlaceSelect={handlePlaceSelect}
              label="Address"
              placeholder="Search for a location in Sri Lanka..."
              required
              error={!!errors.address}
              helperText={errors.address}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Latitude"
              value={formData.latitude || ''}
              onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || undefined)}
              type="number"
              inputProps={{ step: 'any' }}
              placeholder="6.9271"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn sx={{ color: '#52B788', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Longitude"
              value={formData.longitude || ''}
              onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || undefined)}
              type="number"
              inputProps={{ step: 'any' }}
              placeholder="79.8612"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn sx={{ color: '#52B788', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              Additional Details
            </Typography>
          </Box>

          <Box>
            <TextField
              fullWidth
              label="Image URL"
              value={formData.image_url}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Image sx={{ color: '#52B788', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {mode === 'edit' && (
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active !== false}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    color="primary"
                  />
                }
                label="Center Active"
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Center' : 'Update Center'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SoilCollectionCenterForm;
