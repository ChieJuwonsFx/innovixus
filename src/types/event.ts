export type PostTemplate = 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'teal';

export type PostCategory = 
  | 'Info Lomba'
  | 'Info Magang' 
  | 'Info Workshop'
  | 'Info Seminar'
  | string; // Allow custom categories

export interface PostData {
  title: string;
  category: string;
  images: File[];
  template: PostTemplate;
}

export interface GeneratedPost {
  url: string;
  blob?: Blob;
}