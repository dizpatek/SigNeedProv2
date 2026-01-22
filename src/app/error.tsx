'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Uygulama Hatası:', error);
    }, [error]);

    return (
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                <AlertCircle size={40} />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bir Şeyler Ters Gitti</h2>
                <p className="max-w-md text-slate-500 dark:text-slate-400">
                    Sunucu ile bağlantı kurulurken bir sorun oluştu. Bu durum genellikle veritabanı uyanırken yaşanabilen geçici bir durumdur.
                </p>
            </div>
            <button
                onClick={() => reset()}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
                <RotateCcw size={18} />
                Sayfayı Yeniden Yükle
            </button>
        </div>
    );
}
