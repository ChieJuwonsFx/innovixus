'use client';

import { useState, useId, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { UploadCloud, X, ImageIcon, CheckCircle2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type FilePreview = {
  key: string;
  file: File;
  previewUrl: string;
};

type ExistingPreview = {
  key: string;
  url: string;
};

type CombinedPreview = {
  key: string;
  url: string;
  file?: File;
  isExisting: boolean;
};

export interface ImageUploaderProps {
  existingImages?: { url: string; id?: string }[];
  onFilesChange: (files: File[]) => void;
  onExistingImagesChange?: (images: { url: string; id?: string }[]) => void;
}

function SortableImageItem({ 
  preview, 
  onRemove, 
  onClick 
}: { 
  preview: CombinedPreview; 
  onRemove: (key: string) => void;
  onClick: (key: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: preview.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 ${
        isDragging ? 'z-50 scale-105 cursor-grabbing' : 'cursor-grab'
      }`}
    >
      <div className="aspect-square relative">
        <Image 
          src={preview.url} 
          alt="Preview gambar event" 
          fill 
          className="object-cover transition-transform group-hover:scale-105 cursor-pointer" 
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onClick={() => onClick(preview.key)}
          unoptimized
        />
        
        <div 
          {...attributes} 
          {...listeners}
          className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-gray-800/90 rounded-lg p-2 cursor-grab active:cursor-grabbing shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </div>
        {preview.isExisting ? (
          <div className="absolute top-3 right-14 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Saved</span>
          </div>
        ) : (
          <div className="absolute top-3 right-14 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            Baru
          </div>
        )}
      </div>
      <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(preview.key);
          }}
          className="p-2 bg-red-600/90 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
          title="Hapus gambar"
        >
          <X size={16} />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs font-medium truncate">
          {preview.file?.name || 'Uploaded image'}
        </p>
        {preview.file && (
          <p className="text-xs text-gray-300">
            {(preview.file.size / 1024 / 1024).toFixed(1)} MB
          </p>
        )}
      </div>
    </div>
  );
}

export default function ImageUploader({ 
  existingImages = [], 
  onFilesChange,
  onExistingImagesChange,
}: ImageUploaderProps) {
  const fileInputId = useId();
  const dragCounter = useRef(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedImageKey, setSelectedImageKey] = useState<string | null>(null);

  const [existingPreviews, setExistingPreviews] = useState<ExistingPreview[]>(() =>
    existingImages.map((img, index) => ({
      key: img.id ? `existing-${img.id}` : `existing-${index}`,
      url: img.url,
    }))
  );

  const [newFiles, setNewFiles] = useState<FilePreview[]>([]);

  const combinedPreviews: CombinedPreview[] = [
    ...existingPreviews.map(p => ({ ...p, isExisting: true })),
    ...newFiles.map(p => ({ key: p.key, url: p.previewUrl, file: p.file, isExisting: false })),
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = combinedPreviews.findIndex(p => p.key === active.id);
      const newIndex = combinedPreviews.findIndex(p => p.key === over.id);
      const reordered = arrayMove(combinedPreviews, oldIndex, newIndex);

      const newExisting: ExistingPreview[] = [];
      const newFilesList: FilePreview[] = [];

      reordered.forEach(item => {
        if (item.isExisting) {
          newExisting.push({ key: item.key, url: item.url });
        } else if (item.file) {
          const original = newFiles.find(f => f.key === item.key);
          if (original) newFilesList.push(original);
        }
      });

      setExistingPreviews(newExisting);
      setNewFiles(newFilesList);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const validFiles = Array.from(fileList).filter(file => {
      const isValid = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024;
      if (!isValid) alert(`File ${file.name} bukan gambar yang valid`);
      else if (!isValidSize) alert(`File ${file.name} terlalu besar (maksimal 10MB)`);
      return isValid && isValidSize;
    });

    const newPreviews: FilePreview[] = validFiles.map(file => ({
      key: `${file.name}-${file.lastModified}-${Date.now()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setNewFiles(prev => [...prev, ...newPreviews]);
  };

  const handleRemove = (keyToRemove: string) => {
    const isExisting = existingPreviews.some(p => p.key === keyToRemove);
    if (isExisting) {
      const updated = existingPreviews.filter(f => f.key !== keyToRemove);
      setExistingPreviews(updated);
      if (onExistingImagesChange)
        onExistingImagesChange(updated.map(({ url }) => ({ url })));
    } else {
      const fileToRemove = newFiles.find(f => f.key === keyToRemove);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.previewUrl);
      setNewFiles(prev => prev.filter(f => f.key !== keyToRemove));
    }
  };

  const closePreview = () => setSelectedImageKey(null);

  const notifyParent = useCallback(() => {
    onFilesChange(newFiles.map(f => f.file));
  }, [newFiles, onFilesChange]);

  useEffect(() => {
    notifyParent();
  }, [notifyParent]);

  useEffect(() => {
    if (onExistingImagesChange)
      onExistingImagesChange(existingPreviews.map(({ url }) => ({ url })));
  }, [existingPreviews, onExistingImagesChange]);

  useEffect(() => {
    return () => newFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
  }, [newFiles]);

  const selectedImage = combinedPreviews.find(p => p.key === selectedImageKey)?.url || null;
  const totalImages = combinedPreviews.length;

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300">
          Poster Event <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          {totalImages > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {totalImages} gambar
            </span>
          )}
          {totalImages > 1 && (
            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full flex items-center gap-1">
              <GripVertical className="w-3 h-3" />
              Drag untuk urutkan
            </span>
          )}
        </div>
      </div>

      {totalImages > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={combinedPreviews.map(p => p.key)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {combinedPreviews.map(preview => (
                <SortableImageItem
                  key={preview.key}
                  preview={preview}
                  onRemove={handleRemove}
                  onClick={setSelectedImageKey}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
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
          <div
            className={`mb-3 p-5 rounded-full transition-all duration-300 ${
              isDragOver
                ? 'bg-blue-500 text-white shadow-xl scale-110'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-500 group-hover:scale-110'
            }`}
          >
            {isDragOver ? <ImageIcon className="w-12 h-12" /> : <UploadCloud className="w-12 h-12" />}
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
              Format: PNG, JPG, WEBP • Maksimal: 10MB • Multiple files
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
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3 z-10"
              title="Tutup preview"
            >
              <X size={24} />
            </button>
            <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
              <Image
                src={selectedImage}
                alt="Preview gambar"
                fill
                className="object-contain rounded-lg"
                unoptimized
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
