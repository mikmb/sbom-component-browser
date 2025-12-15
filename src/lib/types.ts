export type SbomListItem = {
  id: string;
  name: string;
  filename: string;
  format: string;
  status: string;
  uploadedAt: string;
  project: { id: string; name: string };
  componentCount: number;
};
