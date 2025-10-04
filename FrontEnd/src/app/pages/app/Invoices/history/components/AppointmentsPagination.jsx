import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from "@heroicons/react/24/outline";
import { Button } from "components/ui";

const AppointmentsPagination = ({ pagination, onPageChange }) => {
  const {
    current_page,
    total_pages,
    total_items,
    per_page,
    has_next_page,
    has_prev_page,
    from,
    to
  } = pagination;

  // No mostrar paginación si solo hay una página
  if (total_pages <= 1) return null;

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (total_pages <= maxVisible) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= total_pages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para páginas con puntos suspensivos
      let start = Math.max(1, current_page - 2);
      let end = Math.min(total_pages, current_page + 2);
      
      // Ajustar si estamos cerca del inicio
      if (current_page <= 3) {
        end = Math.min(total_pages, maxVisible);
      }
      
      // Ajustar si estamos cerca del final
      if (current_page >= total_pages - 2) {
        start = Math.max(1, total_pages - maxVisible + 1);
      }
      
      // Agregar primera página y puntos suspensivos si es necesario
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }
      
      // Agregar páginas del rango
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Agregar puntos suspensivos y última página si es necesario
      if (end < total_pages) {
        if (end < total_pages - 1) {
          pages.push('...');
        }
        pages.push(total_pages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg p-4"
    >
      <div className="flex flex-col space-y-4">
        {/* Información de resultados */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-700 dark:text-dark-300">
            <span className="font-medium">
              Showing {from.toLocaleString()} to {to.toLocaleString()}
            </span>
            <span className="mx-1">of</span>
            <span className="font-medium">
              {total_items.toLocaleString()} results
            </span>
            <span className="hidden sm:inline">
              ({per_page} per page)
            </span>
          </div>

          {/* Información adicional en móvil */}
          <div className="text-sm text-gray-500 dark:text-dark-400 sm:hidden">
            Page {current_page} of {total_pages}
          </div>
        </div>

        {/* Controles de paginación */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Primera página */}
            <Button
              variant="outlined"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={!has_prev_page}
              className="p-2 hidden sm:flex"
              title="First page"
            >
              <ChevronDoubleLeftIcon className="size-4" />
            </Button>

            {/* Página anterior */}
            <Button
              variant="outlined"
              size="sm"
              onClick={() => onPageChange(current_page - 1)}
              disabled={!has_prev_page}
              className="p-2"
              title="Previous page"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>

            {/* Números de página */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((page, index) => {
                if (page === '...') {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 py-1 text-gray-500 dark:text-dark-400 text-sm"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <Button
                    key={page}
                    variant={page === current_page ? "solid" : "outlined"}
                    color={page === current_page ? "primary" : "neutral"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className="min-w-[36px] h-9"
                    disabled={page === current_page}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            {/* Página siguiente */}
            <Button
              variant="outlined"
              size="sm"
              onClick={() => onPageChange(current_page + 1)}
              disabled={!has_next_page}
              className="p-2"
              title="Next page"
            >
              <ChevronRightIcon className="size-4" />
            </Button>

            {/* Última página */}
            <Button
              variant="outlined"
              size="sm"
              onClick={() => onPageChange(total_pages)}
              disabled={!has_next_page}
              className="p-2 hidden sm:flex"
              title="Last page"
            >
              <ChevronDoubleRightIcon className="size-4" />
            </Button>
          </div>
        </div>

        {/* Navegación rápida en móvil */}
        <div className="flex items-center justify-between sm:hidden">
          <Button
            variant="outlined"
            size="sm"
            onClick={() => onPageChange(current_page - 1)}
            disabled={!has_prev_page}
            className="flex items-center gap-2"
          >
            <ChevronLeftIcon className="size-4" />
            Previous
          </Button>

          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {current_page} / {total_pages}
          </span>

          <Button
            variant="outlined"
            size="sm"
            onClick={() => onPageChange(current_page + 1)}
            disabled={!has_next_page}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

AppointmentsPagination.propTypes = {
  pagination: PropTypes.shape({
    current_page: PropTypes.number.isRequired,
    total_pages: PropTypes.number.isRequired,
    total_items: PropTypes.number.isRequired,
    per_page: PropTypes.number.isRequired,
    has_next_page: PropTypes.bool.isRequired,
    has_prev_page: PropTypes.bool.isRequired,
    from: PropTypes.number.isRequired,
    to: PropTypes.number.isRequired
  }).isRequired,
  onPageChange: PropTypes.func.isRequired
};

export { AppointmentsPagination };