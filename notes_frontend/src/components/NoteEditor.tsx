/**
 * NoteEditor component for NoteMaster Pro.
 * Full-featured note editor with markdown preview, autosave, tags, folders.
 */
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNotes } from '@/contexts/NotesContext';
import { Tag, Folder } from '@/types';
import * as api from '@/lib/api';

// PUBLIC_INTERFACE
/** Full note editor with markdown editing and preview */
export default function NoteEditor() {
  const { selectedNote, updateNote, deleteNote, togglePin, toggleFavorite, tags, folders } = useNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);
  const noteIdRef = useRef<string | null>(null);

  // Sync editor with selected note
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      noteIdRef.current = selectedNote.id;
      setLastSaved(new Date(selectedNote.updated_at));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNote?.id]);

  /** Autosave on content or title change */
  const triggerAutosave = useCallback((newTitle: string, newContent: string) => {
    if (!noteIdRef.current) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      if (!noteIdRef.current) return;
      setIsSaving(true);
      try {
        await api.autosaveNote(noteIdRef.current, newTitle, newContent);
        setLastSaved(new Date());
      } catch (err) {
        console.error('Autosave failed', err);
      } finally {
        setIsSaving(false);
      }
    }, 1200);
  }, []);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    triggerAutosave(value, content);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    triggerAutosave(title, value);
  };

  const handleTagToggle = async (tag: Tag) => {
    if (!selectedNote) return;
    const currentTagIds = selectedNote.tags.map(t => t.id);
    const newTagIds = currentTagIds.includes(tag.id)
      ? currentTagIds.filter(id => id !== tag.id)
      : [...currentTagIds, tag.id];
    await updateNote(selectedNote.id, { tag_ids: newTagIds });
  };

  const handleFolderChange = async (folderId: string | null) => {
    if (!selectedNote) return;
    await updateNote(selectedNote.id, { folder_id: folderId });
  };

  const handleArchive = async () => {
    if (!selectedNote) return;
    await updateNote(selectedNote.id, { is_archived: !selectedNote.is_archived });
  };

  const formatSavedTime = (d: Date) => {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (!selectedNote) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        color: 'var(--retro-text-dim)',
        background: 'var(--retro-bg)',
      }}>
        <div style={{ fontSize: '4rem' }}>📝</div>
        <div style={{ fontFamily: 'Courier New', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Select a note to edit
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--retro-border)' }}>
          or create a new one from the list
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--retro-bg)',
      overflow: 'hidden',
    }}>
      {/* Toolbar */}
      <div style={{
        padding: '8px 16px',
        borderBottom: '2px solid var(--retro-border)',
        background: 'var(--retro-surface)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
      }}>
        {/* View Mode Buttons */}
        <div style={{ display: 'flex', border: '1px solid var(--retro-border)' }}>
          {(['edit', 'split', 'preview'] as const).map(mode => (
            <button
              key={mode}
              className="retro-btn retro-btn-sm"
              style={{
                border: 'none',
                borderRight: mode !== 'preview' ? '1px solid var(--retro-border)' : 'none',
                background: viewMode === mode ? 'var(--retro-primary)' : 'transparent',
                color: viewMode === mode ? 'var(--retro-bg)' : 'var(--retro-primary)',
                fontSize: '0.65rem',
              }}
              onClick={() => setViewMode(mode)}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Pin & Favorite */}
        <button
          className="retro-btn retro-btn-sm"
          style={{
            borderColor: selectedNote.is_pinned ? 'var(--retro-accent-2)' : undefined,
            color: selectedNote.is_pinned ? 'var(--retro-accent-2)' : undefined,
          }}
          onClick={() => togglePin(selectedNote)}
          title={selectedNote.is_pinned ? 'Unpin note' : 'Pin note'}
        >
          {selectedNote.is_pinned ? '📌 UNPIN' : '📌 PIN'}
        </button>

        <button
          className="retro-btn retro-btn-sm"
          style={{
            borderColor: selectedNote.is_favorite ? 'var(--retro-accent-2)' : undefined,
            color: selectedNote.is_favorite ? 'var(--retro-accent-2)' : undefined,
          }}
          onClick={() => toggleFavorite(selectedNote)}
          title={selectedNote.is_favorite ? 'Remove favorite' : 'Add to favorites'}
        >
          {selectedNote.is_favorite ? '⭐ UNFAV' : '⭐ FAV'}
        </button>

        <button
          className="retro-btn retro-btn-sm"
          style={{ borderColor: 'var(--retro-accent)', color: 'var(--retro-accent)' }}
          onClick={() => setShowMetadata(v => !v)}
        >
          ⚙ META
        </button>

        <button
          className="retro-btn retro-btn-sm"
          style={{
            borderColor: selectedNote.is_archived ? 'var(--retro-accent-2)' : 'var(--retro-text-dim)',
            color: selectedNote.is_archived ? 'var(--retro-accent-2)' : 'var(--retro-text-dim)'
          }}
          onClick={handleArchive}
        >
          {selectedNote.is_archived ? '🗃 UNARCHIVE' : '🗃 ARCHIVE'}
        </button>

        <button
          className="retro-btn retro-btn-sm"
          style={{ borderColor: 'var(--retro-error)', color: 'var(--retro-error)', marginLeft: 'auto' }}
          onClick={() => {
            if (confirm('Delete this note permanently?')) deleteNote(selectedNote.id);
          }}
        >
          🗑 DELETE
        </button>

        {/* Save Status */}
        <div style={{ fontSize: '0.65rem', color: isSaving ? 'var(--retro-accent-2)' : 'var(--retro-text-dim)', minWidth: '120px', textAlign: 'right' }}>
          {isSaving ? '💾 SAVING...' : lastSaved ? `✓ ${formatSavedTime(lastSaved)}` : ''}
        </div>
      </div>

      {/* Metadata Panel */}
      {showMetadata && (
        <div style={{
          padding: '12px 16px',
          borderBottom: '2px solid var(--retro-border)',
          background: 'var(--retro-surface)',
        }}>
          {/* Folder selector */}
          <div style={{ marginBottom: '10px' }}>
            <label className="retro-label" style={{ marginBottom: '4px', display: 'block' }}>Folder</label>
            <select
              className="retro-input"
              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
              value={selectedNote.folder_id || ''}
              onChange={e => handleFolderChange(e.target.value || null)}
            >
              <option value="">-- None --</option>
              {folders.map((f: Folder) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Tag selector */}
          <div>
            <label className="retro-label" style={{ marginBottom: '6px', display: 'block' }}>Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {tags.map((tag: Tag) => {
                const isActive = selectedNote.tags.some(t => t.id === tag.id);
                return (
                  <button
                    key={tag.id}
                    className="retro-tag"
                    style={{
                      color: isActive ? 'var(--retro-bg)' : tag.color,
                      borderColor: tag.color,
                      backgroundColor: isActive ? tag.color : 'transparent',
                      cursor: 'pointer',
                      border: `1px solid ${tag.color}`,
                      padding: '2px 8px',
                      fontSize: '0.7rem',
                    }}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag.name}
                  </button>
                );
              })}
              {tags.length === 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--retro-text-dim)' }}>
                  No tags. Create tags in the sidebar.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Title Input */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--retro-border)', background: 'var(--retro-surface)' }}>
        <input
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '1.4rem',
            fontFamily: 'Courier New, monospace',
            fontWeight: 'bold',
            color: 'var(--retro-text)',
            letterSpacing: '1px',
          }}
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="NOTE TITLE"
        />
      </div>

      {/* Editor / Preview Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Edit Pane */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <textarea
            style={{
              flex: 1,
              background: 'var(--retro-bg)',
              border: 'none',
              borderRight: viewMode === 'split' ? '2px solid var(--retro-border)' : 'none',
              outline: 'none',
              resize: 'none',
              padding: '16px',
              color: 'var(--retro-text)',
              fontFamily: 'Courier New, monospace',
              fontSize: '0.9rem',
              lineHeight: '1.7',
            }}
            value={content}
            onChange={e => handleContentChange(e.target.value)}
            placeholder={"// Start typing your note here...\n\nSupports **markdown** formatting!"}
          />
        )}

        {/* Preview Pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            className="markdown-content"
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
            }}
          >
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            ) : (
              <p style={{ color: 'var(--retro-text-dim)', fontStyle: 'italic' }}>
                Nothing to preview yet...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div style={{
        padding: '4px 16px',
        borderTop: '1px solid var(--retro-border)',
        background: 'var(--retro-surface)',
        display: 'flex',
        gap: '16px',
        fontSize: '0.65rem',
        color: 'var(--retro-text-dim)',
      }}>
        <span>CHARS: {content.length}</span>
        <span>WORDS: {content.split(/\s+/).filter(Boolean).length}</span>
        <span>LINES: {content.split('\n').length}</span>
        {selectedNote.folder && (
          <span style={{ color: selectedNote.folder.color }}>📁 {selectedNote.folder.name}</span>
        )}
        {selectedNote.tags.length > 0 && (
          <span>🏷 {selectedNote.tags.map(t => t.name).join(', ')}</span>
        )}
        <span style={{ marginLeft: 'auto' }}>
          CREATED: {new Date(selectedNote.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
