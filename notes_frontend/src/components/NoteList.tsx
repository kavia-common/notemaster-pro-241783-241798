/**
 * NoteList component for NoteMaster Pro.
 * Displays a list of notes with search, filter options, and note cards.
 */
'use client';

import React, { useState } from 'react';
import { useNotes } from '@/contexts/NotesContext';
import { Note } from '@/types';

// PUBLIC_INTERFACE
/** Displays the list of notes in the main panel */
export default function NoteList() {
  const { notes, isLoading, selectedNote, setSelectedNote, filters, setFilters, createNote, deleteNote, togglePin, toggleFavorite } = useNotes();
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  /** Handle search input with debounce */
  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    const t = setTimeout(() => {
      setFilters({ ...filters, search: value || undefined });
    }, 400);
    setSearchTimeout(t);
  };

  const handleNewNote = async () => {
    const note = await createNote();
    setSelectedNote(note);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  const getPreview = (content: string) => {
    // Strip markdown syntax for preview
    return content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/\n/g, ' ')
      .trim()
      .slice(0, 80) || '// empty note';
  };

  return (
    <div style={{
      width: '280px',
      minWidth: '280px',
      borderRight: '2px solid var(--retro-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--retro-bg)',
    }}>
      {/* Header Bar */}
      <div style={{
        padding: '12px',
        borderBottom: '2px solid var(--retro-border)',
        background: 'var(--retro-surface)',
      }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            className="retro-input"
            style={{ fontSize: '0.8rem', padding: '6px 10px' }}
            type="text"
            value={searchValue}
            onChange={e => handleSearch(e.target.value)}
            placeholder="🔍 search notes..."
          />
          <button
            className="retro-btn retro-btn-accent"
            style={{ whiteSpace: 'nowrap', padding: '6px 10px', fontSize: '1rem' }}
            onClick={handleNewNote}
            title="New note"
          >+</button>
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--retro-text-dim)' }}>
          {notes.length} note{notes.length !== 1 ? 's' : ''}
          {filters.is_pinned && ' // pinned'}
          {filters.is_favorite && ' // favorites'}
          {filters.is_archived && ' // archived'}
          {filters.search && ` // search: "${filters.search}"`}
        </div>
      </div>

      {/* Note List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--retro-text-dim)' }}>
            <div style={{ fontSize: '0.8rem' }}>LOADING...</div>
          </div>
        ) : notes.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--retro-text-dim)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
            <div style={{ fontSize: '0.75rem' }}>NO NOTES FOUND</div>
            <button
              className="retro-btn retro-btn-accent"
              style={{ marginTop: '12px', fontSize: '0.75rem' }}
              onClick={handleNewNote}
            >CREATE NOTE</button>
          </div>
        ) : (
          notes.map((note: Note) => (
            <div
              key={note.id}
              className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''} ${note.is_pinned ? 'pinned' : ''}`}
              style={{ padding: '10px 12px', borderBottom: '1px solid rgba(83,52,131,0.3)' }}
              onClick={() => setSelectedNote(note)}
            >
              {/* Note Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  color: selectedNote?.id === note.id ? 'var(--retro-primary)' : 'var(--retro-text)',
                  fontFamily: 'Courier New',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  marginRight: '4px',
                }}>
                  {note.title || 'Untitled'}
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {note.is_pinned && <span title="Pinned" style={{ fontSize: '0.7rem' }}>📌</span>}
                  {note.is_favorite && <span title="Favorite" style={{ fontSize: '0.7rem' }}>⭐</span>}
                </div>
              </div>

              {/* Preview */}
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--retro-text-dim)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginBottom: '4px',
              }}>
                {getPreview(note.content)}
              </div>

              {/* Tags & Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {note.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag.id}
                      className="retro-tag"
                      style={{ color: tag.color, borderColor: tag.color, fontSize: '0.6rem' }}
                    >
                      {tag.name}
                    </span>
                  ))}
                  {note.tags.length > 2 && (
                    <span style={{ fontSize: '0.6rem', color: 'var(--retro-text-dim)' }}>+{note.tags.length - 2}</span>
                  )}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--retro-text-dim)', flexShrink: 0 }}>
                  {formatDate(note.updated_at)}
                </div>
              </div>

              {/* Actions (visible on hover via JS) */}
              {selectedNote?.id === note.id && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }} onClick={e => e.stopPropagation()}>
                  <button
                    className="retro-btn retro-btn-sm"
                    style={{ fontSize: '0.6rem', borderColor: note.is_pinned ? 'var(--retro-accent-2)' : undefined }}
                    onClick={() => togglePin(note)}
                    title={note.is_pinned ? 'Unpin' : 'Pin'}
                  >{note.is_pinned ? 'UNPIN' : 'PIN'}</button>
                  <button
                    className="retro-btn retro-btn-sm"
                    style={{ fontSize: '0.6rem', borderColor: note.is_favorite ? 'var(--retro-accent-2)' : undefined }}
                    onClick={() => toggleFavorite(note)}
                    title={note.is_favorite ? 'Unfavorite' : 'Favorite'}
                  >{note.is_favorite ? 'UNFAV' : 'FAV'}</button>
                  <button
                    className="retro-btn retro-btn-sm"
                    style={{ fontSize: '0.6rem', borderColor: 'var(--retro-error)', color: 'var(--retro-error)' }}
                    onClick={() => {
                      if (confirm('Delete this note?')) deleteNote(note.id);
                    }}
                    title="Delete"
                  >DEL</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
