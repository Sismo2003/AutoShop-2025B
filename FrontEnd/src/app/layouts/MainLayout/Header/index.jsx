// Import Dependencies
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

// Local Imports
import SearchIcon from "assets/dualicons/search.svg?react";
import { SidebarToggleBtn } from "components/shared/SidebarToggleBtn";
import { Button } from "components/ui";
import { Search } from "components/template/Search";
import { useThemeContext } from "app/contexts/theme/context";
import { useTwilioContext } from 'app/contexts/twilio/context.js';

// ----------------------------------------------------------------------

function SlashIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="20"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        d="M3.5.5h12c1.7 0 3 1.3 3 3v13c0 1.7-1.3 3-3 3h-12c-1.7 0-3-1.3-3-3v-13c0-1.7 1.3-3 3-3z"
        opacity="0.4"
      />
      <path fill="currentColor" d="M11.8 6L8 15.1h-.9L10.8 6h1z" />
    </svg>
  );
}

// Componente para mostrar el estado de conexión
function ConnectionStatus({ type, status, className, showStatusText = false }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'connected':
        return {
          color: 'bg-green-500',
          text: 'Connected',
          textColor: 'text-green-600 dark:text-green-400'
        };
      case 'connecting':
        return {
          color: 'bg-yellow-500',
          text: 'Connecting',
          textColor: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'disconnected':
        return {
          color: 'bg-red-500',
          text: 'Disconnected',
          textColor: 'text-red-600 dark:text-red-400'
        };
      case 'calling':
        return {
          color: 'bg-yellow-500',
          text: 'Calling',
          textColor: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'in_call':
        return {
          color: 'bg-blue-500',
          text: 'In Call',
          textColor: 'text-blue-600 dark:text-blue-400'
        };
      case "error":
        return {
          color: 'bg-red-500',
          text: 'Error',
          textColor: 'text-red-600 dark:text-red-400'
        };
      default:
        return {
          color: 'bg-gray-500',
          text: 'Unknown',
          textColor: 'text-gray-600 dark:text-gray-400'
        };
    }
  };
  
  const config = getStatusConfig(status);
  
  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1.5">
        <div className={clsx(
          "size-2 rounded-full transition-colors duration-300 ease-in-out",
          config.color,
          (status === 'connecting' || status === 'calling') && "animate-pulse"
        )} />
        <span className={clsx("text-xs font-medium transition-colors duration-300 ease-in-out", config.textColor)}>
          {type}
        </span>
        {showStatusText && (
          <>
            <span className="text-xs text-gray-400 dark:text-dark-400">-</span>
            <span className={clsx("text-xs transition-colors duration-300 ease-in-out", config.textColor)}>
              {config.text}
            </span>
          </>
        )}
      </div>
    </div>
  );
}


export function Header() {
  const { cardSkin } = useThemeContext();
  
  const { callStatus, socketStatus } = useTwilioContext();

  
  return (
    <header
      className={clsx(
        "app-header transition-content sticky top-0 z-20 flex h-[65px] shrink-0 items-center justify-between border-b border-gray-200 bg-white/80 px-(--margin-x) backdrop-blur-sm backdrop-saturate-150 dark:border-dark-600",
        cardSkin === "shadow-sm" ? "dark:bg-dark-750/80" : "dark:bg-dark-900/80",
      )}
    >
      <SidebarToggleBtn />
      
      <div className="flex items-center gap-4 ltr:-mr-1.5 rtl:-ml-1.5">
        {/* Estados de Conexión */}
        <div className="flex items-center gap-3 max-md:hidden">
          <ConnectionStatus
            type="Phones"
            status={callStatus}
            showStatusText={true}
          />
          <div className="h-4 w-px bg-gray-300 dark:bg-dark-500 transition-colors duration-300" />
          <ConnectionStatus
            type="WebSocket"
            status={socketStatus}
            showStatusText={true}
          />
          <div className="h-4 w-px bg-gray-300 dark:bg-dark-500 transition-colors duration-300" />
        </div>
        
        {/* Versión compacta para móviles */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex items-center gap-1">
            {/* Indicador Phones */}
            <div
              className={clsx(
                "size-2 rounded-full transition-colors duration-300 ease-in-out",
                callStatus === 'connected' && "bg-green-500",
                callStatus === 'connecting' && "bg-yellow-500 animate-pulse",
                callStatus === 'calling' && "bg-yellow-500 animate-pulse",
                callStatus === 'in_call' && "bg-blue-500",
                callStatus === 'disconnected' && "bg-red-500",
                callStatus === 'error' && "bg-red-500",
                !callStatus && "bg-gray-500"
              )}
              title={`Phones: ${callStatus || 'Unknown'}`}
            />
            {/* Indicador WebSocket */}
            <div
              className={clsx(
                "size-2 rounded-full transition-colors duration-300 ease-in-out",
                socketStatus === 'connected' && "bg-green-500",
                socketStatus === 'connecting' && "bg-yellow-500 animate-pulse",
                socketStatus === 'disconnected' && "bg-red-500",
                !socketStatus && "bg-gray-500"
              )}
              title={`WebSocket: ${socketStatus || 'Unknown'}`}
            />
          </div>
        </div>
        
        <Search
          renderButton={(open) => (
            <>
              <Button
                onClick={open}
                unstyled
                className="h-8 w-64 justify-between gap-2 rounded-full border border-gray-200 px-3 text-xs-plus hover:border-gray-400 dark:border-dark-500 dark:hover:border-dark-400 max-sm:hidden"
              >
                <div className="flex items-center gap-2">
                  <MagnifyingGlassIcon className="size-4" />
                  <span className="text-gray-400 dark:text-dark-300">
                    Search
                  </span>
                </div>
                <SlashIcon />
              </Button>
              
              <Button
                onClick={open}
                variant="flat"
                isIcon
                className="relative size-9 rounded-full sm:hidden"
              >
                <SearchIcon className="size-6 text-gray-900 dark:text-dark-100" />
              </Button>
            </>
          )}
        />
      </div>
    </header>
  );
}
