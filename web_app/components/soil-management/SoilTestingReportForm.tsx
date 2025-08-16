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
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  FormHelperText,
} from '@mui/material';
import {
  Close,
  Science,
  Save,
  Cancel,
  CloudUpload,
  Description,
  Assessment,
  Visibility,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SoilTestingReport, SoilTestingReportCreateData, SoilTestingReportUpdateData, User, FieldOfficer, SoilCollectionCenter } from '@/types/types';
import { ServiceBaseUrl } from '@/config/config';

interface SoilTestingReportFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SoilTestingReportCreateData | SoilTestingReportUpdateData | FormData) => void;
  report?: SoilTestingReport | null;
  loading: boolean;
  mode: 'create' | 'edit';
}

const SoilTestingReportForm: React.FC<SoilTestingReportFormProps> = ({
  open,
  onClose,
  onSubmit,
  report,
  loading,
  mode,
}) => {
  const [formData, setFormData] = useState<SoilTestingReportCreateData>({
    soil_testing_id: 0,
    farmer_id: 0,
    soil_collection_center_id: 0,
    field_officer_id: 0,
    report_file_name: '',
    report_file_path: '',
    report_file_size: 0,
    report_file_type: '',
    report_title: '',
    report_summary: '',
    soil_ph: undefined,
    soil_nitrogen: undefined,
    soil_phosphorus: undefined,
    soil_potassium: undefined,
    soil_organic_matter: undefined,
    soil_texture: '',
    recommendations: '',
    testing_date: '',
    report_date: '',
    is_public: false,
  });

  const [soilTestingRequests, setSoilTestingRequests] = useState<any[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [farmers, setFarmers] = useState<User[]>([]);
  const [fieldOfficers, setFieldOfficers] = useState<FieldOfficer[]>([]);
  const [collectionCenters, setCollectionCenters] = useState<SoilCollectionCenter[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (open) {
      console.log('Form opened, fetching dropdown data...');
      fetchDropdownData();
    }
  }, [open]);

  useEffect(() => {
    if (report && mode === 'edit') {
      setFormData({
        soil_testing_id: report.soil_testing_id,
        farmer_id: report.farmer_id,
        soil_collection_center_id: report.soil_collection_center_id,
        field_officer_id: report.field_officer_id,
        report_file_name: report.report_file_name,
        report_file_path: report.report_file_path,
        report_file_size: report.report_file_size,
        report_file_type: report.report_file_type,
        report_title: report.report_title,
        report_summary: report.report_summary || '',
        soil_ph: report.soil_ph,
        soil_nitrogen: report.soil_nitrogen,
        soil_phosphorus: report.soil_phosphorus,
        soil_potassium: report.soil_potassium,
        soil_organic_matter: report.soil_organic_matter,
        soil_texture: report.soil_texture || '',
        recommendations: report.recommendations || '',
        testing_date: report.testing_date,
        report_date: report.report_date,
        is_public: report.is_public,
      });
    } else {
      setFormData({
        soil_testing_id: 0,
        farmer_id: 0,
        soil_collection_center_id: 0,
        field_officer_id: 0,
        report_file_name: '',
        report_file_path: '',
        report_file_size: 0,
        report_file_type: '',
        report_title: '',
        report_summary: '',
        soil_ph: undefined,
        soil_nitrogen: undefined,
        soil_phosphorus: undefined,
        soil_potassium: undefined,
        soil_organic_matter: undefined,
        soil_texture: '',
        recommendations: '',
        testing_date: new Date().toISOString().split('T')[0],
        report_date: new Date().toISOString().split('T')[0],
        is_public: false,
      });
    }
    setErrors({});
    setFile(null);
  }, [report, mode, open]);

  const fetchDropdownData = async () => {
    setLoadingData(true);
    
    try {
      // Fetch farmers from public endpoint
      const farmersUrl = `${ServiceBaseUrl}/api/v1/users/farmers?page=1&limit=100`;
      
      const farmersResponse = await fetch(farmersUrl);
      
      if (farmersResponse.ok) {
        const farmersData = await farmersResponse.json();
        console.log('Farmers response data:', farmersData);
        
        // Handle nested data structure: farmersData.data.data
        const farmersArray = farmersData.data?.data || farmersData.data || [];
        console.log('Farmers array to set:', farmersArray);
        
        if (Array.isArray(farmersArray)) {
          setFarmers(farmersArray);
          console.log('Farmers loaded:', farmersArray);
          console.log('Farmers state updated:', farmersArray);
        } else {
          console.error('Farmers data is not an array:', farmersArray);
          setFarmers([]);
        }
      } else {
        console.error('Failed to fetch farmers:', farmersResponse.status);
        const errorText = await farmersResponse.text();
        console.error('Farmers error response:', errorText);
        setFarmers([]);
      }

      // Fetch field officers
      const fieldOfficersUrl = `${ServiceBaseUrl}/api/v1/field-officer?page=1&limit=100`;
      console.log('Fetching field officers from:', fieldOfficersUrl);
      
      const fieldOfficersResponse = await fetch(fieldOfficersUrl);
      console.log('Field officers response status:', fieldOfficersResponse.status);
      console.log('Field officers response ok:', fieldOfficersResponse.ok);
      
      if (fieldOfficersResponse.ok) {
        const fieldOfficersData = await fieldOfficersResponse.json();
        console.log('Field officers response data:', fieldOfficersData);
        
        // Handle nested data structure: fieldOfficersData.data.data
        const fieldOfficersArray = fieldOfficersData.data?.data || fieldOfficersData.data || [];
        console.log('Field officers array to set:', fieldOfficersArray);
        
        // Ensure it's an array
        if (Array.isArray(fieldOfficersArray)) {
          setFieldOfficers(fieldOfficersArray);
          console.log('Field officers loaded:', fieldOfficersArray);
          console.log('Field officers state updated:', fieldOfficersArray);
        } else {
          console.error('Field officers data is not an array:', fieldOfficersArray);
          setFieldOfficers([]);
        }
      } else {
        console.error('Failed to fetch field officers:', fieldOfficersResponse.status);
        const errorText = await fieldOfficersResponse.text();
        console.error('Field officers error response:', errorText);
        setFieldOfficers([]);
      }

      // Fetch collection centers
      const centersUrl = `${ServiceBaseUrl}/api/v1/soil-collection-centers?page=1&limit=100`;
      console.log('Fetching collection centers from:', centersUrl);
      
      const centersResponse = await fetch(centersUrl);
      console.log('Collection centers response status:', centersResponse.status);
      console.log('Collection centers response ok:', centersResponse.ok);
      
      if (centersResponse.ok) {
        const centersData = await centersResponse.json();
        console.log('Collection centers response data:', centersData);
        
        // Handle nested data structure: centersData.data.data
        const centersArray = centersData.data?.data || centersData.data || [];
        console.log('Collection centers array to set:', centersArray);
        
        // Ensure it's an array
        if (Array.isArray(centersArray)) {
          setCollectionCenters(centersArray);
          console.log('Collection centers loaded:', centersArray);
          console.log('Collection centers state updated:', centersArray);
        } else {
          console.error('Collection centers data is not an array:', centersArray);
          setCollectionCenters([]);
        }
      } else {
        console.error('Failed to fetch collection centers:', centersResponse.status);
        const errorText = await centersResponse.text();
        console.error('Collection centers error response:', errorText);
        setCollectionCenters([]);
      }

      // Fetch soil testing requests (optional - for linking reports to existing requests)
      const requestsUrl = `${ServiceBaseUrl}/api/v1/soil-testing-scheduling/completed`;
      console.log('Fetching soil testing requests from:', requestsUrl);
      
      const requestsResponse = await fetch(requestsUrl);
      console.log('Soil testing requests response status:', requestsResponse.status);
      
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        console.log('Soil testing requests response data:', requestsData);
        
        // Handle nested data structure: requestsData.data.data
        const requestsArray = requestsData.data?.data || requestsData.data || [];
        console.log('Soil testing requests array to set:', requestsArray);
        
        // Ensure it's an array
        if (Array.isArray(requestsArray)) {
          setSoilTestingRequests(requestsArray);
          console.log('Soil testing requests loaded:', requestsArray);
        } else {
          console.error('Soil testing requests data is not an array:', requestsArray);
          setSoilTestingRequests([]);
        }
      } else {
        console.error('Failed to fetch soil testing requests:', requestsResponse.status);
        setSoilTestingRequests([]);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoadingData(false);
      console.log('Finished fetching dropdown data');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFormData(prev => ({
        ...prev,
        report_file_name: selectedFile.name,
        report_file_type: selectedFile.type,
        report_file_size: selectedFile.size,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.report_title.trim()) {
      newErrors.report_title = 'Report title is required';
    }
    if (!formData.farmer_id) {
      newErrors.farmer_id = 'Farmer is required';
    }
    if (!formData.soil_collection_center_id) {
      newErrors.soil_collection_center_id = 'Collection center is required';
    }
    if (!formData.field_officer_id) {
      newErrors.field_officer_id = 'Field officer is required';
    }
    if (!formData.testing_date) {
      newErrors.testing_date = 'Testing date is required';
    }
    if (!formData.report_date) {
      newErrors.report_date = 'Report date is required';
    }
    if (mode === 'create' && !file) {
      newErrors.file = 'Report file is required';
    }

    // soil_testing_id is optional, so no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let finalData = { ...formData };

      if (mode === 'create' && file) {
        // For file uploads, we need to send FormData instead of JSON
        const formDataToSend = new FormData();
        
        // Add all the form fields
        Object.keys(finalData).forEach(key => {
          if (finalData[key as keyof typeof finalData] !== undefined && finalData[key as keyof typeof finalData] !== null) {
            // Handle soil_testing_id specially - convert empty string to 0
            if (key === 'soil_testing_id' && finalData[key as keyof typeof finalData] === '') {
              formDataToSend.append(key, '0');
            } else {
              formDataToSend.append(key, finalData[key as keyof typeof finalData] as string);
            }
          }
        });
        
        // Add the file
        formDataToSend.append('report_file', file);
        
        // Call onSubmit with FormData
        await onSubmit(formDataToSend);
      } else {
        // For edit mode or no file, send JSON data
        await onSubmit(finalData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
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
            {mode === 'create' ? 'Create Soil Testing Report' : 'Edit Soil Testing Report'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {loadingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            {/* Basic Information */}
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                Basic Information
              </Typography>
              
              <TextField
                fullWidth
                label="Report Title *"
                value={formData.report_title}
                onChange={(e) => handleInputChange('report_title', e.target.value)}
                error={!!errors.report_title}
                helperText={errors.report_title}
                disabled={loading}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Report Summary"
                value={formData.report_summary}
                onChange={(e) => handleInputChange('report_summary', e.target.value)}
                disabled={loading}
                multiline
                rows={3}
                placeholder="Brief summary of the soil testing report..."
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Assessment sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Visibility</InputLabel>
                <Select
                  value={(formData.is_public ?? false).toString()}
                  onChange={(e) => handleInputChange('is_public', e.target.value === 'true')}
                  label="Visibility"
                  disabled={loading}
                >
                  <MenuItem value="false">Private</MenuItem>
                  <MenuItem value="true">Public</MenuItem>
                </Select>
              </FormControl>
            </Card>

            {/* File Upload */}
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                Report File
              </Typography>
              
              <input
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                id="report-file-upload"
                type="file"
                onChange={handleFileChange}
                disabled={loading}
              />
              <label htmlFor="report-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  disabled={loading}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {file ? 'Change File' : 'Upload Report File'}
                </Button>
              </label>

              {file && (
                <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    Selected File: {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Size: {(file.size / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
              )}

              {errors.file && (
                <FormHelperText error sx={{ mt: 1 }}>
                  {errors.file}
                </FormHelperText>
              )}
            </Card>

            {/* Stakeholder Information */}
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                Stakeholder Information
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Link to Soil Testing Request (Optional)</InputLabel>
                <Select
                  value={formData.soil_testing_id || ''}
                  onChange={(e) => handleInputChange('soil_testing_id', e.target.value)}
                  label="Link to Soil Testing Request (Optional)"
                  disabled={loading}
                >
                  <MenuItem value="">
                    <em>No link - Create standalone report</em>
                  </MenuItem>
                  {Array.isArray(soilTestingRequests) && soilTestingRequests.map((request) => (
                    <MenuItem key={request.id} value={request.id}>
                      Request #{request.id} - {request.farmer_name} - {new Date(request.preferred_date).toLocaleDateString()} ({request.status})
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Link this report to an existing completed or approved soil testing request (optional)
                </FormHelperText>
              </FormControl>
              
              <FormControl fullWidth error={!!errors.farmer_id} sx={{ mb: 2 }}>
                <InputLabel>Farmer *</InputLabel>
                <Select
                  value={formData.farmer_id}
                  onChange={(e) => handleInputChange('farmer_id', e.target.value)}
                  label="Farmer *"
                  disabled={loading}
                >
                  {Array.isArray(farmers) && farmers.map((farmer) => (
                    <MenuItem key={farmer.id} value={farmer.id}>
                      {farmer.first_name} {farmer.last_name} - {farmer.phone}
                    </MenuItem>
                  ))}
                </Select>
                {errors.farmer_id && (
                  <FormHelperText error>{errors.farmer_id}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth error={!!errors.soil_collection_center_id} sx={{ mb: 2 }}>
                <InputLabel>Collection Center *</InputLabel>
                <Select
                  value={formData.soil_collection_center_id}
                  onChange={(e) => handleInputChange('soil_collection_center_id', e.target.value)}
                  label="Collection Center *"
                  disabled={loading}
                >
                  {Array.isArray(collectionCenters) && collectionCenters.map((center) => (
                    <MenuItem key={center.id} value={center.id}>
                      {center.name} - {center.address}
                    </MenuItem>
                  ))}
                </Select>
                {errors.soil_collection_center_id && (
                  <FormHelperText error>{errors.soil_collection_center_id}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth error={!!errors.field_officer_id} sx={{ mb: 2 }}>
                <InputLabel>Field Officer *</InputLabel>
                <Select
                  value={formData.field_officer_id}
                  onChange={(e) => handleInputChange('field_officer_id', e.target.value)}
                  label="Field Officer *"
                  disabled={loading}
                >
                  {Array.isArray(fieldOfficers) && fieldOfficers.map((officer) => (
                    <MenuItem key={officer.id} value={officer.id}>
                      {officer.name} - {officer.designation}
                    </MenuItem>
                  ))}
                </Select>
                {errors.field_officer_id && (
                  <FormHelperText error>{errors.field_officer_id}</FormHelperText>
                )}
              </FormControl>
            </Card>

            {/* Dates */}
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                Important Dates
              </Typography>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Testing Date *"
                  value={formData.testing_date ? new Date(formData.testing_date) : null}
                  onChange={(date) => handleInputChange('testing_date', date ? date.toISOString().split('T')[0] : '')}
                  disabled={loading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.testing_date,
                      helperText: errors.testing_date,
                      sx: { mb: 2 },
                    },
                  }}
                />

                <DatePicker
                  label="Report Date *"
                  value={formData.report_date ? new Date(formData.report_date) : null}
                  onChange={(date) => handleInputChange('report_date', date ? date.toISOString().split('T')[0] : '')}
                  disabled={loading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.report_date,
                      helperText: errors.report_date,
                    },
                  }}
                />
              </LocalizationProvider>
            </Card>

            {/* Soil Analysis Results */}
            <Card variant="outlined" sx={{ p: 2, gridColumn: { xs: '1 / -1', md: '1 / -1' } }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                Soil Analysis Results
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="pH Level"
                  type="number"
                  value={formData.soil_ph || ''}
                  onChange={(e) => handleInputChange('soil_ph', e.target.value ? parseFloat(e.target.value) : undefined)}
                  disabled={loading}
                  inputProps={{ step: 0.1, min: 0, max: 14 }}
                />

                <TextField
                  fullWidth
                  label="Nitrogen (N)"
                  type="number"
                  value={formData.soil_nitrogen || ''}
                  onChange={(e) => handleInputChange('soil_nitrogen', e.target.value ? parseFloat(e.target.value) : undefined)}
                  disabled={loading}
                  inputProps={{ step: 0.01, min: 0 }}
                />

                <TextField
                  fullWidth
                  label="Phosphorus (P)"
                  type="number"
                  value={formData.soil_phosphorus || ''}
                  onChange={(e) => handleInputChange('soil_phosphorus', e.target.value ? parseFloat(e.target.value) : undefined)}
                  disabled={loading}
                  inputProps={{ step: 0.01, min: 0 }}
                />

                <TextField
                  fullWidth
                  label="Potassium (K)"
                  type="number"
                  value={formData.soil_potassium || ''}
                  onChange={(e) => handleInputChange('soil_potassium', e.target.value ? parseFloat(e.target.value) : undefined)}
                  disabled={loading}
                  inputProps={{ step: 0.01, min: 0 }}
                />

                <TextField
                  fullWidth
                  label="Organic Matter (%)"
                  type="number"
                  value={formData.soil_organic_matter || ''}
                  onChange={(e) => handleInputChange('soil_organic_matter', e.target.value ? parseFloat(e.target.value) : undefined)}
                  disabled={loading}
                  inputProps={{ step: 0.1, min: 0, max: 100 }}
                />

                <TextField
                  fullWidth
                  label="Soil Texture"
                  value={formData.soil_texture}
                  onChange={(e) => handleInputChange('soil_texture', e.target.value)}
                  disabled={loading}
                  placeholder="e.g., Sandy, Clay, Loam"
                />
              </Box>

              <TextField
                fullWidth
                label="Recommendations"
                value={formData.recommendations}
                onChange={(e) => handleInputChange('recommendations', e.target.value)}
                disabled={loading}
                multiline
                rows={3}
                placeholder="Provide recommendations for soil improvement, crop selection, or fertilization..."
              />
            </Card>
          </Box>
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          onClick={onClose}
          disabled={loading}
          startIcon={<Cancel />}
          variant="outlined"
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={loading || loadingData}
          startIcon={loading ? <CircularProgress size={16} /> : <Save />}
          variant="contained"
          sx={{ 
            backgroundColor: 'primary.main',
            '&:hover': { backgroundColor: 'primary.dark' }
          }}
        >
          {loading ? 'Saving...' : (mode === 'create' ? 'Create Report' : 'Update Report')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SoilTestingReportForm;
