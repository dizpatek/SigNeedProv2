import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-slate-200 dark:border-slate-800" />
                <div className="absolute top-0 h-16 w-16 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
            </div>
            <div className="flex flex-col items-center gap-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Veriler Yükleniyor</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Lütfen bekleyin, veritabanı bağlantısı kuruluyor...</p>
            </div>
        </div>
    );
}
