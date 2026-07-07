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
import { Sparkles, LayoutGrid, Image as ImageIcon, Wand2 } from 'lucide-react';

const DEFAULT_CATEGORIES: PostCategory[] = [
  'Info Lomba',
  'Info Magang',
  'Info Loker',
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
  const [isPosting, setIsPosting] = useState(false);
  const [postResult, setPostResult] = useState<string | null>(null);

  const handlePostToInstagram = async () => {
    if (!generatedPosts.length || !postData.title) return;
    setIsPosting(true);
    setPostResult(null);
    try {
      const res = await fetch('/api/instagram/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrls: generatedPosts, caption: postData.title }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setPostResult('Berhasil dipost ke Instagram!');
    } catch (e) {
      setPostResult('Gagal: ' + (e instanceof Error ? e.message : 'Unknown'));
    } finally {
      setIsPosting(false);
    }
  };

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
    <div className="min-h-screen px-4 py-5 dark:bg-slate-950 dark:bg-none md:px-6 md:py-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 md:p-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-[#003366]" />
                Generate Post
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                Generate Instagram Post
              </h1>
              <p className="max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Buat poster feed yang rapi dari data event, pilih template, susun urutan gambar, lalu unduh hasilnya.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
              {[
                { icon: LayoutGrid, label: 'Template' },
                { icon: ImageIcon, label: 'Images' },
                { icon: Sparkles, label: 'Ready Export' }
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                  <Icon className="h-4 w-4 text-[#003366]" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:sticky lg:top-24 h-fit rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:p-6"
          >
             <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
               <div>
                 <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white md:text-xl">
                   Post Details
                 </h2>
                 <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                   Isi data inti, pilih template, lalu generate.
                 </p>
               </div>
               <div className="hidden rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:block">
                 1080 × 1350
               </div>
             </div>
            <div className="space-y-5">
              <motion.div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Title <span className="text-slate-500 text-xs">(Shift+Enter for line break)</span></label>
                <textarea name="title" value={postData.title} onChange={handleInputChange} className="min-h-[112px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500" rows={4} placeholder="Example: Lomba UI/UX Design" required />
              </motion.div>
              <motion.div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                <div className="mb-3 flex flex-wrap gap-2">
                  {DEFAULT_CATEGORIES.map((cat, index) => (
                    <motion.button key={cat} type="button" onClick={() => handleCategoryChange(cat)} className={`rounded-full px-3 py-1.5 text-xs md:text-sm transition-colors ${postData.category === cat && !customCategory ? 'bg-[#003366] text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'}`} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>{cat}</motion.button>
                  ))}
                </div>
                <input type="text" value={customCategory} onChange={handleCustomCategoryChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500" placeholder="Or enter a custom category" />
              </motion.div>
              <TemplateSelector selectedTemplate={postData.template} onTemplateChange={handleTemplateChange} />
              
              {isLoadingImages && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#003366] dark:border-slate-800 dark:bg-slate-950"
                >
                  <FiLoader className="animate-spin" />
                  <span>Loading images from event...</span>
                </motion.div>
              )}
              
              <ImageUploader images={postData.images} onImagesChange={handleImagesChange} onRemoveImage={handleRemoveImage} onReorder={handleReorder} />
              
              <AnimatePresence>{error && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"><FiAlertTriangle /><span>{error}</span></motion.div>)}</AnimatePresence>
              <motion.button onClick={handleGenerate} disabled={isGenerating || isLoadingImages} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#003366] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#00284d] disabled:cursor-not-allowed disabled:opacity-50" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                {isGenerating ? (<><FiLoader className="animate-spin" /> Generating...</>) : (<><FiDownload /> Generate Post</>)}
              </motion.button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex min-h-[680px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95"
          >
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 p-4 md:p-6 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white md:text-xl">
                  Preview
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Hasil export akan tampil di sini setelah generate.
                </p>
              </div>
              <AnimatePresence>
                {generatedPosts.length > 0 && (
                  <div className="flex gap-2">
                    <motion.button onClick={handleDownloadAll} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <FiDownload /> Download All
                    </motion.button>
                    <motion.button onClick={handlePostToInstagram} disabled={isPosting} className="inline-flex items-center gap-2 rounded-full bg-[#003366] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00284d] disabled:opacity-50" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      {isPosting ? <FiLoader className="animate-spin" /> : <Wand2 className="h-4 w-4" />}
                      {isPosting ? 'Posting...' : 'Post ke Instagram'}
                    </motion.button>
                  </div>
                )}
                {postResult && (
                  <p className={`mt-2 text-xs ${postResult.startsWith('Berhasil') ? 'text-green-600' : 'text-red-600'}`}>
                    {postResult}
                  </p>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[420px] flex-col items-center justify-center text-slate-500 dark:text-slate-400"><FiLoader className="mb-4 animate-spin text-4xl text-[#003366]" /><p>Generating your posts...</p></motion.div>
                ) : generatedPosts.length > 0 ? (
                  <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 md:space-y-6">
                    {generatedPosts.map((url, index) => (
                      <motion.div key={url} initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: index * 0.1, duration: 0.3 }}>
                        <PostPreview imageUrl={url} pageNumber={index + 1} onDownload={() => handleDownload(url, index)} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="max-w-sm text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#003366] shadow-sm dark:bg-slate-900">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{postData.images.length > 0 ? 'Click "Generate Post" to preview the result.' : 'Fill in the details and upload images to begin.'}</p>
                    </div>
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