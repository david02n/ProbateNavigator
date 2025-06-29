import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fix for Vite HMR WebSocket connection in Replit environment
// This prevents "Failed to construct 'WebSocket': The URL 'wss://localhost:undefined/?token=...' is invalid" errors
if (typeof window !== 'undefined') {
  // Override Vite's WebSocket connection for Replit environment
  const originalWebSocket = window.WebSocket;
  
  window.WebSocket = class extends originalWebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      // Fix invalid localhost:undefined URLs
      if (typeof url === 'string' && url.includes('localhost:undefined')) {
        // Replace with current window location
        const correctedUrl = url.replace(
          'wss://localhost:undefined',
          `wss://${window.location.host}`
        ).replace(
          'ws://localhost:undefined', 
          `ws://${window.location.host}`
        );
        console.log('Fixed WebSocket URL:', correctedUrl);
        super(correctedUrl, protocols);
      } else {
        super(url, protocols);
      }
    }
  };
  
  // Also set Vite's expected properties
  // @ts-ignore
  window.__vite_ws_port = window.location.port ? parseInt(window.location.port, 10) : 443;
}
