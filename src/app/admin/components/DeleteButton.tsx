'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react'; 
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';

type ActionResponse = void | { error: string } | undefined;

export default function DeleteButton({ action, itemLabel }: { action: () => Promise<ActionResponse>, itemLabel: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); 

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const handleDelete = async () => {
    setIsLoading(true);
    closeModal();
    await action();
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Hapus
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100 flex items-center gap-2"
                  >
                    <AlertTriangle className="text-red-500" />
                    Konfirmasi Penghapusan
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Apakah Anda yakin ingin menghapus <strong>{itemLabel}</strong>? Tindakan ini tidak dapat diurungkan.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-slate-100 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none"
                      onClick={closeModal}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      className="inline-flex justify-center items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none disabled:bg-red-400"
                      onClick={handleDelete}
                    >
                      {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                      Ya, Hapus
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}