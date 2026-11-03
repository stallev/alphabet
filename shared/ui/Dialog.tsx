'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
} from 'react';

import { cn } from '@/shared/lib/cn';

import { IconButton } from './IconButton';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  closeOnBackdrop?: boolean;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  closeOnBackdrop = true,
  className,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) {
      return;
    }
    if (open) {
      lastFocusRef.current = document.activeElement as HTMLElement | null;
      if (!node.open) {
        node.showModal();
      }
      return;
    }
    if (node.open) {
      node.close();
    }
  }, [open]);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) {
      return;
    }
    const onCancel = (event: Event) => {
      event.preventDefault();
      handleClose();
    };
    node.addEventListener('cancel', onCancel);
    return () => node.removeEventListener('cancel', onCancel);
  }, [handleClose]);

  useEffect(() => {
    if (!open && lastFocusRef.current) {
      lastFocusRef.current.focus();
    }
  }, [open]);

  useEffect(
    () => () => {
      dialogRef.current?.close();
    },
    [],
  );

  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (!closeOnBackdrop) {
      return;
    }
    if (event.target === dialogRef.current) {
      handleClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={cn(
        'fixed inset-0 z-modal m-0 max-h-none max-w-none border-0 bg-transparent p-4 backdrop:bg-fg/40',
        className,
      )}
      onClick={onBackdropClick}
    >
      <AnimatePresence>
        {open ? (
          <motion.div
            key="panel"
            role="document"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.2 }}
            className="mx-auto flex w-full max-w-lg flex-col rounded-card border border-border bg-surface p-6 text-fg shadow-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 id={titleId} className="text-xl font-bold text-fg">
                {title}
              </h2>
              <IconButton aria-label="Close dialog" onClick={handleClose}>
                <X className="size-5" aria-hidden />
              </IconButton>
            </div>
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </dialog>
  );
}
