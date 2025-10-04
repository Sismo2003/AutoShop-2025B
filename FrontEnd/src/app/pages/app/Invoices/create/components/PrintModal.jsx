// Import Dependencies
import { useRef, Fragment, useCallback, useEffect, useMemo } from 'react';
import { XMarkIcon, PrinterIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";

// Local Imports
import { Button } from 'components/ui';
import AppointmentPrintView from './AppointmentPrintView';

// ----------------------------------------------------------------------

// Hook para obtener información del atajo de teclado según el OS
const usePrintShortcut = () => {
  return useMemo(() => {
    const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform) || 
                  /Mac|iPod|iPhone|iPad/.test(navigator.userAgent) ||
                  navigator.platform === 'MacIntel';
    
    return {
      isMac,
      display: isMac ? '⌘P' : 'Ctrl+P',
      keys: isMac ? ['⌘', 'P'] : ['Ctrl', 'P'],
      description: isMac ? 'Press Command+P to print' : 'Press Ctrl+P to print'
    };
  }, []);
};

const PrintModal = ({ isOpen, onClose, appointmentData }) => {
  const printRef = useRef();
  const closeRef = useRef(null);
  const printShortcut = usePrintShortcut();

  // Función de impresión principal - usando window.print()
  const handlePrint = useCallback(() => {
    console.log('🖨️ Starting print process...');
    
    if (!printRef.current) {
      console.error('❌ No print reference found');
      return;
    }

    if (!appointmentData) {
      console.error('❌ No appointment data found');
      return;
    }

    // Obtener el contenido a imprimir
    const printContent = printRef.current;
    // const originalDisplay = printContent.style.display;
    
    // Crear estilos para impresión
    const printStyles = `
      <style id="print-styles">
        @media print {
          body * {
            visibility: hidden;
          }
          
          .print-content, .print-content * {
            visibility: visible;
          }
          
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          
          @page {
            size: A4;
            margin: 0.5in;
          }
        }
        
        @media screen {
          .print-content {
            display: none;
          }
        }
      </style>
    `;

    // Crear elemento temporal para impresión
    const printElement = document.createElement('div');
    printElement.className = 'print-content';
    printElement.innerHTML = printContent.innerHTML;
    
    // Agregar estilos de impresión
    const styleElement = document.createElement('div');
    styleElement.innerHTML = printStyles;
    
    // Agregar al body
    document.head.appendChild(styleElement.querySelector('style'));
    document.body.appendChild(printElement);

    console.log('✅ Print content prepared, opening print dialog...');

    // Imprimir
    window.print();

    // Limpiar después de imprimir
    setTimeout(() => {
      document.body.removeChild(printElement);
      const printStylesElement = document.getElementById('print-styles');
      if (printStylesElement) {
        document.head.removeChild(printStylesElement);
      }
      console.log('✅ Print cleanup completed');
    }, 1000);

  }, [appointmentData]);

  // Manejar atajos de teclado multiplataforma (Ctrl+P / Cmd+P)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen || event.key.toLowerCase() !== 'p') return;
      
      // Mac: Cmd+P (metaKey = true, ctrlKey = false)
      // Windows/Linux: Ctrl+P (ctrlKey = true, metaKey = false)
      const isPrintShortcut = (event.metaKey && !event.ctrlKey) || 
                            (event.ctrlKey && !event.metaKey);
      
      if (isPrintShortcut) {
        event.preventDefault();
        event.stopPropagation();
        console.log(`🖨️ Print shortcut triggered: ${printShortcut.display}`);
        handlePrint();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrint, printShortcut.display]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        onClose={onClose}
        initialFocus={closeRef}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/30" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel className="relative flex w-full max-w-6xl origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300 dark:bg-dark-700 max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-6 w-6 text-primary-600" />
                <div>
                  <DialogTitle
                    as="h3"
                    className="text-base font-medium text-gray-800 dark:text-dark-100"
                  >
                    Appointment Print Preview
                  </DialogTitle>
                  <p className="text-sm text-gray-500 dark:text-dark-300">
                    Ticket #{appointmentData?.id || 'N/A'} - {appointmentData?.customer_name || 'Unknown Customer'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={handlePrint}
                  color="primary"
                  className="flex items-center space-x-2"
                  size="sm"
                >
                  <PrinterIcon className="h-4 w-4" />
                  <span>Print</span>
                </Button>
                
                <Button
                  onClick={onClose}
                  variant="flat"
                  isIcon
                  className="size-7 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
                  ref={closeRef}
                >
                  <XMarkIcon className="size-4.5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto p-4 bg-gray-50 dark:bg-dark-800">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden mx-auto max-w-4xl">
                  {appointmentData ? (
                    <div ref={printRef}>
                      <AppointmentPrintView appointmentData={appointmentData} />
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No appointment data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-800">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500 dark:text-dark-300">
                  Preview Mode - Use the Print button to print the document
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 dark:text-dark-400">Shortcut:</span>
                  <div className="flex items-center space-x-1">
                    {printShortcut.keys.map((key, index) => (
                      <kbd 
                        key={index}
                        className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded dark:bg-dark-700 dark:text-dark-200 dark:border-dark-500"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={onClose}
                  variant="outlined"
                  size="sm"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default PrintModal;