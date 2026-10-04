export interface ProjectItemData {
  id: string;
  status: 'live' | 'in-progress' | 'future-idea';
  techTags: string[];
  url?: string;
  screenshot?: string;
}

export const projectsData: ProjectItemData[] = [];
