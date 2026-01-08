"use client";

import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Onayla",
    cancelText = "İptal",
    variant = "warning"
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-start gap-4 p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                        variant === "danger" && "bg-red-100 dark:bg-red-900/20 text-red-600",
                        variant === "warning" && "bg-orange-100 dark:bg-orange-900/20 text-orange-600",
                        variant === "info" && "bg-blue-100 dark:bg-blue-900/20 text-blue-600"
                    )}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={cn(
                            "flex-1 px-4 py-3 text-sm font-bold text-white rounded-xl transition-all shadow-lg",
                            variant === "danger" && "bg-red-600 hover:bg-red-700 shadow-red-500/20",
                            variant === "warning" && "bg-orange-600 hover:bg-orange-700 shadow-orange-500/20",
                            variant === "info" && "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                        )}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
