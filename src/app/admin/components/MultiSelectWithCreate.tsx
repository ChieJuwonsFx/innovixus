'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Loader2, Plus, Search } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [error, setError] = useState('');
  const [isAdding, startAdding] = useTransition();
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
      
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleScroll() {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    }

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
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

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedItemsText = items
    .filter(item => selectedItems.has(item.id))
    .map(item => item.name)
    .join(', ');

  const dropdownContent = isOpen ? (
    <div 
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        zIndex: 9999
      }}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl max-h-96 flex flex-col"
    >
      <div className="p-3 border-b border-slate-200 dark:border-slate-600">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari ${itemName}...`}
            className="block w-full pl-10 pr-4 py-2.5 text-base rounded-lg shadow-sm transition-colors bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <ul className="overflow-y-auto p-2 flex-1">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <li key={item.id}>
              <label className="flex items-center group cursor-pointer p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => onSelectionChange(item.id)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-500 rounded-md bg-white dark:bg-slate-700 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-focus:ring-2 peer-focus:ring-offset-2 dark:peer-focus:ring-offset-slate-800 peer-focus:ring-blue-500 transition-all duration-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </div>
                <span className="ml-4 text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {item.name}
                </span>
              </label>
            </li>
          ))
        ) : (
          <li className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
            Tidak ada {itemName} yang ditemukan
          </li>
        )}
      </ul>

      <div className="p-3 border-t border-slate-200 dark:border-slate-600">
        <div className="flex items-start space-x-3">
          <div className="flex-grow">
            <input
              ref={addInputRef}
              type="text"
              value={newItemName}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
              placeholder={`Tambah ${itemName} baru...`}
              className="block w-full text-base rounded-lg shadow-sm transition-colors bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5"
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
  ) : null;

  return (
    <div className="relative w-full">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors px-4 py-3 text-base text-left flex justify-between items-center"
      >
        <span className={`truncate ${selectedItemsText ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
          {selectedItemsText || placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  );
}