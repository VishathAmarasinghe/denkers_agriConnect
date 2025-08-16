'use client';
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
  Chip,
  Box,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  LocationOn,
  Phone,
  Person,
  Schedule,
  Science,
} from '@mui/icons-material';
import { SoilCollectionCenter } from '@/types/types';
import { useAppDispatch } from '@/slices/store';
import { deleteSoilCollectionCenter } from '@/slices/soilCollectionSlice/soilCollection';

interface SoilCollectionCentersTableProps {
  centers: SoilCollectionCenter[];
  onEdit: (center: SoilCollectionCenter) => void;
  onView: (center: SoilCollectionCenter) => void;
  loading: boolean;
}

const SoilCollectionCentersTable: React.FC<SoilCollectionCentersTableProps> = ({
  centers,
  onEdit,
  onView,
  loading,
}) => {
  const dispatch = useAppDispatch();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [centerToDelete, setCenterToDelete] = useState<SoilCollectionCenter | null>(null);

  const handleDeleteClick = (center: SoilCollectionCenter) => {
    setCenterToDelete(center);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (centerToDelete?.id) {
      await dispatch(deleteSoilCollectionCenter(centerToDelete.id));
      setDeleteDialogOpen(false);
      setCenterToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCenterToDelete(null);
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading centers...</Typography>
      </Box>
    );
  }

  if (centers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Science sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Soil Collection Centers Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start by adding your first soil collection center.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ boxShadow: 'agriculture' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>Center Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Services</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {centers.map((center) => (
              <TableRow key={center.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {center.name}
                    </Typography>
                    {center.description && (
                      <Typography variant="caption" color="text.secondary">
                        {center.description}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2">
                        {center.address}
                      </Typography>
                      {center.latitude && center.longitude && (
                        <Typography variant="caption" color="text.secondary">
                          {center.latitude.toFixed(4)}, {center.longitude.toFixed(4)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {center.contact_number}
                      </Typography>
                    </Box>
                    {center.contact_person && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {center.contact_person}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Box>
                    {center.services_offered && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {center.services_offered}
                      </Typography>
                    )}
                    {center.operating_hours && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {center.operating_hours}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={center.is_active ? 'Active' : 'Inactive'}
                    color={center.is_active ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(center.created_at || '')}
                  </Typography>
                </TableCell>
                
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => onView(center)}
                        sx={{ color: 'primary.main' }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Edit Center">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(center)}
                        sx={{ color: 'warning.main' }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete Center">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(center)}
                        sx={{ color: 'error.main' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Soil Collection Center</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. The center will be deactivated.
          </Alert>
          <Typography>
            Are you sure you want to delete <strong>{centerToDelete?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SoilCollectionCentersTable;
