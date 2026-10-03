import { SavedResource } from '../types';

export const STORAGE_KEY = 'proudly_afrikan_saved_resources_v1';

export function getSavedResources(): SavedResource[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveResourceToStorage(resource: SavedResource): void {
  try {
    const items = getSavedResources();
    const existingIndex = items.findIndex((item) => item.id === resource.id);
    if (existingIndex >= 0) {
      items[existingIndex] = resource;
    } else {
      items.unshift(resource);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {}
}

export function deleteResourceFromStorage(id: string): void {
  try {
    const items = getSavedResources().filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {}
}
