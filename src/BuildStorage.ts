import { SavedResource } from '../types';

export const BUILD_STORAGE_KEY = 'proudly_afrikan_build_resources';

export const getSavedResources = (): SavedResource[] => {
  try {
    const raw = localStorage.getItem(BUILD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error('Failed to parse saved build resources', err);
    return [];
  }
};

export const saveResourceToStorage = (resource: SavedResource): void => {
  try {
    const current = getSavedResources();
    const existingIndex = current.findIndex((r) => r.id === resource.id);
    let updated: SavedResource[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = {
        ...current[existingIndex],
        ...resource,
        updatedAt: new Date().toISOString(),
      };
    } else {
      updated = [resource, ...current];
    }
    localStorage.setItem(BUILD_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save build resource', err);
  }
};

export const deleteResourceFromStorage = (id: string): void => {
  try {
    const current = getSavedResources();
    const filtered = current.filter((r) => r.id !== id);
    localStorage.setItem(BUILD_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete build resource', err);
  }
};

export const getSavedResourceById = (id: string): SavedResource | null => {
  const current = getSavedResources();
  return current.find((r) => r.id === id) || null;
};

export const clearSavedResources = (): void => {
  try {
    localStorage.removeItem(BUILD_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear saved resources', err);
  }
};
