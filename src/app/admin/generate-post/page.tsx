'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PostData, PostTemplate, PostCategory } from '@/types/event';
import { generatePostImages } from '@/lib/imageGenerator';
import ImageUploader from '../components/generate-post/ImageUploader';
import PostPreview from '../components/generate-post/PostPreview';
import TemplateSelector from '../components/generate-post/TemplateSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiLoader, FiAlertTriangle } from 'react-icons/fi';

const DEFAULT_CATEGORIES: PostCategory[] = [
  'Info Lomba',
  'Info Magang',
  'Info Workshop',
  'Info Seminar'
];

type PosterData = {
  url: string;
};

export default function GeneratePostPage() {
  const searchParams = useSearchParams();
  
  const [postData, setPostData] = useState<PostData>({
    title: '',
    category: '',
    images: [],
    template: 'blue'
  });
  const [generatedPosts, setGeneratedPosts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  const urlToFile = async (url: string, filename: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };
  
  useEffect(() => {
    const loadDataFromParams = async () => {
      const dataParam = searchParams.get('data');
      if (dataParam) {
        try {
          const eventData = JSON.parse(decodeURIComponent(dataParam));
          
          setPostData(prev => ({
            ...prev,
            title: eventData.title || '',
            category: eventData.category || ''
          }));

          if (eventData.images && Array.isArray(eventData.images) && eventData.images.length > 0) {
            setIsLoadingImages(true);
            try {
              const imageFiles = await Promise.all(
                eventData.images.map(async (poster: PosterData, index: number) => {
                  const filename = `poster-${index + 1}.jpg`;
                  return await urlToFile(poster.url, filename);
                })
              );
              
              setPostData(prev => ({
                ...prev,
                images: imageFiles
              }));
            } catch (imageError) {
              console.error('Error loading images:', imageError);
              setError('Failed to load some images from the event.');
            } finally {
              setIsLoadingImages(false);
            }
          }
        } catch (parseError) {
          console.error('Error parsing URL data:', parseError);
          setError('Invalid data in URL parameters.');
        }
      }
    };

    loadDataFromParams();
  }, [searchParams]);

  useEffect(() => {
    if (postData.title && postData.category && postData.images.length > 0) {
      setError(null);
    }
  }, [postData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPostData((prev: PostData) => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = (template: PostTemplate) => {
    setPostData((prev: PostData) => ({ ...prev, template }));
  };

  const handleCategoryChange = (category: PostCategory) => {
    setPostData((prev: PostData) => ({ ...prev, category }));
    setCustomCategory('');
  };

  const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomCategory(e.target.value);
    setPostData((prev: PostData) => ({ ...prev, category: e.target.value }));
  };

  const handleImagesChange = (files: File[]) => {
    setPostData((prev: PostData) => ({ ...prev, images: files }));
  };

  const handleRemoveImage = (index: number) => {
    setPostData((prev: PostData) => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const handleReorder = (oldIndex: number, newIndex: number) => {
    setPostData((prev: PostData) => {
      const newImages = [...prev.images];
      const [movedItem] = newImages.splice(oldIndex, 1);
      newImages.splice(newIndex, 0, movedItem);
      return { ...prev, images: newImages };
    });
  };

  const handleGenerate = async () => {
    if (!postData.title || !postData.category || postData.images.length === 0) {
      setError('Please fill all fields and upload at least one image.');
      return;
    }
    setError(null);

    setIsGenerating(true);
    setGeneratedPosts([]);
    try {
      const results = await generatePostImages(postData);
      setGeneratedPosts(results.map(post => post.url));
    } catch (error) {
      console.error('Error generating posts:', error);
      setError('Failed to generate posts. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `post-${postData.title.replace(/\s+/g, '_')}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    generatedPosts.forEach((url, index) => {
      handleDownload(url, index);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 p-4 md:p-6">
      <div className="max-w-8xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8"
        >
          Generate Instagram Post
        </motion.h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6 lg:sticky lg:top-6 h-fit border border-gray-200 dark:border-gray-700"
          >
             <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
              Post Details
            </h2>
            <div className="space-y-4">
              <motion.div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title <span className="text-gray-500 text-xs">(Use Shift+Enter)</span></label>
                <textarea name="title" value={postData.title} onChange={handleInputChange} className="w-full px-3 py-2 border text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500" rows={3} placeholder="Example: Lomba&#x0a;UI/UX Design" required />
              </motion.div>
              <motion.div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {DEFAULT_CATEGORIES.map((cat, index) => (
                    <motion.button key={cat} type="button" onClick={() => handleCategoryChange(cat)} className={`px-3 py-1 rounded-full text-xs md:text-sm transition-colors ${postData.category === cat && !customCategory ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>{cat}</motion.button>
                  ))}
                </div>
                <input type="text" value={customCategory} onChange={handleCustomCategoryChange} className="w-full px-3 py-2 border text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500" placeholder="Or enter a custom category" />
              </motion.div>
              <TemplateSelector selectedTemplate={postData.template} onTemplateChange={handleTemplateChange} />
              
              {isLoadingImages && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg"
                >
                  <FiLoader className="animate-spin" />
                  <span>Loading images from event...</span>
                </motion.div>
              )}
              
              <ImageUploader images={postData.images} onImagesChange={handleImagesChange} onRemoveImage={handleRemoveImage} onReorder={handleReorder} />
              
              <AnimatePresence>{error && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 p-2 bg-red-100 dark:bg-red-900/20 rounded-lg"><FiAlertTriangle /><span>{error}</span></motion.div>)}</AnimatePresence>
              <motion.button onClick={handleGenerate} disabled={isGenerating || isLoadingImages} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {isGenerating ? (<><FiLoader className="animate-spin" /> Generating...</>) : (<><FiDownload /> Generate Post</>)}
              </motion.button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                Preview
              </h2>
              <AnimatePresence>
                {generatedPosts.length > 0 && (
                  <motion.button onClick={handleDownloadAll} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-colors flex items-center gap-2 text-sm" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <FiDownload /> Download All
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500 dark:text-gray-400"><FiLoader className="animate-spin text-4xl mb-4" /><p>Generating your posts...</p></motion.div>
                ) : generatedPosts.length > 0 ? (
                  <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 md:space-y-6">
                    {generatedPosts.map((url, index) => (
                      <motion.div key={url} initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: index * 0.1, duration: 0.3 }}>
                        <PostPreview imageUrl={url} pageNumber={index + 1} onDownload={() => handleDownload(url, index)} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center h-full min-h-[400px] bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400 text-center px-4">{postData.images.length > 0 ? 'Click "Generate Post" to see your preview' : 'Fill in the details and upload images to begin'}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}