import { SavedResource } from '../types';

const STORAGE_KEY = 'proudly_afrikan_build_resources_v1';

export function getSavedResources(): SavedResource[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading saved build resources:', e);
    return [];
  }
}

export function saveResourceToStorage(resource: SavedResource): SavedResource {
  if (typeof window === 'undefined') return resource;
  try {
    const existing = getSavedResources();
    const idx = existing.findIndex((r) => r.id === resource.id);
    let updated: SavedResource[];
    if (idx >= 0) {
      updated = [...existing];
      updated[idx] = resource;
    } else {
      updated = [resource, ...existing];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return resource;
  } catch (e) {
    console.error('Error saving build resource:', e);
    return resource;
  }
}

export function deleteResourceFromStorage(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedResources();
    const filtered = existing.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error deleting build resource:', e);
  }
}
