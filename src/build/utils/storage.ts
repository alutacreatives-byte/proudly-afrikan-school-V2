import { SavedResource } from '../types';

const STORAGE_KEY = 'proudly_afrikan_build_resources';

export const getSavedResources = (): SavedResource[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load build resources from localStorage:', error);
    return [];
  }
};

export const saveResourceToStorage = (resource: SavedResource): void => {
  try {
    const current = getSavedResources();
    const existingIndex = current.findIndex((item) => item.id === resource.id);

    let updated: SavedResource[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = {
        ...resource,
        createdAt: current[existingIndex].createdAt || new Date().toISOString(),
      };
    } else {
      updated = [
        {
          ...resource,
          createdAt: resource.createdAt || new Date().toISOString(),
        },
        ...current,
      ];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('build-resources-updated', { detail: updated }));
    }
  } catch (error) {
    console.error('Failed to save build resource:', error);
  }
};

export const deleteResourceFromStorage = (id: string): void => {
  try {
    const current = getSavedResources();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('build-resources-updated', { detail: updated }));
    }
  } catch (error) {
    console.error('Failed to delete build resource:', error);
  }
};

export const getSavedResourceById = (id: string): SavedResource | null => {
  const all = getSavedResources();
  return all.find((item) => item.id === id) || null;
};
