/**
 * TypeScript type definitions for NoteMaster Pro frontend.
 * Defines interfaces for all API entities and responses.
 */

// PUBLIC_INTERFACE
export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

// PUBLIC_INTERFACE
export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

// PUBLIC_INTERFACE
export interface Folder {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

// PUBLIC_INTERFACE
export interface Note {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_favorite: boolean;
  is_archived: boolean;
  folder_id: string | null;
  folder: Folder | null;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

// PUBLIC_INTERFACE
export interface NoteListResponse {
  notes: Note[];
  total: number;
  page: number;
  page_size: number;
}

// PUBLIC_INTERFACE
export interface NoteCreate {
  title?: string;
  content?: string;
  is_pinned?: boolean;
  is_favorite?: boolean;
  folder_id?: string | null;
  tag_ids?: string[];
}

// PUBLIC_INTERFACE
export interface NoteUpdate {
  title?: string;
  content?: string;
  is_pinned?: boolean;
  is_favorite?: boolean;
  is_archived?: boolean;
  folder_id?: string | null;
  tag_ids?: string[];
}

// PUBLIC_INTERFACE
export interface TagCreate {
  name: string;
  color?: string;
}

// PUBLIC_INTERFACE
export interface FolderCreate {
  name: string;
  color?: string;
}

// PUBLIC_INTERFACE
export interface AuthToken {
  access_token: string;
  token_type: string;
}

// PUBLIC_INTERFACE
export interface NoteFilters {
  search?: string;
  folder_id?: string;
  tag_id?: string;
  is_pinned?: boolean;
  is_favorite?: boolean;
  is_archived?: boolean;
}
