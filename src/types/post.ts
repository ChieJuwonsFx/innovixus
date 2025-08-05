export type PostTemplate = 'blue' | 'white';
export type PostCategory = 'info-lomba' | 'info-magang' | 'info-workshop' | string;

export interface PostData {
  title: string;
  category: PostCategory;
  images: File[];
  template: PostTemplate;
}

export interface GeneratedPost {
  url: string;
  pageNumber: number;
}