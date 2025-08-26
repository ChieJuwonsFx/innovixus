'use client';

import { useState, useId, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Loader2, CheckCircle2, AlertTriangle, ImageIcon } from 'lucide-react';
import { generateUploadSignature } from '../../events/cloudinary.action';

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

type FileUpload = {
  key: string;
  file?: File;
  previewUrl: string;
  status: UploadStatus;
  uploadedUrl?: string;
  error?: string;
  progress?: number;
};

interface ImageUploaderProps {
  existingImages?: { url: string; id?: string }[];
  onUploadSuccess: (urls: { url: string }[]) => void;
}

export default function ImageUploader({ existingImages = [], onUploadSuccess }: ImageUploaderProps) {
  const fileInputId = useId();
  const dragCounter = useRef(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [files, setFiles] = useState<FileUpload[]>(() =>
    existingImages.map((img, index) => ({
      key: img.id ? `existing-${img.id}` : `existing-${index}`,
      previewUrl: img.url,
      status: 'success',
      uploadedUrl: img.url,
    }))
  );

  const successfulUrls = useMemo(() => {
    return files
      .filter(f => f.status === 'success' && f.uploadedUrl)
      .map(f => ({ url: f.uploadedUrl! }));
  }, [files]);

  useEffect(() => {
    onUploadSuccess(successfulUrls);
  }, [onUploadSuccess, successfulUrls]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    handleFiles(event.target.files);
    event.target.value = '';
  };

  const handleFiles = (fileList: FileList) => {
    const validFiles = Array.from(fileList).filter(file => {
      const isValid = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValid && isValidSize;
    });

    const newUploadingFiles: FileUpload[] = validFiles.map(file => ({
      key: `${file.name}-${file.lastModified}-${Date.now()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
    }));

    setFiles(prev => [...prev, ...newUploadingFiles]);
    newUploadingFiles.forEach(uploadFile);
  };

  const uploadFile = async (uploadingFile: FileUpload) => {
    if (!uploadingFile.file) return;

    setFiles(prev => prev.map(f => 
      f.key === uploadingFile.key 
        ? { ...f, status: 'uploading', progress: 0 } 
        : f
    ));

    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!apiKey || !cloudName) {
      const errorMessage = "Konfigurasi Cloudinary tidak ditemukan.";
      setFiles(prev => prev.map(f => 
        f.key === uploadingFile.key 
          ? { ...f, status: 'error', error: errorMessage } 
          : f
      ));
      return;
    }

    try {
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.key === uploadingFile.key && f.progress !== undefined
            ? { ...f, progress: Math.min(f.progress + Math.random() * 20, 85) }
            : f
        ));
      }, 200);

      const { timestamp, signature } = await generateUploadSignature('event-posters');

      const formData = new FormData();
      formData.append('file', uploadingFile.file);
      formData.append('api_key', apiKey);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());
      formData.append('folder', 'event-posters');

      const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      
      const data = await response.json();

      if (response.ok) {
        setFiles(prev => prev.map(f => 
          f.key === uploadingFile.key 
            ? { 
                ...f, 
                status: 'success', 
                uploadedUrl: data.secure_url, 
                file: undefined,
                progress: 100 
              } 
            : f
        ));
        
        URL.revokeObjectURL(uploadingFile.previewUrl);
        
      } else {
        throw new Error(data.error?.message || 'Gagal mengunggah gambar.');
      }
    } catch (error) {
      let errorMessage = 'Terjadi kesalahan tidak diketahui.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setFiles(prev => prev.map(f => 
        f.key === uploadingFile.key 
          ? { ...f, status: 'error', error: errorMessage, progress: 0 } 
          : f
      ));
    }
  };

  const handleRemoveImage = (keyToRemove: string) => {
    const fileToRemove = files.find(f => f.key === keyToRemove);
    if (fileToRemove && fileToRemove.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    
    setFiles(prev => prev.filter(f => f.key !== keyToRemove));
  };

  const closePreview = () => {
    setSelectedImage(null);
  };

  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [files]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300">
          Poster Event <span className="text-red-500">*</span>
        </label>
        {files.length > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {files.length} gambar
          </span>
        )}
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {files.map((upload) => (
            <div key={upload.key} className="relative group bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="aspect-square relative">
                <Image 
                  src={upload.previewUrl} 
                  alt="Preview gambar event" 
                  fill 
                  className="object-cover transition-transform group-hover:scale-105" 
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  priority={upload.status === 'success'}
                />
                
                {upload.status !== 'success' && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 text-center">
                    {upload.status === 'uploading' && (
                      <div className="flex flex-col items-center space-y-3">
                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                        <div className="text-sm text-white font-medium">
                          {upload.progress ? `${Math.round(upload.progress)}%` : 'Uploading...'}
                        </div>
                        {upload.progress && (
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${upload.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {upload.status === 'error' && (
                      <div className="flex flex-col items-center space-y-3">
                        <AlertTriangle className="w-10 h-10 text-red-400" />
                        <p className="text-sm text-white leading-tight max-w-full break-words">
                          {upload.error || 'Upload gagal'}
                        </p>
                        <button
                          type="button"
                          onClick={() => uploadFile(upload)}
                          className="text-sm text-blue-300 hover:text-blue-200 underline font-medium"
                        >
                          Coba lagi
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {upload.status === 'success' && (
                  <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CheckCircle2 className="w-6 h-6 text-green-500 bg-green-100 rounded-full" />
                  </div>
                )}
              </div>

              <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {upload.status !== 'uploading' && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(upload.key)}
                    className="p-2 bg-red-600/90 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                    title="Hapus gambar"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs font-medium truncate">
                  {upload.file?.name || 'Uploaded image'}
                </p>
                <p className="text-xs text-gray-300">
                  {upload.file && `${(upload.file.size / 1024 / 1024).toFixed(1)} MB`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02] shadow-lg'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <label
          htmlFor={fileInputId}
          className="flex flex-col items-center justify-center px-8 py-8 cursor-pointer group"
        >
          <div className={`mb-3 p-5 rounded-full transition-all duration-300 ${
            isDragOver 
              ? 'bg-blue-500 text-white shadow-xl scale-110' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-500 group-hover:scale-110'
          }`}>
            {isDragOver ? (
              <ImageIcon className="w-12 h-12" />
            ) : (
              <UploadCloud className="w-12 h-12" />
            )}
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {isDragOver ? 'Lepaskan file di sini' : 'Upload poster event'}
            </div>
            <div className="text-md text-gray-600 dark:text-gray-400 mb-2">
              <span className="font-semibold text-blue-600 dark:text-blue-400">Klik untuk browse</span>
              {!isDragOver && ' atau drag & drop file'}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Format: PNG, JPG, GIF • Maksimal: 10MB • Multiple files
            </p>
          </div>
          
          <input
            id={fileInputId}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={closePreview}
        >
          <div className="relative max-w-6xl max-h-full">
            <button
              onClick={closePreview}
              className="absolute -top-16 right-0 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3"
              title="Tutup preview"
            >
              <X size={24} />
            </button>
            <div className="relative">
              <Image
                src={selectedImage}
                alt="Preview gambar"
                width={1200}
                height={800}
                className="object-contain max-h-[85vh] rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {files.some(f => f.status === 'uploading') && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Mengupload {files.filter(f => f.status === 'uploading').length} gambar...
              </p>
              <div className="mt-2 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${Math.round(
                      files.filter(f => f.status === 'uploading')
                           .reduce((acc, f) => acc + (f.progress || 0), 0) / 
                      Math.max(files.filter(f => f.status === 'uploading').length, 1)
                    )}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {files.some(f => f.status === 'error') && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                {files.filter(f => f.status === 'error').length} gambar gagal diupload
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Klik tombol Coba Lagi pada gambar yang gagal
              </p>
            </div>
          </div>
        </div>
      )}

      {files.some(f => f.status === 'success') && files.every(f => f.status !== 'uploading') && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              {files.filter(f => f.status === 'success').length} gambar berhasil diupload
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
