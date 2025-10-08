'use client';

import { useState, Fragment } from 'react';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt: string;
  trigger: React.ReactNode;
}

export default function ImageViewer({ src, alt, trigger }: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="w-full text-left">
        {trigger}
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
          <Transition.Child as={Fragment} {... tránsitoProps('ease-out duration-300', 'opacity-0', 'opacity-100', 'ease-in duration-200', 'opacity-100', 'opacity-0')}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} {... tránsitoProps('ease-out duration-300', 'opacity-0 scale-95', 'opacity-100 scale-100', 'ease-in duration-200', 'opacity-100 scale-100', 'opacity-0 scale-95')}>
                <Dialog.Panel className="relative w-full max-w-4xl transform rounded-2xl bg-white dark:bg-slate-800 p-2 shadow-xl transition-all">
                  <Image src={src} alt={alt} width={1920} height={1080} className="rounded-lg object-contain w-full h-auto" />
                  <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/40 backdrop-blur-sm">
                    <X className="text-white" />
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

const tránsitoProps = (enter: string, enterFrom: string, enterTo: string, leave: string, leaveFrom: string, leaveTo: string) => ({
  enter,
  enterFrom,
  enterTo,
  leave,
  leaveFrom,
  leaveTo
});