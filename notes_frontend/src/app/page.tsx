/**
 * Main page for NoteMaster Pro.
 * Renders the full application with auth gating and the three-panel layout.
 */
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useNotes } from '@/contexts/NotesContext';
import AuthModal from '@/components/AuthModal';
import Sidebar from '@/components/Sidebar';
import NoteList from '@/components/NoteList';
import NoteEditor from '@/components/NoteEditor';

/**
 * Main application page.
 * Shows auth modal when not authenticated, otherwise renders the notes app.
 */
export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--retro-bg)',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{ fontSize: '3rem' }}>📓</div>
        <div style={{ fontFamily: 'Courier New', color: 'var(--retro-accent)', textTransform: 'uppercase', letterSpacing: '3px' }}>
          LOADING...
        </div>
        <div style={{ width: '200px', height: '4px', background: 'var(--retro-surface)' }}>
          <div style={{
            height: '100%',
            background: 'var(--retro-primary)',
            animation: 'loading 1.5s ease-in-out infinite',
            width: '40%',
          }} />
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(0); }
            50% { transform: translateX(380%); }
            100% { transform: translateX(0); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return <NotesApp />;
}

/** Inner notes application rendered when the user is authenticated */
function NotesApp() {
  useNotes(); // ensure context is connected

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--retro-bg)',
    }}>
      {/* Left Sidebar: Folders, Tags, Navigation */}
      <Sidebar />

      {/* Middle: Note List */}
      <NoteList />

      {/* Right: Note Editor */}
      <NoteEditor />
    </div>
  );
}
