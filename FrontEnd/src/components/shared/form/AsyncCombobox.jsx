import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Label,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { forwardRef, Fragment, useRef, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

// Local Imports
import { InputErrorMsg } from "components/ui";
import { useBoxPosition, useBoxSize, mergeRefs } from "hooks";
import { Highlight } from "../Highlight";

// ----------------------------------------------------------------------

const AsyncCombobox = forwardRef(
  (
    {
      data,
      placeholder,
      label,
      error,
      displayField = "label",
      searchTerm,
      onSearchChange,
      highlight,
      inputProps,
      rootProps,
      className,
      classNames,
      isLoading,
      showNoResults,
      canLoadMore,
      onLoadMore,
      noResultsText = "No results found",
      searchPlaceholder = "Type to search...",
      minSearchLength = 2,
      value, // Valor seleccionado
      onChange, // Función para cambiar valor seleccionado
      ...rest
    },
    ref,
  ) => {
    const boxSizeRef = useRef();
    const inputRef = useRef();
    const { width: inputWidth } = useBoxSize({ ref: boxSizeRef });
    const { left: inputLeft, ref: boxPositionRef } = useBoxPosition();
    
    // Estado local para controlar si el usuario está escribiendo activamente
    const [isTyping, setIsTyping] = useState(false);
    const [internalSearchTerm, setInternalSearchTerm] = useState(searchTerm || '');
    
    // Memoizar la función de cambio de búsqueda para evitar re-renders innecesarios
    const debouncedOnSearchChange = useCallback((newValue) => {
      if (onSearchChange && newValue !== searchTerm) {
        onSearchChange(newValue);
      }
    }, [onSearchChange, searchTerm]);

    // Sincronizar searchTerm externo con estado interno
    useEffect(() => {
      if (searchTerm !== internalSearchTerm && !isTyping) {
        setInternalSearchTerm(searchTerm || '');
      }
    }, [searchTerm, isTyping, internalSearchTerm]);

    const handleInputChange = (event) => {
      const inputValue = event.target.value;
      
      // Marcar que el usuario está escribiendo
      setIsTyping(true);
      setInternalSearchTerm(inputValue);
      
      // Llamar al callback de cambio de búsqueda
      debouncedOnSearchChange(inputValue);
    };

    const handleSelectionChange = (selectedValue) => {
      // Cuando se selecciona algo, dejar de escribir
      setIsTyping(false);
      
      if (onChange) {
        onChange(selectedValue);
      }
      
      // Si se selecciona un valor, actualizar el término de búsqueda
      if (selectedValue && selectedValue[displayField]) {
        setInternalSearchTerm(selectedValue[displayField]);
        debouncedOnSearchChange(selectedValue[displayField]);
      }
    };

    const handleInputFocus = () => {
      // Al hacer focus, permitir escritura
      setIsTyping(true);
    };

    const handleInputBlur = () => {
      // Al perder focus, dejar de escribir (con un pequeño delay para permitir selecciones)
      setTimeout(() => {
        setIsTyping(false);
      }, 150);
    };

    // Manejo específico de teclas - SOLUCIÓN para espacios
    const handleKeyDown = (event) => {
      // Si es espacio, manejar manualmente el cambio
      if (event.key === ' ') {
        // Obtener el valor actual y agregar el espacio
        const currentValue = event.target.value || '';
        const newValue = currentValue + ' ';
        
        // Actualizar el searchTerm manualmente
        setIsTyping(true);
        setInternalSearchTerm(newValue);
        debouncedOnSearchChange(newValue);
        
        // Forzar la actualización del input DOM
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.value = newValue;
          }
        }, 0);
        
        // Prevenir el comportamiento por defecto para evitar conflictos
        event.preventDefault();
      }
    };

    const shouldShowOptions = internalSearchTerm.length >= minSearchLength || data.length > 0;

    // Calcular el valor a mostrar en el input - MEJORADO
    const getDisplayValue = useCallback(() => {
      if (isTyping) {
        return internalSearchTerm;
      }
      
      if (value && value[displayField]) {
        return value[displayField];
      }
      
      return internalSearchTerm;
    }, [isTyping, internalSearchTerm, value, displayField]);

    return (
      <div className={clsx("flex flex-col", classNames?.root)} {...rootProps}>
        <Combobox
          as="div"
          className={clsx(classNames?.root, className)}
          value={value}
          onChange={handleSelectionChange}
          ref={ref}
          {...rest}
        >
          {({ open, value: selectedValue }) => {
            return (
              <>
                {label && <Label>{label}</Label>}
                <div
                  ref={mergeRefs(boxPositionRef, boxSizeRef)}
                  className={clsx("relative", label && "mt-1.5")}
                >
                  <ComboboxButton className="relative w-full cursor-pointer overflow-hidden text-start">
                    <div className="relative">
                      {/* Prefix Icon */}
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      
                      {/* Input con manejo especial para espacios */}
                      <ComboboxInput
                        ref={inputRef}
                        autoComplete="new"
                        displayValue={getDisplayValue}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        onKeyDown={handleKeyDown}
                        placeholder={selectedValue ? placeholder : searchPlaceholder}
                        className={clsx(
                          "w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm",
                          "focus:ring-2 focus:ring-primary-600 focus:border-primary-600",
                          "dark:bg-dark-700 dark:border-dark-400 dark:text-dark-100",
                          error && "border-red-300 focus:border-red-500 focus:ring-red-500"
                        )}
                        {...inputProps}
                      />
                      
                      {/* Suffix Icon */}
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <ChevronDownIcon
                          className={clsx(
                            "size-5 transition-transform text-gray-400",
                            open && "rotate-180",
                          )}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </ComboboxButton>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out"
                    enterFrom="opacity-0 translate-y-2"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-2"
                  >
                    <ComboboxOptions
                      anchor={{ to: "bottom end", gap: 8 }}
                      style={{
                        width: inputWidth,
                        "--left-anchor": `${inputLeft}px`,
                      }}
                      className={clsx(
                        "absolute left-(--left-anchor)! z-10 max-h-60 overflow-y-auto overflow-x-hidden rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-750 dark:shadow-none",
                      )}
                    >
                      {/* Mensaje cuando no hay suficientes caracteres */}
                      {internalSearchTerm.length > 0 && internalSearchTerm.length < minSearchLength && (
                        <div className="relative cursor-default select-none px-4 py-2 text-gray-500 dark:text-dark-300 text-sm">
                          Type at least {minSearchLength} characters to search
                        </div>
                      )}

                      {/* Mostrar resultados cuando hay suficientes caracteres */}
                      {shouldShowOptions && (
                        <>
                          {/* Loading state */}
                          {isLoading && (
                            <div className="relative cursor-default select-none px-4 py-2 text-gray-500 dark:text-dark-300 flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                              <span>Searching...</span>
                            </div>
                          )}

                          {/* No results */}
                          {!isLoading && showNoResults && (
                            <div className="relative cursor-default select-none px-4 py-2 text-gray-500 dark:text-dark-300">
                              {noResultsText}
                            </div>
                          )}

                          {/* Results */}
                          {!isLoading && data.length > 0 && data.map((item, index) => (
                            <ComboboxOption
                              key={item.id || index}
                              className={({ selected, active }) =>
                                clsx(
                                  "relative cursor-pointer select-none px-4 py-2 outline-hidden transition-colors",
                                  active &&
                                    !selected &&
                                    "bg-gray-100 dark:bg-dark-600",
                                  selected
                                    ? "bg-primary-600 text-white dark:bg-primary-500"
                                    : "text-gray-800 dark:text-dark-100",
                                )
                              }
                              value={item}
                            >
                              {({ selected }) => (
                                <div className="block">
                                  <span
                                    className={`block truncate ${
                                      selected ? "font-medium" : "font-normal"
                                    }`}
                                  >
                                    {highlight && internalSearchTerm ? (
                                      <Highlight query={internalSearchTerm}>
                                        {String(item?.[displayField] || '')}
                                      </Highlight>
                                    ) : (
                                      String(item?.[displayField] || '')
                                    )}
                                  </span>
                                  {/* Información adicional del customer */}
                                  {item.phone && (
                                    <span className={clsx(
                                      "text-sm block truncate",
                                      selected ? "text-blue-100" : "text-gray-500 dark:text-dark-400"
                                    )}>
                                      📞 {String(item.phone)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </ComboboxOption>
                          ))}

                          {/* Load more button */}
                          {!isLoading && canLoadMore && (
                            <div className="px-4 py-2 border-t border-gray-200 dark:border-dark-600">
                              <button
                                type="button"
                                onClick={onLoadMore}
                                className="w-full text-center text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                              >
                                Load more results...
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </ComboboxOptions>
                  </Transition>
                </div>
                <InputErrorMsg when={error && typeof error !== "boolean"}>
                  {error}
                </InputErrorMsg>
              </>
            );
          }}
        </Combobox>
      </div>
    );
  },
);

AsyncCombobox.displayName = "AsyncCombobox";

AsyncCombobox.propTypes = {
  data: PropTypes.array,
  placeholder: PropTypes.node,
  label: PropTypes.node,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
  displayField: PropTypes.string,
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  highlight: PropTypes.bool,
  inputProps: PropTypes.object,
  rootProps: PropTypes.object,
  classNames: PropTypes.object,
  className: PropTypes.string,
  isLoading: PropTypes.bool,
  showNoResults: PropTypes.bool,
  canLoadMore: PropTypes.bool,
  onLoadMore: PropTypes.func,
  noResultsText: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  minSearchLength: PropTypes.number,
  value: PropTypes.object,
  onChange: PropTypes.func,
};

export { AsyncCombobox };