/**
 * Sidebar component for NoteMaster Pro.
 * Shows navigation: all notes, pinned, favorites, folders, tags.
 */
'use client';

import React, { useState } from 'react';
import { useNotes } from '@/contexts/NotesContext';
import { useAuth } from '@/contexts/AuthContext';
import { Folder, Tag } from '@/types';

// PUBLIC_INTERFACE
/** Sidebar navigation component */
export default function Sidebar() {
  const { user, logout } = useAuth();
  const {
    notes, tags, folders, filters, setFilters,
    createFolder, deleteFolder, createTag, deleteTag
  } = useNotes();

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showNewTag, setShowNewTag] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#06b6d4');

  const setFilter = (newFilters: Record<string, unknown>) => {
    setFilters({ is_archived: false, ...newFilters } as typeof filters);
  };

  const isAllNotes = !filters.folder_id && !filters.tag_id && !filters.is_pinned && !filters.is_favorite && !filters.is_archived;

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim());
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    await createTag(newTagName.trim(), newTagColor);
    setNewTagName('');
    setShowNewTag(false);
  };

  const pinnedCount = notes.filter(n => n.is_pinned).length;
  const favCount = notes.filter(n => n.is_favorite).length;

  return (
    <aside style={{
      width: '220px',
      minWidth: '220px',
      background: 'var(--retro-surface)',
      borderRight: '2px solid var(--retro-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* App Title */}
      <div style={{
        padding: '16px 12px',
        borderBottom: '2px solid var(--retro-border)',
        background: 'var(--retro-surface-2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>📓</span>
          <span className="retro-heading" style={{ fontSize: '0.85rem' }}>NoteMaster</span>
        </div>
        {user && (
          <div style={{ fontSize: '0.65rem', color: 'var(--retro-text-dim)', marginTop: '4px' }}>
            {`// ${user.username}`}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {/* Main Filters */}
        <div style={{ padding: '4px 12px', marginBottom: '4px' }}>
          <span className="retro-label" style={{ fontSize: '0.65rem' }}>Navigation</span>
        </div>

        <div
          className={`sidebar-item ${isAllNotes ? 'active' : ''}`}
          onClick={() => setFilter({})}
        >
          {'📝 All Notes'} <span style={{ color: 'var(--retro-text-dim)', fontSize: '0.75rem' }}>({notes.length})</span>
        </div>
        <div
          className={`sidebar-item ${filters.is_pinned ? 'active' : ''}`}
          onClick={() => setFilter({ is_pinned: true })}
        >
          {'📌 Pinned'} <span style={{ color: 'var(--retro-text-dim)', fontSize: '0.75rem' }}>({pinnedCount})</span>
        </div>
        <div
          className={`sidebar-item ${filters.is_favorite ? 'active' : ''}`}
          onClick={() => setFilter({ is_favorite: true })}
        >
          {'⭐ Favorites'} <span style={{ color: 'var(--retro-text-dim)', fontSize: '0.75rem' }}>({favCount})</span>
        </div>
        <div
          className={`sidebar-item ${filters.is_archived ? 'active' : ''}`}
          onClick={() => setFilters({ is_archived: true })}
        >
          🗃 Archive
        </div>

        <hr className="retro-divider" style={{ margin: '8px 12px' }} />

        {/* Folders */}
        <div style={{ padding: '4px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="retro-label" style={{ fontSize: '0.65rem' }}>Folders</span>
          <button
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--retro-accent)', fontSize: '1rem', lineHeight: 1, padding: '0 2px'
            }}
            onClick={() => setShowNewFolder(v => !v)}
            title="New folder"
          >+</button>
        </div>

        {showNewFolder && (
          <form onSubmit={handleCreateFolder} style={{ padding: '4px 12px', marginBottom: '4px' }}>
            <input
              className="retro-input"
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder="folder_name"
              autoFocus
            />
          </form>
        )}

        {folders.map((folder: Folder) => (
          <div
            key={folder.id}
            className={`sidebar-item ${filters.folder_id === folder.id ? 'active' : ''}`}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            onClick={() => setFilter({ folder_id: folder.id })}
          >
            <span>
              <span style={{ color: folder.color }}>▶</span> {folder.name}
            </span>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--retro-text-dim)', fontSize: '0.7rem' }}
              onClick={e => { e.stopPropagation(); deleteFolder(folder.id); }}
              title="Delete folder"
            >✕</button>
          </div>
        ))}

        <hr className="retro-divider" style={{ margin: '8px 12px' }} />

        {/* Tags */}
        <div style={{ padding: '4px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="retro-label" style={{ fontSize: '0.65rem' }}>Tags</span>
          <button
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--retro-accent)', fontSize: '1rem', lineHeight: 1, padding: '0 2px'
            }}
            onClick={() => setShowNewTag(v => !v)}
            title="New tag"
          >+</button>
        </div>

        {showNewTag && (
          <form onSubmit={handleCreateTag} style={{ padding: '4px 12px', marginBottom: '4px' }}>
            <input
              className="retro-input"
              style={{ fontSize: '0.75rem', padding: '4px 8px', marginBottom: '4px' }}
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              placeholder="tag_name"
              autoFocus
            />
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <input
                type="color"
                value={newTagColor}
                onChange={e => setNewTagColor(e.target.value)}
                style={{ width: '32px', height: '24px', border: 'none', background: 'none', cursor: 'pointer' }}
              />
              <button className="retro-btn retro-btn-sm retro-btn-accent" type="submit">Add</button>
            </div>
          </form>
        )}

        {tags.map((tag: Tag) => (
          <div
            key={tag.id}
            className={`sidebar-item ${filters.tag_id === tag.id ? 'active' : ''}`}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            onClick={() => setFilter({ tag_id: tag.id })}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                display: 'inline-block', backgroundColor: tag.color, flexShrink: 0
              }} />
              {tag.name}
            </span>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--retro-text-dim)', fontSize: '0.7rem' }}
              onClick={e => { e.stopPropagation(); deleteTag(tag.id); }}
              title="Delete tag"
            >✕</button>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div style={{
        padding: '12px',
        borderTop: '2px solid var(--retro-border)',
        background: 'var(--retro-surface-2)',
      }}>
        <button
          className="retro-btn"
          style={{ width: '100%', fontSize: '0.75rem' }}
          onClick={logout}
        >
          [ LOGOUT ]
        </button>
      </div>
    </aside>
  );
}
