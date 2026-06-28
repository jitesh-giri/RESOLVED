import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { Issue } from '../types';
import { AlertTriangle, Hammer, Trash2, CheckCircle, Flame, Droplet } from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface MapVisualizerProps {
  issues: Issue[];
}

function MarkerWithInfoWindow({ issue }: { issue: Issue; key?: React.Key }) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  // default center for markers without location: 19.0596, 72.8295 (Bandra, Mumbai) 
  // plus some jitter so they don't overlap entirely.
  const position = React.useMemo(() => {
    if (issue.location) return issue.location;
    // Simple hash function for issue.id to create stable jitter
    let hash = 0;
    for (let i = 0; i < issue.id.length; i++) {
      hash = (hash << 5) - hash + issue.id.charCodeAt(i);
      hash |= 0;
    }
    const pseudoRandom1 = (Math.abs(hash) % 1000) / 1000;
    const pseudoRandom2 = (Math.abs(hash * 31) % 1000) / 1000;
    return {
      lat: 19.0596 + (pseudoRandom1 - 0.5) * 0.05,
      lng: 72.8295 + (pseudoRandom2 - 0.5) * 0.05
    };
  }, [issue.location, issue.id]);

  const getPinColor = () => {
    switch (issue.category) {
      case 'infrastructure': return '#f59e0b'; // amber
      case 'safety': return '#ef4444'; // red
      case 'trash': return '#8b5cf6'; // violet
      case 'vandalism': return '#f97316'; // orange
      case 'positive': return '#10b981'; // emerald
      default: return '#3b82f6';
    }
  };

  return (
    <>
      <AdvancedMarker ref={markerRef} position={position} onClick={() => setOpen(true)}>
        <Pin background={getPinColor()} glyphColor="#fff" borderColor={getPinColor()} />
      </AdvancedMarker>
      {open && (
        <InfoWindow anchor={marker} onCloseClick={() => setOpen(false)} minWidth={200}>
          <div className="p-1 max-w-[240px] text-slate-800">
            <h3 className="font-semibold text-sm mb-1">{issue.title}</h3>
            <p className="text-xs text-slate-500 mb-2 truncate">{issue.locality}</p>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
               {issue.category}
            </div>
            {issue.imageUrl && (
              <img src={issue.imageUrl} alt={issue.title} className="w-full h-24 object-cover rounded-md mb-2" />
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              issue.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
              issue.status === 'Escalated' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {issue.status}
            </span>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function MapVisualizerContent({ issues }: MapVisualizerProps) {
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Global fallback for Google Maps Auth/API failures
    (window as any).gm_authFailure = () => {
      setMapError("Google Maps API authentication failed. Please ensure your API key is correct, billing is enabled, and the 'Maps JavaScript API' is enabled in your Google Cloud Console.");
    };
    
    const handleScriptError = (e: ErrorEvent) => {
      if (e.message && (e.message.includes('Google Maps JavaScript API error') || e.message === 'Script error.')) {
        setMapError("Google Maps API error: Ensure the 'Maps JavaScript API' is activated for your API key in the Google Cloud Console.");
      }
    };

    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      if (e.reason && e.reason.message && e.reason.message.includes('Google Maps JavaScript API error')) {
        setMapError("Google Maps API error: Ensure the 'Maps JavaScript API' is activated for your API key in the Google Cloud Console.");
      }
    };
    
    window.addEventListener('error', handleScriptError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleScriptError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      delete (window as any).gm_authFailure;
    };
  }, []);

  if (!hasValidKey) {
    return (
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl h-[400px] flex items-center justify-center p-8 text-center transition-colors">
        <div className="max-w-md space-y-4">
          <div className="bg-white dark:bg-slate-950 p-3 rounded-xl inline-block shadow-sm">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="font-display font-bold text-slate-800 dark:text-slate-200 text-lg">Google Maps API Key Required</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            To view the neighborhood incident map, please add your Google Maps Platform API Key in the AI Studio Settings.
          </p>
          <div className="text-left text-xs bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 mt-4 text-slate-700 dark:text-slate-300">
            <p>1. Open <strong>Settings</strong> (⚙️ top-right)</p>
            <p>2. Select <strong>Secrets</strong></p>
            <p>3. Add <code>GOOGLE_MAPS_PLATFORM_KEY</code> with your key</p>
            <p className="text-primary-600 dark:text-primary-400 font-medium">The app will rebuild automatically.</p>
          </div>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl h-[400px] flex items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-4">
          <div className="bg-white p-3 rounded-xl inline-block shadow-sm">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="font-display font-bold text-red-800 text-lg">Map Configuration Error</h3>
          <p className="text-red-700 text-sm leading-relaxed">
            {mapError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 h-[400px] w-full relative transition-colors">
      <APIProvider 
        apiKey={API_KEY} 
        version="weekly"
        onError={() => setMapError("Failed to load Google Maps script. Check your network or API key configuration.")}
      >
        <Map
          defaultCenter={{ lat: 19.0596, lng: 72.8295 }} // Default to Bandra, Mumbai
          defaultZoom={12}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          {issues.map(issue => (
            <MarkerWithInfoWindow key={issue.id} issue={issue} />
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class MapErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };
  props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-3xl h-[400px] flex items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-4">
            <div className="bg-white p-3 rounded-xl inline-block shadow-sm">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="font-display font-bold text-red-800 text-lg">Google Maps API Error</h3>
            <p className="text-red-700 text-sm leading-relaxed">
              Google Maps could not be loaded. Please ensure the <strong>Maps JavaScript API</strong> is enabled for your API key in the Google Cloud Console.
            </p>
            <p className="text-xs text-red-500 mt-2">
              {String(this.state.error?.message || this.state.error)}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MapVisualizer(props: MapVisualizerProps) {
  return (
    <MapErrorBoundary>
      <MapVisualizerContent {...props} />
    </MapErrorBoundary>
  );
}
