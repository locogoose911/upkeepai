// React polyfills for compatibility issues
import React from 'react';

// Polyfill for React.use hook if not available
if (typeof React !== 'undefined' && !(React as any).use) {
  (React as any).use = function usePolyfill(resource: any) {
    // Handle context values (most common case for expo-router)
    if (resource && typeof resource === 'object' && '_currentValue' in resource) {
      return resource._currentValue;
    }
    
    // Handle promises (for Suspense)
    if (resource && typeof resource.then === 'function') {
      // Check if promise is resolved
      if (resource._status === 'fulfilled') {
        return resource._result;
      }
      if (resource._status === 'rejected') {
        throw resource._result;
      }
      // If pending, throw the promise for Suspense
      resource._status = 'pending';
      resource.then(
        (result: any) => {
          resource._status = 'fulfilled';
          resource._result = result;
        },
        (error: any) => {
          resource._status = 'rejected';
          resource._result = error;
        }
      );
      throw resource;
    }
    
    // Return the resource as-is for other cases
    return resource;
  };
}

// Ensure global React also has the polyfill
if (typeof globalThis !== 'undefined') {
  if ((globalThis as any).React && typeof (globalThis as any).React === 'object' && !(globalThis as any).React.use) {
    (globalThis as any).React.use = (React as any).use;
  }
  
  // Also add to window for web compatibility
  if (typeof window !== 'undefined' && (window as any).React && typeof (window as any).React === 'object' && !(window as any).React.use) {
    (window as any).React.use = (React as any).use;
  }
}

export {};