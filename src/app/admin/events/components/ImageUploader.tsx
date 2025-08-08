'use client';

import { useState, useId } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { generateUploadSignature } from '../cloudinary.actions';

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

type FileUpload = {
  key: string;
  file?: File;
  previewUrl: string;
  status: UploadStatus;
  uploadedUrl?: string;
  error?: string;
};

interface ImageUploaderProps {
  existingImages?: { url: string }[];
}

export default function ImageUploader({ existingImages = [] }: ImageUploaderProps) {
  const fileInputId = useId();

  const [files, setFiles] = useState<FileUpload[]>(() =>
    existingImages.map((img, index) => ({
      key: `existing-${index}`,
      previewUrl: img.url,
      status: 'success',
      uploadedUrl: img.url,
    }))
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const newFiles = Array.from(event.target.files);
    const newUploadingFiles: FileUpload[] = newFiles.map(file => ({
      key: `${file.name}-${file.lastModified}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
    }));
    setFiles(prev => [...prev, ...newUploadingFiles]);
    newUploadingFiles.forEach(uploadFile);
  };

  const uploadFile = async (uploadingFile: FileUpload) => {
    if (!uploadingFile.file) return;

    setFiles(prev => prev.map(f => f.key === uploadingFile.key ? { ...f, status: 'uploading' } : f));

    try {
      const { timestamp, signature } = await generateUploadSignature('event-posters');

      const formData = new FormData();
      formData.append('file', uploadingFile.file);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());
      formData.append('folder', 'event-posters');

      const endpoint = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const publicUrl = data.secure_url;
        setFiles(prev => prev.map(f => f.key === uploadingFile.key ? { ...f, status: 'success', uploadedUrl: publicUrl } : f));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error.message);
      }
    } catch (error: any) {
      console.error('Error uploading image to Cloudinary:', error.message);
      setFiles(prev => prev.map(f => f.key === uploadingFile.key ? { ...f, status: 'error', error: error.message } : f));
    }
  };

  const handleRemoveImage = (keyToRemove: string) => {
    setFiles(prev => prev.filter(f => f.key !== keyToRemove));
  };

  const successfulUrls = files
    .filter(f => f.status === 'success' && f.uploadedUrl)
    .map(f => ({ url: f.uploadedUrl! }));

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Poster Event (Bisa lebih dari satu)
      </label>

      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {files.map((upload) => (
            <div key={upload.key} className="relative group aspect-w-1 aspect-h-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <Image src={upload.previewUrl} alt={`Preview`} fill className="object-cover rounded-lg" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg transition-opacity opacity-0 group-hover:opacity-100 data-[status=uploading]:opacity-100 data-[status=error]:opacity-100"
                data-status={upload.status}>
                {upload.status === 'uploading' && <Loader2 className="w-8 h-8 text-white animate-spin" />}
                {upload.status === 'success' && <CheckCircle2 className="w-8 h-8 text-green-400" />}
                {upload.status === 'error' && <AlertTriangle className="w-8 h-8 text-red-400" />}
              </div>
              {upload.status !== 'uploading' && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(upload.key)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Hapus gambar"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-900/25 dark:border-slate-50/25 px-6 py-10">
        <div className="text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-slate-400" aria-hidden="true" />
          <div className="mt-4 flex text-sm leading-6 text-slate-600 dark:text-slate-400">
            <label
              htmlFor={fileInputId}
              className="relative cursor-pointer rounded-md font-semibold text-blue-600 dark:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
            >
              <span>Unggah file</span>
              <input
                id={fileInputId}
                type="file"
                multiple
                accept="image/png, image/jpeg, image/gif"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>
            <p className="pl-1">atau tarik dan lepas</p>
          </div>
          <p className="text-xs leading-5 text-slate-600 dark:text-slate-500">PNG, JPG, GIF hingga 10MB</p>
        </div>
      </div>

      <input
        type="hidden"
        name="poster_json"
        value={JSON.stringify(successfulUrls)}
      />
    </div>
  );
}