import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Clock, Check, ChevronDown, Radio, Play, Pause, Zap } from 'lucide-react';

export interface AutoRefreshToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  intervalSec: number;
  onChangeInterval?: (sec: number) => void;
  countdown: number;
  isUpdating: boolean;
  lastRefreshedAt?: Date | null;
  onManualRefresh?: () => void;
  id?: string;
  className?: string;
}

const INTERVAL_OPTIONS = [
  { value: 15, label: '15 seconds' },
  { value: 30, label: '30 seconds (Default)' },
  { value: 60, label: '1 minute' },
  { value: 120, label: '2 minutes' },
];

export const AutoRefreshToggle: React.FC<AutoRefreshToggleProps> = ({
  enabled,
  onToggle,
  intervalSec,
  onChangeInterval,
  countdown,
  isUpdating,
  lastRefreshedAt,
  onManualRefresh,
  id = 'queue-auto-refresh-toggle',
  className = '',
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <div
      id={id}
      ref={dropdownRef}
      className={`relative inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
        enabled
          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-2xs'
          : 'bg-slate-50 border-slate-200 text-slate-600'
      } ${className}`}
    >
      {/* Switch Control */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle auto-refreshing request list"
        id={`${id}-switch`}
        onClick={() => onToggle(!enabled)}
        title={
          enabled
            ? `Auto-refresh is ON (updating every ${intervalSec}s). Click to pause.`
            : 'Auto-refresh is OFF. Click to enable periodic updates.'
        }
        className="group inline-flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
      >
        {/* Toggle Pill */}
        <div
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            enabled ? 'bg-emerald-600' : 'bg-slate-300 group-hover:bg-slate-400'
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              enabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </div>

        {/* Label & Live Status */}
        <div className="flex items-center gap-1.5 select-none text-left">
          <span className="font-semibold text-slate-800 tracking-tight whitespace-nowrap">
            Auto-refresh
          </span>

          {enabled ? (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 whitespace-nowrap"
              title={`Next refresh in ${countdown}s`}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-2.5 h-2.5 animate-spin text-emerald-700" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{countdown}s</span>
                </>
              )}
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-200/80 text-slate-600 whitespace-nowrap">
              Off
            </span>
          )}
        </div>
      </button>

      {/* Interval Selector Trigger if interval changes are supported */}
      {onChangeInterval && (
        <div className="flex items-center border-l border-slate-200 pl-1.5 ml-0.5">
          <button
            type="button"
            id={`${id}-interval-dropdown-btn`}
            onClick={() => setShowDropdown((prev) => !prev)}
            title="Configure periodic refresh interval"
            aria-haspopup="true"
            aria-expanded={showDropdown}
            className="p-0.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <ChevronDown className="w-3 h-3" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1.5 text-xs space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-2 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                <span>Refresh Interval</span>
                <Clock className="w-3 h-3 text-slate-400" />
              </div>

              {INTERVAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChangeInterval(opt.value);
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    intervalSec === opt.value
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {intervalSec === opt.value && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                </button>
              ))}

              {lastRefreshedAt && (
                <div className="px-2 pt-1 pb-0.5 border-t border-slate-100 text-[10px] text-slate-400">
                  Last updated:{' '}
                  <span className="font-mono text-slate-600">
                    {lastRefreshedAt.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
