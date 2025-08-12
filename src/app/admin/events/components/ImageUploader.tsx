'use client';

import { useState, useId, useEffect } from 'react';
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
  // Menambahkan prop untuk mengirimkan URL yang berhasil diunggah ke parent component
  onUploadSuccess: (urls: { url: string }[]) => void;
}

export default function ImageUploader({ existingImages = [], onUploadSuccess }: ImageUploaderProps) {
  const fileInputId = useId();

  const [files, setFiles] = useState<FileUpload[]>(() =>
    existingImages.map((img, index) => ({
      key: `existing-${index}`,
      previewUrl: img.url,
      status: 'success',
      uploadedUrl: img.url,
    }))
  );

  // Gunakan useEffect untuk memanggil onUploadSuccess saat files berubah
  useEffect(() => {
    const successfulUrls = files
      .filter(f => f.status === 'success' && f.uploadedUrl)
      .map(f => ({ url: f.uploadedUrl! }));
    onUploadSuccess(successfulUrls);
  }, [files, onUploadSuccess]);


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

    // Validasi environment variables sebelum fetch
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!apiKey || !cloudName) {
        const errorMessage = "Konfigurasi Cloudinary tidak ditemukan.";
        console.error(errorMessage);
        setFiles(prev => prev.map(f => f.key === uploadingFile.key ? { ...f, status: 'error', error: errorMessage } : f));
        return;
    }

    try {
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

      const data = await response.json();

      if (response.ok) {
        const publicUrl = data.secure_url;
        setFiles(prev => prev.map(f => f.key === uploadingFile.key ? { ...f, status: 'success', uploadedUrl: publicUrl, file: undefined } : f));
      } else {
        throw new Error(data.error.message || 'Gagal mengunggah gambar.');
      }
    } catch (error) { // 'error' secara default bertipe 'unknown'
      // --- PERBAIKAN UTAMA DI SINI ---
      // Mengganti `error: any` dengan penanganan tipe `unknown` yang aman
      let errorMessage = 'Terjadi kesalahan tidak diketahui.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.error('Error uploading image to Cloudinary:', errorMessage);
      setFiles(prev => prev.map(f => f.key === uploadingFile.key ? { ...f, status: 'error', error: errorMessage } : f));
    }
  };

  const handleRemoveImage = (keyToRemove: string) => {
    // Hapus URL preview dari memori untuk mencegah memory leak
    const fileToRemove = files.find(f => f.key === keyToRemove);
    if (fileToRemove && fileToRemove.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    setFiles(prev => prev.filter(f => f.key !== keyToRemove));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Poster Event (Bisa lebih dari satu)
      </label>

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {files.map((upload) => (
            <div key={upload.key} className="relative group aspect-w-1 aspect-h-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
              <Image src={upload.previewUrl} alt={`Preview`} fill className="object-cover" />
              
              {/* Overlay untuk status */}
              <div 
                className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2 text-center transition-opacity opacity-0 data-[show=true]:opacity-100"
                data-show={upload.status === 'uploading' || upload.status === 'error' || upload.status === 'success'}
              >
                {upload.status === 'uploading' && <Loader2 className="w-8 h-8 text-white animate-spin" />}
                {upload.status === 'success' && <CheckCircle2 className="w-10 h-10 text-green-400" />}
                {upload.status === 'error' && (
                    <>
                        <AlertTriangle className="w-8 h-8 text-red-400 mb-1" />
                        <p className="text-xs text-white leading-tight">{upload.error}</p>
                    </>
                )}
              </div>

              {/* Tombol Hapus */}
              {upload.status !== 'uploading' && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(upload.key)}
                  className="absolute top-2 right-2 p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Hapus gambar"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Area Dropzone */}
      <label
        htmlFor={fileInputId}
        className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-900/25 dark:border-slate-50/25 px-6 py-10 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
      >
        <div className="text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-slate-400" aria-hidden="true" />
          <div className="mt-4 flex text-sm leading-6 text-slate-600 dark:text-slate-400">
            <span className="relative rounded-md font-semibold text-blue-600 dark:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500">
              Unggah file
            </span>
            <p className="pl-1">atau tarik dan lepas</p>
          </div>
          <p className="text-xs leading-5 text-slate-600 dark:text-slate-500">PNG, JPG, GIF hingga 10MB</p>
        </div>
        <input
          id={fileInputId}
          type="file"
          multiple
          accept="image/png, image/jpeg, image/gif"
          className="sr-only"
          onChange={handleFileChange}
        />
      </label>

      {/* Input tersembunyi tidak lagi diperlukan karena state di-handle oleh parent */}
    </div>
  );
}
