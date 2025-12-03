import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Activity, Database, Server } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

interface HealthResponse {
  status: string;
  store: {
    enabled: boolean;
    ready: boolean;
    error: string | null;
  };
  services: {
    ingester: {
      status: string;
      lastSuccessAt: string | null;
    };
  };
  warnings: Array<{
    scope: string;
    message: string;
  }>;
}

export function SystemStatus() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: health, isLoading, isError } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const { data } = await axios.get<HealthResponse>(`${API_BASE_URL}/api/health`);
      return data;
    },
    refetchInterval: 30000, // Poll every 30s
  });

  if (isLoading) return null;

  const isBackendHealthy = !isError && health;
  const isStoreReady = health?.store?.ready;
  const isIngesterOk = health?.services?.ingester?.status === 'ok';

  // Overall status color
  const statusColor = isBackendHealthy && isStoreReady && isIngesterOk
    ? 'bg-green-500'
    : isBackendHealthy
      ? 'bg-yellow-500'
      : 'bg-red-500';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg cursor-pointer transition-all duration-200 ${isOpen ? 'bg-white text-slate-800 ring-1 ring-slate-200' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={`w-2.5 h-2.5 rounded-full ${statusColor} animate-pulse`} />
        <span className="text-xs font-medium">System Status</span>
      </div>

      {isOpen && (
        <div className="absolute bottom-12 right-0 w-72 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-700">System Health</h3>
            <span className="text-xs text-slate-500">Updated: {new Date().toLocaleTimeString()}</span>
          </div>

          <div className="p-3 space-y-3">
            {/* Backend API Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server size={16} className="text-slate-400" />
                <span className="text-sm text-slate-600">Backend API</span>
              </div>
              <StatusBadge status={isBackendHealthy ? 'operational' : 'error'} />
            </div>

            {/* Database Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-slate-400" />
                <span className="text-sm text-slate-600">Database</span>
              </div>
              <StatusBadge status={isStoreReady ? 'operational' : health?.store?.enabled ? 'initializing' : 'disabled'} />
            </div>

            {/* Ingester Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-slate-400" />
                <span className="text-sm text-slate-600">Ingester</span>
              </div>
              <div className="text-right">
                <StatusBadge status={health?.services?.ingester?.status || 'unknown'} />
              </div>
            </div>

            {/* Error/Warning Messages */}
            {health?.warnings && health.warnings.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-100">
                {health.warnings.map((w, i) => (
                  <div key={i} className="text-xs text-amber-600 flex gap-1 mt-1">
                    <span>⚠️</span>
                    <span>{w.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    operational: 'bg-green-100 text-green-700',
    ok: 'bg-green-100 text-green-700',
    degraded: 'bg-yellow-100 text-yellow-700',
    initializing: 'bg-blue-100 text-blue-700',
    disabled: 'bg-slate-100 text-slate-500',
    error: 'bg-red-100 text-red-700',
    unknown: 'bg-gray-100 text-gray-500',
  };

  const normalizedStatus = (styles[status as keyof typeof styles] ? status : 'unknown') as keyof typeof styles;

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[normalizedStatus]}`}>
      {status}
    </span>
  );
}
