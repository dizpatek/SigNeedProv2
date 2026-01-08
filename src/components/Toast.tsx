"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    type?: "success" | "error" | "info";
    duration?: number;
}

export function Toast({ isOpen, onClose, message, type = "success", duration = 3000 }: ToastProps) {
    useEffect(() => {
        if (isOpen && duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
            <div className={`
                flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm
                ${type === "success" ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800" : ""}
                ${type === "error" ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" : ""}
                ${type === "info" ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800" : ""}
            `}>
                <CheckCircle2
                    size={20}
                    className={`
                        ${type === "success" ? "text-emerald-600" : ""}
                        ${type === "error" ? "text-red-600" : ""}
                        ${type === "info" ? "text-blue-600" : ""}
                    `}
                />
                <p className={`
                    text-sm font-medium
                    ${type === "success" ? "text-emerald-900 dark:text-emerald-100" : ""}
                    ${type === "error" ? "text-red-900 dark:text-red-100" : ""}
                    ${type === "info" ? "text-blue-900 dark:text-blue-100" : ""}
                `}>
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
