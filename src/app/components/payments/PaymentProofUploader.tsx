'use client';

import { useState, useId, useRef, useEffect } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Loader2, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { generateUploadSignature } from '../../../lib/cloudinary.action';

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

interface PaymentProofUploaderProps {
  onUploadSuccess: (url: string) => void;
}

export default function PaymentProofUploader({ onUploadSuccess }: PaymentProofUploaderProps) {
  const fileInputId = useId();
  const dragCounter = useRef(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<FileUpload | null>(null);

  useEffect(() => {
    if (file?.status === 'success' && file.uploadedUrl) {
      onUploadSuccess(file.uploadedUrl);
    }
  }, [file, onUploadSuccess]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    handleFiles(event.target.files);
    event.target.value = '';
  };

  const handleFiles = (fileList: FileList) => {
    const f = fileList[0];
    if (!f) return;

    const isValid = f.type.startsWith('image/') || f.type === 'application/pdf';
    const isValidSize = f.size <= 10 * 1024 * 1024; // 10MB
    if (!isValid || !isValidSize) {
      setFile({
        key: f.name,
        file: f,
        previewUrl: '',
        status: 'error',
        error: 'Format tidak valid atau ukuran file terlalu besar (max 10MB)',
      });
      return;
    }

    const newFile: FileUpload = {
      key: `${f.name}-${f.lastModified}-${Date.now()}`,
      file: f,
      previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : '',
      status: 'pending',
      progress: 0,
    };

    setFile(newFile);
    uploadFile(newFile);
  };

  const uploadFile = async (uploadingFile: FileUpload) => {
    if (!uploadingFile.file) return;

    setFile({ ...uploadingFile, status: 'uploading', progress: 0 });

    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!apiKey || !cloudName) {
      setFile({ ...uploadingFile, status: 'error', error: 'Konfigurasi Cloudinary tidak ditemukan.' });
      return;
    }

    try {
      const { timestamp, signature } = await generateUploadSignature('payment-proofs');

      const formData = new FormData();
      formData.append('file', uploadingFile.file);
      formData.append('api_key', apiKey);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());
      formData.append('folder', 'payment-proofs');

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setFile({
          ...uploadingFile,
          status: 'success',
          uploadedUrl: data.secure_url,
          previewUrl: uploadingFile.previewUrl || data.secure_url, // Keep preview
          file: undefined,
          progress: 100,
        });
      } else {
        throw new Error(data.error?.message || 'Gagal mengunggah bukti bayar.');
      }
    } catch (error) {
      setFile({
        ...uploadingFile,
        status: 'error',
        error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.',
      });
    }
  };

  const handleRemoveFile = () => {
    if (file?.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(file.previewUrl);
    }
    setFile(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className="space-y-4">
      
      {file ? (
        <div className={`relative rounded-xl overflow-hidden shadow-sm border ${
          file.status === 'error' 
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
            : file.status === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
        }`}>
          <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 relative">
            {file.previewUrl ? (
              <Image 
                src={file.previewUrl} 
                alt="Preview bukti bayar" 
                fill
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileText className="w-20 h-20 text-slate-400 dark:text-slate-500" />
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate mb-2">
                  {file.file?.name || 'Bukti pembayaran'}
                </p>
                
                {file.status === 'uploading' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Mengunggah...
                      </span>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                        {file.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {file.status === 'error' && (
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-600 dark:text-red-400">{file.error}</p>
                  </div>
                )}
                
                {file.status === 'success' && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Upload berhasil
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {file.status === 'uploading' && (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                )}
                
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors"
                  title="Hapus file"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${
            isDragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <label
            htmlFor={fileInputId}
            className="flex flex-col items-center justify-center px-8 py-16 cursor-pointer group"
          >
            <div className={`mb-4 p-4 rounded-full transition-all duration-300 ${
              isDragOver 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 scale-110' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-105'
            }`}>
              <UploadCloud className="w-10 h-10" />
            </div>
            
            <div className="text-center">
              <p className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                {isDragOver ? 'Lepaskan file di sini' : 'Klik atau drag & drop'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                PNG, JPG, PDF • Maksimal 10MB
              </p>
            </div>
            
            <input
              id={fileInputId}
              type="file"
              accept="image/*,application/pdf"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}
    </div>
  );
}