import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  isDanger?: boolean;
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
  isDanger = true
}: ConfirmationDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay with dynamic fade-in */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            id="confirmation-dialog-backdrop"
          />

          {/* Dialog Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden z-10"
            id="confirmation-dialog-card"
          >
            {/* Elegant warm golden glowing top strip */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${isDanger ? 'bg-red-500' : 'bg-[#D4AF37]'}`} />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/5 cursor-pointer"
              aria-label="Close dialog"
              id="confirmation-dialog-close-btn"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Layout Header & Icon */}
            <div className="flex items-start gap-4 mt-2">
              <div className={`flex-shrink-0 p-3 rounded-xl ${isDanger ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white tracking-wide font-display uppercase" id="confirmation-dialog-title">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-white/60 leading-relaxed font-sans" id="confirmation-dialog-message">
                  {message}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/5 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all cursor-pointer"
                id="confirmation-dialog-cancel-btn"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await onConfirm();
                  } catch (err) {
                    console.error('Action failed:', err);
                  } finally {
                    onClose();
                  }
                }}
                className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer ${
                  isDanger
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20'
                    : 'bg-[#D4AF37] hover:bg-[#F3CF55] text-black shadow-yellow-900/20 font-bold'
                }`}
                id="confirmation-dialog-confirm-btn"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
