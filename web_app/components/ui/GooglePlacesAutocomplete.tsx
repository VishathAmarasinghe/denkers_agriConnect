'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { GooglePlaceResult } from '@/types/types';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: GooglePlaceResult) => void;
  label: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
}

const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelect,
  label,
  placeholder = 'Search for a location...',
  error = false,
  helperText,
  disabled = false,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<GooglePlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Google Places API
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      if (autocompleteRef.current) {
        placesService.current = new window.google.maps.places.PlacesService(autocompleteRef.current);
      }
    }
  }, []);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = async (newInputValue: string) => {
    setInputValue(newInputValue);
    onChange(newInputValue);

    if (!newInputValue.trim() || !autocompleteService.current) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const request = {
        input: newInputValue,
        componentRestrictions: { country: 'lk' }, // Restrict to Sri Lanka
        types: ['(cities)', 'administrative_area_level_1', 'administrative_area_level_2'],
      };

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const formattedPredictions: GooglePlaceResult[] = predictions.map(prediction => ({
            place_id: prediction.place_id,
            description: prediction.description,
            structured_formatting: {
              main_text: prediction.structured_formatting?.main_text || '',
              secondary_text: prediction.structured_formatting?.secondary_text || '',
            },
            geometry: {
              location: {
                lat: 0, // Will be filled when place is selected
                lng: 0,
              },
            },
          }));
          setOptions(formattedPredictions);
        } else {
          setOptions([]);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error fetching places:', error);
      setOptions([]);
      setLoading(false);
    }
  };

  const handlePlaceSelect = (place: GooglePlaceResult | null) => {
    if (place && placesService.current) {
      // Get detailed place information including coordinates
      placesService.current.getDetails(
        {
          placeId: place.place_id,
          fields: ['geometry', 'formatted_address', 'address_components'],
        },
        (placeDetails, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && placeDetails) {
            const updatedPlace: GooglePlaceResult = {
              ...place,
              geometry: {
                location: {
                  lat: placeDetails.geometry?.location?.lat() || 0,
                  lng: placeDetails.geometry?.location?.lng() || 0,
                },
              },
            };
            onPlaceSelect?.(updatedPlace);
            setInputValue(place.description);
            onChange(place.description);
          }
        }
      );
    }
  };

  return (
    <Box>
      <Autocomplete
        freeSolo
        options={options}
        getOptionLabel={(option) => {
          if (typeof option === 'string') return option;
          return option.description;
        }}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => handleInputChange(newInputValue)}
        onChange={(_, newValue) => handlePlaceSelect(newValue as GooglePlaceResult)}
        loading={loading}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            error={error}
            helperText={helperText}
            required={required}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {option.structured_formatting.main_text}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.structured_formatting.secondary_text}
              </Typography>
            </Box>
          </Box>
        )}
        filterOptions={(x) => x} // Disable built-in filtering
        noOptionsText="No locations found"
        loadingText="Searching locations..."
      />
      <div ref={autocompleteRef} style={{ display: 'none' }} />
    </Box>
  );
};

export default GooglePlacesAutocomplete;
