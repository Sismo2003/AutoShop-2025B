// Import Dependencies
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

// Local Imports
import SearchIcon from "assets/dualicons/search.svg?react";
import { RightSidebar } from "components/template/RightSidebar";
import { Notifications } from "components/template/Notifications";
import { Button } from "components/ui";
import { SidebarToggleBtn } from "components/shared/SidebarToggleBtn";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { Profile } from "../Profile";
import { Search } from "components/template/Search";
import { useThemeContext } from "app/contexts/theme/context";
import { useTwilioContext } from 'app/contexts/twilio/context.js';

// ----------------------------------------------------------------------

// Componente para mostrar el estado de conexión
function ConnectionStatus({ type, status, className, showStatusText = false }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'connected':
        return {
          color: 'bg-emerald-500 shadow-emerald-500/30',
          text: 'Connected',
          textColor: 'text-emerald-700 dark:text-emerald-300',
          glow: 'shadow-lg shadow-emerald-500/20'
        };
      case 'connecting':
        return {
          color: 'bg-amber-500 shadow-amber-500/30',
          text: 'Connecting',
          textColor: 'text-amber-700 dark:text-amber-300',
          glow: 'shadow-lg shadow-amber-500/20'
        };
      case 'disconnected':
        return {
          color: 'bg-rose-500 shadow-rose-500/30',
          text: 'Disconnected',
          textColor: 'text-rose-700 dark:text-rose-300',
          glow: 'shadow-lg shadow-rose-500/20'
        };
      case 'calling':
        return {
          color: 'bg-violet-500 shadow-violet-500/30',
          text: 'Calling',
          textColor: 'text-violet-700 dark:text-violet-300',
          glow: 'shadow-lg shadow-violet-500/20'
        };
      case 'in_call':
        return {
          color: 'bg-blue-500 shadow-blue-500/30',
          text: 'In Call',
          textColor: 'text-blue-700 dark:text-blue-300',
          glow: 'shadow-lg shadow-blue-500/20'
        };
      case "error":
        return {
          color: 'bg-red-500 shadow-red-500/30',
          text: 'Error',
          textColor: 'text-red-700 dark:text-red-300',
          glow: 'shadow-lg shadow-red-500/20'
        };
      default:
        return {
          color: 'bg-slate-400 shadow-slate-400/20',
          text: 'Unknown',
          textColor: 'text-slate-600 dark:text-slate-400',
          glow: 'shadow-lg shadow-slate-400/10'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className={clsx(
            "size-2.5 rounded-full transition-all duration-200",
            config.color,
            config.glow,
            (status === 'connecting' || status === 'calling') && "animate-pulse"
          )} />
          {(status === 'connecting' || status === 'calling') && (
            <div className={clsx(
              "absolute inset-0 size-2.5 rounded-full animate-ping opacity-75",
              config.color
            )} />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={clsx(
            "text-xs font-semibold tracking-wide uppercase",
            config.textColor
          )}>
            {type}
          </span>
          {showStatusText && (
            <>
              <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
              <span className={clsx(
                "text-xs font-medium",
                config.textColor
              )}>
                {config.text}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const { smAndUp } = useBreakpointsContext();
  const { cardSkin } = useThemeContext();
  const { callStatus, socketStatus } = useTwilioContext();

  return (
    <header
      className={clsx(
        "app-header transition-all duration-300 sticky top-0 z-30",
        "flex h-[72px] items-center gap-6",
        "border-b border-slate-200/60 dark:border-slate-700/60",
        "bg-white/90 dark:bg-slate-900/90",
        "backdrop-blur-xl backdrop-saturate-150",
        "px-6 lg:px-8",
        "shadow-sm shadow-slate-900/5 dark:shadow-black/20",
        "max-sm:justify-between max-sm:gap-4",
        cardSkin === "bordered" ? "dark:bg-slate-900/95" : "dark:bg-slate-800/95",
      )}
    >
      {/* Toggle Sidebar Button */}
      <div className="contents xl:hidden">
        <div className="flex items-center">
          <SidebarToggleBtn />
        </div>
      </div>


      {/* Search Section */}
      <div className="flex-1 min-w-0">
        <Search
          renderButton={(open) => (
            <>
              {smAndUp && (
                <button
                  onClick={open}
                  className={clsx(
                    "group flex cursor-pointer items-center gap-4 outline-none max-sm:hidden",
                    "w-full max-w-md px-4 py-2.5 rounded-xl",
                    "bg-slate-50/80 hover:bg-slate-100/90 dark:bg-slate-800/50 dark:hover:bg-slate-800/80",
                    "border border-slate-200/60 hover:border-slate-300/80 dark:border-slate-700/60 dark:hover:border-slate-600/80",
                    "transition-all duration-200 backdrop-blur-sm",
                    "hover:shadow-md hover:shadow-slate-900/5 dark:hover:shadow-black/20"
                  )}
                >
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                    <MagnifyingGlassIcon className="size-5 transition-colors" />
                    <span className="text-sm font-medium">Search anything...</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto opacity-60 group-hover:opacity-80 transition-opacity">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="16"
                      aria-hidden="true"
                      className="text-slate-500 dark:text-slate-400"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        d="M2.5.5h10c1.4 0 2.5 1.1 2.5 2.5v10c0 1.4-1.1 2.5-2.5 2.5h-10c-1.4 0-2.5-1.1-2.5-2.5v-10c0-1.4 1.1-2.5 2.5-2.5z"
                        opacity="0.5"
                      />
                      <path
                        fill="currentColor"
                        d="M9.8 5L7 12.1h-.6L8.8 5h1z"
                      />
                    </svg>
                  </div>
                </button>
              )}
              <Button
                onClick={open}
                variant="flat"
                isIcon
                className={clsx(
                  "relative size-10 rounded-xl sm:hidden",
                  "bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800/90",
                  "border border-slate-200/60 dark:border-slate-700/60",
                  "transition-all duration-200 backdrop-blur-sm",
                  "hover:shadow-md hover:shadow-slate-900/5 dark:hover:shadow-black/20"
                )}
              >
                <SearchIcon className="size-5 text-slate-700 dark:text-slate-300" />
              </Button>
            </>
          )}
        />
      </div>

      {/* Main Content Section */}
      <div className="flex items-center gap-4 sm:flex-1 min-w-0">
        {/* Connection Status Section */}
        <div className="flex items-center gap-4 ltr:-mr-1.5 rtl:-ml-1.5">
          {/* Desktop Connection Status */}
          <div className="hidden md:flex items-center gap-6 px-4 py-2 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
            <ConnectionStatus
              type="Phone"
              status={callStatus}
              showStatusText={true}
            />
            <div className="h-5 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent dark:via-slate-600" />
            <ConnectionStatus
              type="Socket"
              status={socketStatus}
              showStatusText={true}
            />
          </div>

          {/* Mobile Connection Status - Compact Pills */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-full backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60">
              {/* Phone Indicator */}
              <div className="relative">
                <div
                  className={clsx(
                    "size-2 rounded-full transition-all duration-200",
                    callStatus === 'connected' && "bg-emerald-500 shadow-sm shadow-emerald-500/40",
                    callStatus === 'connecting' && "bg-amber-500 animate-pulse shadow-sm shadow-amber-500/40",
                    callStatus === 'calling' && "bg-violet-500 animate-pulse shadow-sm shadow-violet-500/40",
                    callStatus === 'in_call' && "bg-blue-500 shadow-sm shadow-blue-500/40",
                    callStatus === 'disconnected' && "bg-rose-500 shadow-sm shadow-rose-500/40",
                    callStatus === 'error' && "bg-red-500 shadow-sm shadow-red-500/40",
                    !callStatus && "bg-slate-400 shadow-sm shadow-slate-400/20"
                  )}
                  title={`Phone: ${callStatus || 'Unknown'}`}
                />
                {(callStatus === 'connecting' || callStatus === 'calling') && (
                  <div className={clsx(
                    "absolute inset-0 size-2 rounded-full animate-ping opacity-60",
                    callStatus === 'connecting' && "bg-amber-500",
                    callStatus === 'calling' && "bg-violet-500"
                  )} />
                )}
              </div>

              <div className="h-3 w-px bg-slate-300 dark:bg-slate-600" />

              {/* Socket Indicator */}
              <div className="relative">
                <div
                  className={clsx(
                    "size-2 rounded-full transition-all duration-200",
                    socketStatus === 'connected' && "bg-emerald-500 shadow-sm shadow-emerald-500/40",
                    socketStatus === 'connecting' && "bg-amber-500 animate-pulse shadow-sm shadow-amber-500/40",
                    socketStatus === 'disconnected' && "bg-rose-500 shadow-sm shadow-rose-500/40",
                    !socketStatus && "bg-slate-400 shadow-sm shadow-slate-400/20"
                  )}
                  title={`WebSocket: ${socketStatus || 'Unknown'}`}
                />
                {socketStatus === 'connecting' && (
                  <div className="absolute inset-0 size-2 rounded-full animate-ping opacity-60 bg-amber-500" />
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Notifications />
          <RightSidebar />
          <Profile />
        </div>
      </div>
    </header>
  );
}
