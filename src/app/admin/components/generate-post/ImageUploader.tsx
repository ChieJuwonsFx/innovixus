'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Image from 'next/image';

function SortableImage({ file, index, onRemove, isMain }: { 
  file: File, 
  index: number, 
  onRemove: (index: number) => void,
  isMain: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };

  const [preview, setPreview] = useState<string | null>(null);

  const reader = new FileReader();
  reader.onload = () => setPreview(reader.result as string);
  reader.readAsDataURL(file);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-2 flex items-center rounded-2xl border p-2.5 transition-colors ${
        isMain 
          ? 'border-[#003366] bg-slate-50 dark:bg-slate-950' 
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
      } ${isDragging ? 'shadow-sm' : ''}`}
    >
      <div 
        className="mr-2 cursor-grab rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-slate-400" />
      </div>
      
      {preview && (
        <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden mr-3 relative">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      
      <div className="flex-grow truncate text-sm text-slate-700 dark:text-slate-300">
        {isMain && (
          <span className="mr-2 rounded-full bg-[#003366] px-2 py-1 text-xs text-white">
            Main
          </span>
        )}
        {file.name}
      </div>
      
      <button
        onClick={() => onRemove(index)}
        className="ml-2 rounded-lg p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-300"
        title="Remove"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
}

export default function ImageUploader({
  images,
  onImagesChange,
  onRemoveImage,
  onReorder,
}: ImageUploaderProps) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    onDrop: acceptedFiles => {
      onImagesChange([...images, ...acceptedFiles]);
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      onReorder(active.id as number, over?.id as number);
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Upload Images (First image will be used on cover)
      </label>
      
      <div
        {...getRootProps()}
        className="mb-4 cursor-pointer rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-6 text-center transition-colors hover:border-[#003366] hover:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:hover:bg-slate-900"
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-2 h-10 w-10 text-[#003366]" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Drag & drop images here, or click to select
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
          Recommended: 1080x1350px (PNG or JPG)
        </p>
      </div>
      
      {images.length > 0 && (
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={images.map((_, index) => index)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {images.map((file, index) => (
                <SortableImage
                  key={index}
                  file={file}
                  index={index}
                  onRemove={onRemoveImage}
                  isMain={index === 0}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}