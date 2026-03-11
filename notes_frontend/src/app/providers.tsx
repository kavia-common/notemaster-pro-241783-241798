/**
 * Application providers for NoteMaster Pro.
 * Wraps children with AuthProvider and NotesProvider context.
 */
'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { NotesProvider } from '@/contexts/NotesContext';

// PUBLIC_INTERFACE
/** Provides auth and notes context to the application */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotesProvider>
        {children}
      </NotesProvider>
    </AuthProvider>
  );
}
