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
      className={`flex items-center p-2 rounded-md mb-2 ${
        isMain 
          ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border border-gray-200 dark:border-gray-700'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div 
        className="p-1 mr-2 cursor-grab hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-gray-500" />
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
      
      <div className="flex-grow truncate text-sm text-gray-700 dark:text-gray-300">
        {isMain && (
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded mr-2">
            Main
          </span>
        )}
        {file.name}
      </div>
      
      <button
        onClick={() => onRemove(index)}
        className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 ml-2"
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
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Upload Images (First image will be used on cover)
      </label>
      
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 transition-colors mb-4"
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Drag & drop images here, or click to select
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
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