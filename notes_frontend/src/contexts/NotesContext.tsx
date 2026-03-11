/**
 * Notes context for NoteMaster Pro.
 * Manages notes, tags, folders state and provides CRUD operations.
 */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Note, Tag, Folder, NoteFilters, NoteCreate, NoteUpdate } from '@/types';
import * as api from '@/lib/api';
import { useAuth } from './AuthContext';

// PUBLIC_INTERFACE
export interface NotesContextValue {
  notes: Note[];
  tags: Tag[];
  folders: Folder[];
  isLoading: boolean;
  selectedNote: Note | null;
  filters: NoteFilters;
  setSelectedNote: (note: Note | null) => void;
  setFilters: (filters: NoteFilters) => void;
  loadNotes: () => Promise<void>;
  createNote: (data?: NoteCreate) => Promise<Note>;
  updateNote: (id: string, data: NoteUpdate) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (note: Note) => Promise<void>;
  toggleFavorite: (note: Note) => Promise<void>;
  loadTags: () => Promise<void>;
  createTag: (name: string, color?: string) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;
  loadFolders: () => Promise<void>;
  createFolder: (name: string, color?: string) => Promise<Folder>;
  deleteFolder: (id: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextValue | null>(null);

// PUBLIC_INTERFACE
/** Provider for notes, tags, and folders state */
export function NotesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [filters, setFilters] = useState<NoteFilters>({ is_archived: false });

  const loadNotes = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const result = await api.fetchNotes(filters);
      setNotes(result.notes);
    } catch (err) {
      console.error('Failed to load notes', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, filters]);

  const loadTags = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.fetchTags();
      setTags(data);
    } catch (err) {
      console.error('Failed to load tags', err);
    }
  }, [isAuthenticated]);

  const loadFolders = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.fetchFolders();
      setFolders(data);
    } catch (err) {
      console.error('Failed to load folders', err);
    }
  }, [isAuthenticated]);

  // Load data when authenticated or filters change
  useEffect(() => {
    if (isAuthenticated) {
      loadNotes();
      loadTags();
      loadFolders();
    } else {
      setNotes([]);
      setTags([]);
      setFolders([]);
      setSelectedNote(null);
    }
  }, [isAuthenticated, loadNotes, loadTags, loadFolders]);

  const createNote = useCallback(async (data: NoteCreate = {}): Promise<Note> => {
    const note = await api.createNote({ title: 'Untitled Note', content: '', ...data });
    await loadNotes();
    return note;
  }, [loadNotes]);

  const updateNote = useCallback(async (id: string, data: NoteUpdate): Promise<Note> => {
    const updated = await api.updateNote(id, data);
    setNotes(prev => prev.map(n => n.id === id ? updated : n));
    if (selectedNote?.id === id) setSelectedNote(updated);
    return updated;
  }, [selectedNote]);

  const deleteNote = useCallback(async (id: string) => {
    await api.deleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
  }, [selectedNote]);

  const togglePin = useCallback(async (note: Note) => {
    const updated = await api.updateNote(note.id, { is_pinned: !note.is_pinned });
    setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
    if (selectedNote?.id === note.id) setSelectedNote(updated);
  }, [selectedNote]);

  const toggleFavorite = useCallback(async (note: Note) => {
    const updated = await api.updateNote(note.id, { is_favorite: !note.is_favorite });
    setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
    if (selectedNote?.id === note.id) setSelectedNote(updated);
  }, [selectedNote]);

  const createTag = useCallback(async (name: string, color = '#06b6d4'): Promise<Tag> => {
    const tag = await api.createTag({ name, color });
    setTags(prev => [...prev, tag]);
    return tag;
  }, []);

  const deleteTag = useCallback(async (id: string) => {
    await api.deleteTag(id);
    setTags(prev => prev.filter(t => t.id !== id));
  }, []);

  const createFolder = useCallback(async (name: string, color = '#3b82f6'): Promise<Folder> => {
    const folder = await api.createFolder({ name, color });
    setFolders(prev => [...prev, folder]);
    return folder;
  }, []);

  const deleteFolder = useCallback(async (id: string) => {
    await api.deleteFolder(id);
    setFolders(prev => prev.filter(f => f.id !== id));
  }, []);

  return (
    <NotesContext.Provider value={{
      notes, tags, folders, isLoading, selectedNote, filters,
      setSelectedNote, setFilters, loadNotes,
      createNote, updateNote, deleteNote, togglePin, toggleFavorite,
      loadTags, createTag, deleteTag,
      loadFolders, createFolder, deleteFolder,
    }}>
      {children}
    </NotesContext.Provider>
  );
}

// PUBLIC_INTERFACE
/** Hook to use the notes context */
export function useNotes(): NotesContextValue {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within NotesProvider');
  }
  return context;
}
