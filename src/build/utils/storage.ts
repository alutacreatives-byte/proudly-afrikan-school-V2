import { SavedResource } from '../types';

const STORAGE_KEY = 'proudly_afrikan_saved_resources';

export function getSavedResources(): SavedResource[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse saved resources', e);
    return [];
  }
}

export function saveResourceToStorage(resource: SavedResource): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedResources();
    const filtered = existing.filter((r) => r.id !== resource.id);
    const updated = [resource, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save resource', e);
  }
}

export function deleteResourceFromStorage(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedResources();
    const updated = existing.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to delete resource', e);
  }
}
