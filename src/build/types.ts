export interface SavedResource {
  id: string;
  toolType: string;
  title: string;
  subject: string;
  topic: string;
  createdAt: string;
  data: any;
  sourceSnippet?: string;
  documentName?: string;
}
