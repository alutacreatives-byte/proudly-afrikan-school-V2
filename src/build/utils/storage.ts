import { SavedResource } from '../types';

const BUILD_RESOURCES_KEY = 'proudly_afrikan_build_resources_v1';

export function getSavedResources(): SavedResource[] {
  try {
    const raw = localStorage.getItem(BUILD_RESOURCES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveResourceToStorage(resource: Omit<SavedResource, 'id' | 'createdAt'>): SavedResource {
  const resources = getSavedResources();
  const newRes: SavedResource = {
    ...resource,
    id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  resources.unshift(newRes);
  try {
    localStorage.setItem(BUILD_RESOURCES_KEY, JSON.stringify(resources));
  } catch (e) {
    console.error('Failed to save resource:', e);
  }
  return newRes;
}

export function deleteResourceFromStorage(id: string): SavedResource[] {
  const resources = getSavedResources();
  const filtered = resources.filter(r => r.id !== id);
  try {
    localStorage.setItem(BUILD_RESOURCES_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete resource:', e);
  }
  return filtered;
}
