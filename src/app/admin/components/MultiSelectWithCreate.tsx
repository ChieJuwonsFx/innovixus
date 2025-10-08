'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { ChevronDown, Loader2, Plus } from 'lucide-react';

interface Item {
  id: string;
  name: string;
}

interface MultiSelectWithCreateProps<T extends Item> {
  items: T[];
  selectedItems: Set<string>;
  onSelectionChange: (itemId: string) => void;
  createAction: (formData: FormData) => Promise<{ success: boolean; message?: string; data?: T }>;
  onItemAdded: (newItem: T) => void;
  placeholder: string;
  itemName: string; 
  additionalFormData?: Record<string, string>;
}

export default function MultiSelectWithCreate<T extends Item>({
  items,
  selectedItems,
  onSelectionChange,
  createAction,
  onItemAdded,
  placeholder,
  itemName,
  additionalFormData,
}: MultiSelectWithCreateProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [error, setError] = useState('');
  const [isAdding, startAdding] = useTransition();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNewItemName(name);
    const isDuplicate = items.some(item => item.name.trim().toLowerCase() === name.trim().toLowerCase());
    setError(isDuplicate ? `Nama ${itemName} ini sudah ada.` : '');
  };

  const handleAddItem = () => {
    if (error || !newItemName.trim() || isAdding) return;

    const formData = new FormData();
    formData.append('name', newItemName.trim());
    if (additionalFormData) {
      Object.entries(additionalFormData).forEach(([key, value]) => formData.append(key, value));
    }

    startAdding(async () => {
      const result = await createAction(formData);
      if (result.success && result.data) {
        onItemAdded(result.data);
        onSelectionChange(result.data.id);
        setNewItemName('');
        setError('');
      } else {
        setError(result.message || `Gagal menambah ${itemName}.`);
      }
    });
  };

  const selectedItemsText = items
    .filter(item => selectedItems.has(item.id))
    .map(item => item.name)
    .join(', ');

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors px-4 py-3 text-base text-left flex justify-between items-center"
      >
        <span className={`truncate ${selectedItemsText ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
          {selectedItemsText || placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-80 flex flex-col">
          <ul className="overflow-y-auto p-2">
            {items.map(item => (
              <li key={item.id}>
                <label className="flex items-center group cursor-pointer p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => onSelectionChange(item.id)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-700 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-focus:ring-2 peer-focus:ring-offset-2 dark:peer-focus:ring-offset-gray-800 peer-focus:ring-blue-500 transition-all duration-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  </div>
                  <span className="ml-4 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {item.name}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <div className="p-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-start space-x-3">
              <div className="flex-grow">
                <input
                  ref={inputRef}
                  type="text"
                  value={newItemName}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                  placeholder={`Tambah ${itemName} baru...`}
                  className="block w-full text-base rounded-lg shadow-sm transition-colors bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5"
                />
                {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                disabled={isAdding || !!error || !newItemName.trim()}
                className="inline-flex items-center justify-center p-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

