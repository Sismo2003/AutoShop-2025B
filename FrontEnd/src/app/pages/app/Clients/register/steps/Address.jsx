// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Controller,
  useForm
} from "react-hook-form";
import PropTypes from "prop-types";

// Local Imports
import TextareaAutosize from "react-textarea-autosize";

import { Button, Input } from "components/ui";
import { useAddClientsFormContext } from "../AddClientFormContext.js";
import { addressSchema } from "../schema";

import { ALL_STATES } from "./values/states.js";
import { Listbox } from "components/shared/form/Listbox";
import { useEffect, useState, useRef } from "react";

// ----------------------------------------------------------------------

// Property type options
const PROPERTY_TYPES = [
  { id: 'house', label: 'House' },
  { id: 'apartment', label: 'Apartment' },
  { id: 'condo', label: 'Condo' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'office', label: 'Office' },
  { id: 'warehouse', label: 'Warehouse' },
  { id: 'other', label: 'Other' }
];

export function Address({ setCurrentStep }) {
  const addClientsFormCtx = useAddClientsFormContext();
  
  const [states, setStates] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  
  // Coordenadas para 1947 N Lindsay Mesa Arizona
  const defaultLocation = [33.4511271,-111.7704331];
  
  useEffect(() => {
    if (ALL_STATES) {
      const transformedStates = Object.entries(ALL_STATES).map(([label, id]) => ({
        id,
        label
      }));
      setStates(transformedStates);
    }
  }, []);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
    // getValues
  } = useForm({
    resolver: yupResolver(addressSchema),
    defaultValues: addClientsFormCtx.state.formData.description,
  });
  
  // Watch property type and is_commercial to show/hide relevant fields
  const propertyType = watch('property_type');
  const isCommercial = watch('is_commercial');
  
  // Load Leaflet CSS and JS
  useEffect(() => {
    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    
    // Load Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        if (showMap) {
          initializeMap();
        }
      };
      document.head.appendChild(script);
    } else if (showMap) {
      initializeMap();
    }
  }, [showMap]);
  
  const initializeMap = () => {
    if (!window.L || !mapRef.current) return;
    
    // Crear el mapa centrado en 1947 N Lindsay Mesa Arizona
    const map = window.L.map(mapRef.current).setView(defaultLocation, 15);
    leafletMapRef.current = map;
    
    // Add tile layer (OpenStreetMap)
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Create marker
    const marker = window.L.marker(defaultLocation, { draggable: true }).addTo(map);
    markerRef.current = marker;
    
    // Handle marker drag
    marker.on('dragend', (e) => {
      const { lat, lng } = e.target.getLatLng();
      reverseGeocode(lat, lng);
    });
    
    // Handle map click
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      reverseGeocode(lat, lng);
    });
    
    // Set initial address to 1947 N Lindsay Mesa Arizona
    setTimeout(() => {
      reverseGeocode(defaultLocation[0], defaultLocation[1]);
    }, 500);
  };
  
  // Search for addresses using Nominatim (OpenStreetMap)
  const searchAddress = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      // Añadir Mesa Arizona al query para mejores resultados
      const searchQuery = query.includes('Mesa') ? query : `${query} Mesa Arizona`;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=us&limit=5&addressdetails=1&bounded=1&viewbox=-111.9,-111.7,33.3,33.5`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching address:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }
      
      const data = await response.json();
      
      if (data.address) {
        fillFormFromNominatim(data.address);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };
  
  // Fill form from Nominatim address data
  const fillFormFromNominatim = (address) => {
    const streetNumber = address.house_number || '';
    const streetName = address.road || '';
    const city = address.city || address.town || address.village || '';
    const state = address.state || '';
    const zipcode = address.postcode || '';
    
    const streetAddress = `${streetNumber} ${streetName}`.trim();
    setValue('street_address', streetAddress);
    setValue('city', city);
    setValue('zipcode', zipcode);
    
    // Map state name to abbreviation
    const stateAbbr = getStateAbbreviation(state);
    if (stateAbbr) {
      setValue('state', stateAbbr);
    }
  };
  
  // Get state abbreviation from full name
  const getStateAbbreviation = (stateName) => {
    const stateMap = {
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
      'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
      'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
      'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
      'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
      'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
      'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
      'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
      'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
      'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
      'Wisconsin': 'WI', 'Wyoming': 'WY'
    };
    return stateMap[stateName] || stateName;
  };
  
  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(value);
    }, 500);
  };
  
  // Handle search result selection
  const handleSearchResultSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    if (leafletMapRef.current && markerRef.current) {
      leafletMapRef.current.setView([lat, lng], 16);
      markerRef.current.setLatLng([lat, lng]);
    }
    
    if (result.address) {
      fillFormFromNominatim(result.address);
    }
    
    setSearchResults([]);
    setSearchTerm(result.display_name);
  };
  
  // Handle current location
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          if (leafletMapRef.current && markerRef.current) {
            leafletMapRef.current.setView([lat, lng], 16);
            markerRef.current.setLatLng([lat, lng]);
          }
          
          reverseGeocode(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your current location. Please try again or enter address manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };
  
  // Reset to default location
  const handleResetToDefault = () => {
    if (leafletMapRef.current && markerRef.current) {
      leafletMapRef.current.setView(defaultLocation, 15);
      markerRef.current.setLatLng(defaultLocation);
      reverseGeocode(defaultLocation[0], defaultLocation[1]);
    }
  };
  
  // Clear search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setSearchResults([]);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  
  const onSubmit = (data) => {
    addClientsFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { address: { ...data } },
    });
    addClientsFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { address: { isDone: true } },
    });
    setCurrentStep(2);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="space-y-6">
        
        {/* PROPERTY TYPE */}
        <div className="space-y-4">
          <h6 className="text-base font-medium text-gray-800 dark:text-dark-100">
            <span>Property Information</span>
          </h6>
          <div className="grid gap-4 lg:grid-cols-2">
            <Controller
              render={({ field: { value, onChange, ...rest } }) => (
                <Listbox
                  data={PROPERTY_TYPES}
                  value={PROPERTY_TYPES.find((type) => type.id === value) || null}
                  onChange={(val) => onChange(val.id)}
                  label="Property Type*"
                  placeholder="Select Property Type"
                  displayField="label"
                  error={errors?.property_type?.message}
                  {...rest}
                />
              )}
              control={control}
              name="property_type"
            />
            
            <div className="flex items-center space-x-2">
              <input
                {...register("is_commercial")}
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-dark-100">
                Commercial Property
              </label>
            </div>
          </div>
          
          {/* Business Name - Show only if commercial */}
          {isCommercial && (
            <Input
              {...register("business_name")}
              label="Business Name"
              error={errors?.business_name?.message}
              placeholder="Ex: ABC Restaurant"
            />
          )}
        </div>
        
        {/* ADDRESS WITH MAP */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h6 className="text-base font-medium text-gray-800 dark:text-dark-100">
              <span>Address Information</span>
            </h6>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowMap(!showMap)}
              className="text-sm"
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
          </div>
          
          {/* MAP SECTION */}
          {showMap && (
            <div className="space-y-4 p-4 border border-gray-200 dark:border-dark-500 rounded-lg bg-gray-50 dark:bg-dark-800">
              <div className="flex flex-col sm:flex-row gap-3 relative">
                <div className="flex-1 relative search-container">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search for an address in Mesa, Arizona..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-700 dark:text-dark-100 relative z-10"
                  />
                  
                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-500 rounded-md shadow-xl max-h-60 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          onClick={() => handleSearchResultSelect(result)}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-600 text-sm border-b border-gray-100 dark:border-dark-600 last:border-b-0"
                        >
                          <div className="font-medium">{result.display_name}</div>
                          {result.address && (
                            <div className="text-xs text-gray-500 dark:text-dark-400">
                              {result.address.house_number} {result.address.road}, {result.address.city}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {isSearching && (
                    <div className="absolute right-3 top-2 z-20">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseCurrentLocation}
                    className="whitespace-nowrap"
                  >
                    Use Current Location
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetToDefault}
                    className="whitespace-nowrap"
                  >
                    Reset to Default
                  </Button>
                </div>
              </div>
              
              <div
                ref={mapRef}
                className="w-full h-64 rounded-lg border border-gray-300 dark:border-dark-500 relative z-0"
              />
              
              <p className="text-xs text-gray-500 dark:text-dark-300">
                Click on the map or drag the marker to select the exact location. You can also search for an address above.
                Default location: 1947 N Lindsay, Mesa, Arizona
              </p>
            </div>
          )}
          
          <div className="grid gap-4 lg:grid-cols-2">
            <Input
              {...register("street_address")}
              component={TextareaAutosize}
              label="Street Address*"
              error={errors?.street_address?.message}
              placeholder="Ex: 1947 N Lindsay"
              minRows={2}
            />
            <Input
              {...register("city")}
              label="City*"
              error={errors?.city?.message}
              placeholder="Ex: Mesa"
            />

          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Controller
              render={({ field: { value, onChange, ...rest } }) => (
                <Listbox
                  data={states}
                  value={states.find((state) => state.id === value) || null}
                  onChange={(val) => onChange(val.id)}
                  label="State*"
                  placeholder="Select State"
                  displayField="label"
                  error={errors?.state?.message}
                  {...rest}
                />
              )}
              control={control}
              name="state"
            />
            <Input
              {...register("zipcode")}
              label="ZipCode*"
              error={errors?.zipcode?.message}
              placeholder="Ex: 85213"
              maxLength="10"
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">

            <Input
              {...register("main_cross_streets")}
              label="Main Cross Streets"
              error={errors?.main_cross_streets?.message}
              placeholder="Ex: Between 1st Ave and 2nd Ave"
            />
          </div>
        </div>
        
        {/* APARTMENT/UNIT DETAILS - Show only for apartment, condo, office, warehouse */}
        {(['apartment', 'condo', 'office', 'warehouse'].includes(propertyType)) && (
          <div className="space-y-4">
            <h6 className="text-sm font-medium text-gray-900 dark:text-dark-50 border-b border-gray-200 dark:border-dark-500 pb-2">
              {propertyType === 'apartment' || propertyType === 'condo' ? 'Apartment/Condo Details' : 'Unit Details'}
            </h6>
            <div className="grid gap-4 lg:grid-cols-2">
              <Input
                {...register("apartment_name")}
                label="Apartment/Building Name"
                error={errors?.apartment_name?.message}
                placeholder="Ex: Sunset Apartments"
              />
              <Input
                {...register("unit_number")}
                label="Unit/Apartment Number"
                error={errors?.unit_number?.message}
                placeholder="Ex: 32A"
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Input
                {...register("building")}
                label="Building"
                error={errors?.building?.message}
                placeholder="Ex: Building A"
              />
              <Input
                {...register("gate_code")}
                label="Gate Code"
                error={errors?.gate_code?.message}
                placeholder="Ex: #0234"
              />
            </div>
          </div>
        )}
        
        {/* SPECIAL INSTRUCTIONS */}
        <div className="space-y-4">
          <Input
            {...register("special_instructions")}
            component={TextareaAutosize}
            label={
              <>
                Special Instructions{" "}
                <span className="text-xs text-gray-400 dark:text-dark-300">
                  (optional)
                </span>
              </>
            }
            error={errors?.special_instructions?.message}
            placeholder="Ex: Blue house next to San Pablo pharmacy, use side entrance"
            minRows={3}
          />
        </div>
      </div>
      
      <div className="mt-4 flex justify-end space-x-3">
        <Button className="min-w-[7rem]" onClick={() => setCurrentStep(0)}>
          Prev
        </Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Next
        </Button>
      </div>
    </form>
  );
}

Address.propTypes = {
  setCurrentStep: PropTypes.func,
};
