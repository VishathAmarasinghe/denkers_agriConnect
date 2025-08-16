import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Box,
  Typography,
  Skeleton,
  Avatar,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Visibility,
  Edit,
  CheckCircle,
  Cancel,
  Schedule,
  Science,
  Person,
  LocationOn,
  Phone,
  CalendarToday,
  MoreVert,
  Download,
  Upload,
  Assignment,
} from '@mui/icons-material';
import { SoilTestingRequest } from '@/types/types';

interface SoilTestingRequestsTableProps {
  requests: SoilTestingRequest[];
  onView: (request: SoilTestingRequest) => void;
  onEdit: (request: SoilTestingRequest) => void;
  onApprove: (request: SoilTestingRequest) => void;
  onReject: (request: SoilTestingRequest) => void;
  onSchedule: (request: SoilTestingRequest) => void;
  onUploadReport: (request: SoilTestingRequest) => void;
  loading: boolean;
}

const SoilTestingRequestsTable: React.FC<SoilTestingRequestsTableProps> = ({
  requests,
  onView,
  onEdit,
  onApprove,
  onReject,
  onSchedule,
  onUploadReport,
  loading,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRequest, setSelectedRequest] = useState<SoilTestingRequest | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, request: SoilTestingRequest) => {
    setAnchorEl(event.currentTarget);
    setSelectedRequest(request);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRequest(null);
  };

  const handleAction = (action: string) => {
    if (selectedRequest) {
      switch (action) {
        case 'view':
          onView(selectedRequest);
          break;
        case 'edit':
          onEdit(selectedRequest);
          break;
        case 'approve':
          onApprove(selectedRequest);
          break;
        case 'reject':
          onReject(selectedRequest);
          break;
        case 'schedule':
          onSchedule(selectedRequest);
          break;
        case 'upload':
          onUploadReport(selectedRequest);
          break;
      }
    }
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Schedule sx={{ fontSize: 16 }} />;
      case 'approved':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'rejected':
        return <Cancel sx={{ fontSize: 16 }} />;
      case 'cancelled':
        return <Cancel sx={{ fontSize: 16 }} />;
      default:
        return <Schedule sx={{ fontSize: 16 }} />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Farmer</TableCell>
              <TableCell>Center</TableCell>
              <TableCell>Preferred Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton width={120} height={20} /></TableCell>
                <TableCell><Skeleton width={100} height={20} /></TableCell>
                <TableCell><Skeleton width={80} height={20} /></TableCell>
                <TableCell><Skeleton width={60} height={20} /></TableCell>
                <TableCell><Skeleton width={100} height={20} /></TableCell>
                <TableCell><Skeleton width={80} height={20} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (requests.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Science sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Soil Testing Requests Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          There are currently no soil testing requests to display.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>Farmer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Collection Center</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Preferred Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Contact Info</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      <Person sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {request.farmer_first_name} {request.farmer_last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {request.farmer_id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {request.center_name || 'N/A'}
                    </Typography>
                    {request.center_address && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: 12 }} />
                        {request.center_address}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {formatDate(request.preferred_date)}
                    </Typography>
                    {request.preferred_time_slot && (
                      <Typography variant="caption" color="text.secondary">
                        {request.preferred_time_slot}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Chip
                    icon={getStatusIcon(request.status || 'pending')}
                    label={(request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'Pending')}
                    color={getStatusColor(request.status || 'pending')}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <Phone sx={{ fontSize: 14 }} />
                      {request.farmer_phone}
                    </Typography>
                    {request.farmer_location_address && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: 12 }} />
                        {request.farmer_location_address}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => onView(request)}
                        sx={{ color: 'primary.main' }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="More Actions">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, request)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 200, boxShadow: 'agriculture-lg' }
        }}
      >
        <MenuItem onClick={() => handleAction('view')}>
          <ListItemIcon>
            <Visibility sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleAction('edit')}>
          <ListItemIcon>
            <Edit sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText>Edit Request</ListItemText>
        </MenuItem>
        
        {selectedRequest?.status === 'pending' && (
          <>
            <MenuItem onClick={() => handleAction('approve')}>
              <ListItemIcon>
                <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
              </ListItemIcon>
              <ListItemText>Approve Request</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={() => handleAction('reject')}>
              <ListItemIcon>
                <Cancel sx={{ fontSize: 20, color: 'error.main' }} />
              </ListItemIcon>
              <ListItemText>Reject Request</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={() => handleAction('schedule')}>
              <ListItemIcon>
                <Schedule sx={{ fontSize: 20, color: 'warning.main' }} />
              </ListItemIcon>
              <ListItemText>Schedule Testing</ListItemText>
            </MenuItem>
          </>
        )}
        
        {selectedRequest?.status === 'approved' && (
          <MenuItem onClick={() => handleAction('upload')}>
            <ListItemIcon>
              <Upload sx={{ fontSize: 20, color: 'info.main' }} />
            </ListItemIcon>
            <ListItemText>Upload Report</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default SoilTestingRequestsTable;
