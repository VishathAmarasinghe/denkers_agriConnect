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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
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
  Delete,
  Visibility,
  Upload,
  Assignment,
  Person,
  CalendarToday,
  FileDownload,
  Public,
  Lock,
  MoreVert,
  Close,
  Save,
  CheckCircle,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/slices/store';
import {
  fetchSoilTestingReports,
  searchSoilTestingReports,
  createSoilTestingReport,
  updateSoilTestingReport,
  deleteSoilTestingReport,
  getPublicSoilTestingReports,
  clearMessages,
} from '@/slices/soilTestingSlice/soilTesting';
import { SoilTestingReport, SoilTestingReportCreateData, SoilTestingReportUpdateData, SoilTestingReportSearchParams } from '@/types/types';
import AdminLayout from '@/components/layout/AdminLayout';
import SoilTestingReportForm from '@/components/soil-management/SoilTestingReportForm';

const SoilTestingReportsPage = () => {
  const dispatch = useAppDispatch();
  const { reports, reportsPagination, loading, error, success } = useAppSelector((state) => state.soilTestingReducer);
  
  const [searchParams, setSearchParams] = useState<SoilTestingReportSearchParams>({
    search: '',
    is_public: undefined,
    testing_date_from: '',
    testing_date_to: '',
    page: 1,
    limit: 10,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedReport, setSelectedReport] = useState<SoilTestingReport | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<SoilTestingReport | null>(null);

  useEffect(() => {
    if (activeTab === 0) {
      dispatch(fetchSoilTestingReports({ page: currentPage, limit: 10 }));
    } else if (activeTab === 1) {
      dispatch(getPublicSoilTestingReports({ page: currentPage, limit: 10 }));
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
    dispatch(searchSoilTestingReports(searchParams));
  };

  const handleClearSearch = () => {
    setSearchParams({
      search: '',
      is_public: undefined,
      testing_date_from: '',
      testing_date_to: '',
      page: 1,
      limit: 10,
    });
    if (activeTab === 0) {
      dispatch(fetchSoilTestingReports({ page: 1, limit: 10 }));
    } else {
      dispatch(getPublicSoilTestingReports({ page: 1, limit: 10 }));
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    if (activeTab === 0) {
      dispatch(fetchSoilTestingReports({ page, limit: 10 }));
    } else {
      dispatch(getPublicSoilTestingReports({ page, limit: 10 }));
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setCurrentPage(1);
    if (newValue === 0) {
      dispatch(fetchSoilTestingReports({ page: 1, limit: 10 }));
    } else {
      dispatch(getPublicSoilTestingReports({ page: 1, limit: 10 }));
    }
  };

  const handleCreateReport = () => {
    setFormMode('create');
    setSelectedReport(null);
    setFormOpen(true);
  };

  const handleEditReport = (report: SoilTestingReport) => {
    setFormMode('edit');
    setSelectedReport(report);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: SoilTestingReportCreateData | SoilTestingReportUpdateData | FormData) => {
    try {
      if (formMode === 'create') {
        if (data instanceof FormData) {
          // Handle FormData for file uploads
          await dispatch(createSoilTestingReport(data as any));
        } else {
          await dispatch(createSoilTestingReport(data as SoilTestingReportCreateData));
        }
      } else {
        await dispatch(updateSoilTestingReport({
          id: selectedReport!.id,
          data: data as SoilTestingReportUpdateData,
        }));
      }
      setFormOpen(false);
      // Refresh the list
      if (activeTab === 0) {
        dispatch(fetchSoilTestingReports({ page: currentPage, limit: 10 }));
      } else {
        dispatch(getPublicSoilTestingReports({ page: currentPage, limit: 10 }));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedReport(null);
  };

  const handleViewReport = (report: SoilTestingReport) => {
    setSelectedReport(report);
    setViewDialogOpen(true);
  };

  const handleDeleteReport = (report: SoilTestingReport) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (reportToDelete) {
      try {
        await dispatch(deleteSoilTestingReport(reportToDelete.id));
        setDeleteDialogOpen(false);
        setReportToDelete(null);
        // Refresh the list
        if (activeTab === 0) {
          dispatch(fetchSoilTestingReports({ page: currentPage, limit: 10 }));
        } else {
          dispatch(getPublicSoilTestingReports({ page: currentPage, limit: 10 }));
        }
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedReport(null);
  };

  const stats = [
    {
      title: 'Total Reports',
      value: Array.isArray(reports) ? reports.length : 0,
      icon: <Assignment sx={{ fontSize: 24, color: '#52B788' }} />,
      color: '#52B788',
    },
    {
      title: 'Public Reports',
      value: Array.isArray(reports) ? reports.filter(rep => rep.is_public).length : 0,
      icon: <Public sx={{ fontSize: 24, color: '#16a34a' }} />,
      color: '#16a34a',
    },
    {
      title: 'Private Reports',
      value: Array.isArray(reports) ? reports.filter(rep => !rep.is_public).length : 0,
      icon: <Lock sx={{ fontSize: 24, color: '#dc2626' }} />,
      color: '#dc2626',
    },
    {
      title: 'This Month',
      value: Array.isArray(reports) ? reports.filter(rep => {
        const reportDate = new Date(rep.report_date);
        const now = new Date();
        return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
      }).length : 0,
      icon: <CalendarToday sx={{ fontSize: 24, color: '#f59e0b' }} />,
      color: '#f59e0b',
    },
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && reports.length === 0) {
    return (
      <AdminLayout>
        <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
              Soil Testing Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage soil testing reports and analysis results.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
            {stats.map((stat, index) => (
              <Card key={index} sx={{ boxShadow: 'agriculture', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4" fontWeight={700} sx={{ color: stat.color }}>
                      <Skeleton width={60} />
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
          
          <Paper sx={{ boxShadow: 'agriculture' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Report Title</TableCell>
                    <TableCell>Farmer</TableCell>
                    <TableCell>Center</TableCell>
                    <TableCell>Testing Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton width={120} height={20} /></TableCell>
                      <TableCell><Skeleton width={100} height={20} /></TableCell>
                      <TableCell><Skeleton width={100} height={20} /></TableCell>
                      <TableCell><Skeleton width={80} height={20} /></TableCell>
                      <TableCell><Skeleton width={60} height={20} /></TableCell>
                      <TableCell><Skeleton width={80} height={20} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
            Soil Testing Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage soil testing reports and analysis results. Access comprehensive soil analysis data and recommendations.
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
            <Tab label="All Reports" />
            <Tab label="Public Reports" />
          </Tabs>
        </Paper>

        {/* Search and Actions Bar */}
        <Paper sx={{ p: 3, mb: 3, boxShadow: 'agriculture' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' }, gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Search Reports"
              value={searchParams.search || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search by title, summary, summary, or recommendations..."
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
              <InputLabel>Visibility</InputLabel>
              <Select
                value={searchParams.is_public === undefined ? '' : searchParams.is_public.toString()}
                onChange={(e) => setSearchParams(prev => ({ 
                  ...prev, 
                  is_public: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
                label="Visibility"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Public</MenuItem>
                <MenuItem value="false">Private</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="From Date"
              type="date"
              value={searchParams.testing_date_from || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, testing_date_from: e.target.value }))}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              fullWidth
              label="To Date"
              type="date"
              value={searchParams.testing_date_to || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, testing_date_to: e.target.value }))}
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
              onClick={handleCreateReport}
              sx={{ 
                backgroundColor: 'primary.main',
                '&:hover': { backgroundColor: 'primary.dark' }
              }}
            >
              Create Report
            </Button>
          </Box>
        </Paper>

        {/* Reports Table */}
        <Paper sx={{ boxShadow: 'agriculture' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Report Title</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Farmer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Collection Center</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Testing Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Visibility</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(reports) && reports.length > 0 ? (
                  reports.map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {report.report_title}
                        </Typography>
                        {report.report_summary && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {report.report_summary.length > 100 
                              ? `${report.report_summary.substring(0, 100)}...` 
                              : report.report_summary
                            }
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          <Person sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {report.farmer_name || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {report.center_name || 'N/A'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {formatDate(report.testing_date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(report.report_date)}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        icon={report.is_public ? <Public sx={{ fontSize: 16 }} /> : <Lock sx={{ fontSize: 16 }} />}
                        label={report.is_public ? 'Public' : 'Private'}
                        color={report.is_public ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Report">
                          <IconButton
                            size="small"
                            onClick={() => handleViewReport(report)}
                            sx={{ color: 'primary.main' }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Download Report">
                          <IconButton
                            size="small"
                            onClick={() => window.open(report.report_file_path, '_blank')}
                            sx={{ color: 'success.main' }}
                          >
                            <FileDownload />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="More Actions">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setSelectedReport(report);
                              // Show menu
                            }}
                            sx={{ color: 'text.secondary' }}
                          >
                            <MoreVert />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        {loading ? (
                          <CircularProgress size={40} />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No reports found
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Pagination */}
        {reportsPagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={reportsPagination.totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}

        {/* View Dialog */}
        {selectedReport && (
          <Dialog
            open={viewDialogOpen}
            onClose={handleCloseViewDialog}
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
              gap: 1
            }}>
              <Assignment sx={{ color: 'primary.main' }} />
              Soil Testing Report: {selectedReport.report_title}
            </DialogTitle>
            
            <DialogContent sx={{ pt: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Report Information</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Title:</strong> {selectedReport.report_title}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>File:</strong> {selectedReport.report_file_name} ({formatFileSize(selectedReport.report_file_size)})
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Type:</strong> {selectedReport.report_file_type}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Visibility:</strong> 
                    <Chip
                      label={selectedReport.is_public ? 'Public' : 'Private'}
                      color={selectedReport.is_public ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Testing Information</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Testing Date:</strong> {formatDate(selectedReport.testing_date)}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Report Date:</strong> {formatDate(selectedReport.report_date)}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Field Officer:</strong> {selectedReport.field_officer_name || 'N/A'}
                  </Typography>
                </Box>
                
                {selectedReport.report_summary && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="subtitle2" color="text.secondary">Summary</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedReport.report_summary}</Typography>
                  </Box>
                )}
                
                {/* Soil Analysis Results */}
                {(selectedReport.soil_ph || selectedReport.soil_nitrogen || selectedReport.soil_phosphorus || 
                  selectedReport.soil_potassium || selectedReport.soil_organic_matter || selectedReport.soil_texture) && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Soil Analysis Results</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(6, 1fr)' }, gap: 2 }}>
                      {selectedReport.soil_ph && (
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="primary.main">{selectedReport.soil_ph}</Typography>
                          <Typography variant="caption" color="text.secondary">pH Level</Typography>
                        </Card>
                      )}
                      
                      {selectedReport.soil_nitrogen && (
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="success.main">{selectedReport.soil_nitrogen}</Typography>
                          <Typography variant="caption" color="text.secondary">Nitrogen (N)</Typography>
                        </Card>
                      )}
                      
                      {selectedReport.soil_phosphorus && (
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="warning.main">{selectedReport.soil_phosphorus}</Typography>
                          <Typography variant="caption" color="text.secondary">Phosphorus (P)</Typography>
                        </Card>
                      )}
                      
                      {selectedReport.soil_potassium && (
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="info.main">{selectedReport.soil_potassium}</Typography>
                          <Typography variant="caption" color="text.secondary">Potassium (K)</Typography>
                        </Card>
                      )}
                      
                      {selectedReport.soil_organic_matter && (
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="secondary.main">{selectedReport.soil_organic_matter}%</Typography>
                          <Typography variant="caption" color="text.secondary">Organic Matter</Typography>
                        </Card>
                      )}
                      
                      {selectedReport.soil_texture && (
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="text.primary">{selectedReport.soil_texture}</Typography>
                          <Typography variant="caption" color="text.secondary">Texture</Typography>
                        </Card>
                      )}
                    </Box>
                  </Box>
                )}
                
                {selectedReport.recommendations && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="subtitle2" color="text.secondary">Recommendations</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedReport.recommendations}</Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button onClick={handleCloseViewDialog}>Close</Button>
              <Button
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={() => window.open(selectedReport.report_file_path, '_blank')}
              >
                Download Report
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleEditReport(selectedReport);
                }}
                startIcon={<Edit />}
              >
                Edit Report
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Delete Soil Testing Report</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete the report "{reportToDelete?.report_title}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error">
              Delete Report
            </Button>
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

        {/* Soil Testing Report Form */}
        <SoilTestingReportForm
          open={formOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          report={selectedReport}
          loading={loading}
          mode={formMode}
        />
      </Box>
    </AdminLayout>
  );
};

export default SoilTestingReportsPage;
