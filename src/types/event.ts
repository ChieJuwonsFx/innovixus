// types/event.ts
export type PostTemplate = 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'teal' | 'white';

export type PostCategory = 
  | 'Info Lomba'
  | 'Info Magang' 
  | 'Info Workshop'
  | 'Info Seminar'
  | string; 

export interface PostData {
  title: string;
  category: string;
  images: File[];
  template: PostTemplate;
}

export interface GeneratedPost {
  url: string;
  blob?: Blob;
  pageNumber?: number; 
}

export const POST_TEMPLATES = {
  blue: {
    main: '/templates/blue-main.png',
    content: '/templates/blue-content.png',
    textColor: '#1e40af',
    categoryBg: '#dbeafe',
    categoryText: '#1e3a8a',
    borderColor: '#3b82f6'
  },
  white: {
    main: '/templates/white-main.png',
    content: '/templates/white-content.png',
    textColor: '#1f2937',
    categoryBg: '#f3f4f6',
    categoryText: '#374151',
    borderColor: '#9ca3af'
  },
  red: {
    main: '/templates/red-main.png',
    content: '/templates/red-content.png',
    textColor: '#dc2626',
    categoryBg: '#fecaca',
    categoryText: '#991b1b',
    borderColor: '#ef4444'
  },
  green: {
    main: '/templates/green-main.png',
    content: '/templates/green-content.png',
    textColor: '#16a34a',
    categoryBg: '#bbf7d0',
    categoryText: '#15803d',
    borderColor: '#22c55e'
  },
  purple: {
    main: '/templates/purple-main.png',
    content: '/templates/purple-content.png',
    textColor: '#9333ea',
    categoryBg: '#e9d5ff',
    categoryText: '#7c3aed',
    borderColor: '#a855f7'
  },
  orange: {
    main: '/templates/orange-main.png',
    content: '/templates/orange-content.png',
    textColor: '#ea580c',
    categoryBg: '#fed7aa',
    categoryText: '#c2410c',
    borderColor: '#f97316'
  },
  teal: {
    main: '/templates/teal-main.png',
    content: '/templates/teal-content.png',
    textColor: '#0d9488',
    categoryBg: '#a7f3d0',
    categoryText: '#047857',
    borderColor: '#14b8a6'
  }
};

export const POST_DIMENSIONS = {
  main: {
    width: 1080,
    height: 1080,
    title: {
      x: 60,
      y: 200,
      font: '48px Arial, sans-serif',
      maxWidth: 960
    },
    category: {
      x: 60,
      y: 60,
      font: '24px Arial, sans-serif'
    },
    image: {
      x: 60,
      y: 600,
      width: 960,
      height: 420,
      border: 3
    }
  },
  content: {
    width: 1080,
    height: 1080,
    image: {
      maxWidth: 960,
      maxHeight: 960,
      border: 3
    }
  }
};