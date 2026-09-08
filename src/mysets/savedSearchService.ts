import { saveResourceToStorage, getSavedResources } from '../build/utils/storage';
import { SavedResource } from '../build/types';

export interface SavedSearchResultItem {
  id: string;
  query: string;
  title: string;
  summary: string;
  content?: string;
  keyPoints?: string[];
  category: string;
  source?: string;
  createdAt: string;
}

export function saveSearchResult(item: {
  query: string;
  title?: string;
  summary?: string;
  content?: string;
  category?: string;
  keyPoints?: string[];
}): SavedResource {
  const cleanQuery = (item.query || '').trim();
  const title = (item.title || cleanQuery).trim() || 'Curriculum Research';
  const category = (item.category || 'Curriculum Search').trim();
  const summary = item.summary || `Curriculum search research on ${title}. Archived for active recall and study.`;

  const resource: SavedResource = {
    id: `search-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    toolType: 'search-result' as any,
    title,
    subject: category,
    topic: cleanQuery,
    createdAt: new Date().toISOString(),
    data: {
      query: cleanQuery,
      title,
      summary,
      content: item.content || summary,
      keyPoints: item.keyPoints || [
        `Key conceptual analysis for ${title}`,
        `Archived study topic from learner search exploration`,
        `Integrated with Proudly Afrikan curriculum standards`,
      ],
      category,
      source: 'Proudly Afrikan Search',
    },
  };

  saveResourceToStorage(resource);
  return resource;
}
