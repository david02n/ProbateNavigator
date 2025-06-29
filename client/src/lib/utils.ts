import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fix for Vite HMR WebSocket connection in Replit environment
// This prevents "Failed to construct 'WebSocket': The URL 'wss://localhost:undefined/?token=...' is invalid" errors
if (typeof window !== 'undefined') {
  // @ts-ignore - Fix Vite WebSocket connection in Replit
  const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
  window.__vite_ws_port = parseInt(port, 10);
  
  // Also fix the Vite WebSocket URL construction
  if (window.location.hostname.includes('replit.dev')) {
    // @ts-ignore
    window.__vite_ws_url = `wss://${window.location.host}`;
  }
}
