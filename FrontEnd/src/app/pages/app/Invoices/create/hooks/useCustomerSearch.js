import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchCustomersThunk } from 'slices/thunk';
import { clearCustomersSearch } from 'slices/appointment/reducer';

const useCustomerSearch = (initialLimit = 20) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Referencias para evitar bucles infinitos
  const lastSearchTermRef = useRef('');
  const isInternalUpdateRef = useRef(false);
  
  const {
    customersSearch,
    customers: staticCustomers,
    loadingCustomers
  } = useSelector((state) => state.appointments);

  // Debounce del término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms de delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Realizar búsqueda cuando cambie el término debouncado
  useEffect(() => {
    const trimmedTerm = debouncedSearchTerm.trim();
    
    // Evitar búsquedas duplicadas
    if (trimmedTerm === lastSearchTermRef.current) {
      return;
    }
    
    lastSearchTermRef.current = trimmedTerm;
    
    if (trimmedTerm.length >= 2) {
      dispatch(searchCustomersThunk({
        searchTerm: trimmedTerm,
        page: 1,
        limit: initialLimit
      }));
    } else if (trimmedTerm.length === 0 && customersSearch.hasSearched) {
      dispatch(clearCustomersSearch());
    }
  }, [debouncedSearchTerm, dispatch, initialLimit]);

  // Función para cargar más resultados (paginación)
  const loadMore = useCallback(() => {
    if (customersSearch.pagination?.has_next_page && !customersSearch.isSearching) {
      dispatch(searchCustomersThunk({
        searchTerm: debouncedSearchTerm.trim(),
        page: customersSearch.pagination.current_page + 1,
        limit: initialLimit
      }));
    }
  }, [customersSearch.pagination, customersSearch.isSearching, debouncedSearchTerm, dispatch, initialLimit]);

  // Función mejorada para actualizar searchTerm - NUEVA
  const updateSearchTerm = useCallback((newTerm) => {
    // Marcar que es una actualización interna para evitar bucles
    isInternalUpdateRef.current = true;
    setSearchTerm(newTerm);
    
    // Reset del flag después de un pequeño delay
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 0);
  }, []);

  // Determinar qué datos mostrar
  const getCustomersToShow = () => {
    const trimmedSearchTerm = searchTerm.trim();
    
    if (trimmedSearchTerm.length >= 2) {
      return customersSearch.data || [];
    } else if (trimmedSearchTerm.length === 0) {
      // Usar optional chaining y fallback a array vacío
      return staticCustomers?.slice(0, 20) || [];
    }
    return [];
  };

  const isLoading = customersSearch.isSearching || loadingCustomers;
  const showNoResults = searchTerm.trim().length >= 2 && 
                       customersSearch.hasSearched && 
                       customersSearch.data.length === 0 && 
                       !isLoading;

  return {
    searchTerm,
    setSearchTerm: updateSearchTerm, // Usar la función mejorada
    customers: getCustomersToShow(),
    isLoading,
    showNoResults,
    canLoadMore: customersSearch.pagination?.has_next_page || false,
    loadMore,
    pagination: customersSearch.pagination,
    clearSearch: () => {
      updateSearchTerm('');
      dispatch(clearCustomersSearch());
      lastSearchTermRef.current = '';
    }
  };
};

export default useCustomerSearch;