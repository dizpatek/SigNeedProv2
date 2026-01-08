"use client";

import React, { useState } from "react";
import { Viewer, Worker, RenderPageProps } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { ChevronLeft, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as pdfjsLib from "pdfjs-dist";

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface ViewClientProps {
    document: any;
}

export default function ViewClient({ document }: ViewClientProps) {
    const searchParams = useSearchParams();
    const source = searchParams.get("source");
    const backLink = source === "tablet" ? "/tablet" : "/";

    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    React.useEffect(() => {
        let currentUrl: string | null = null;

        const fetchPdf = async () => {
            try {
                // Determine file name based on signedUrl or originalUrl
                // If the document is signed, we usually want to view the signed version unless specified otherwise.
                // Assuming 'signedUrl' is like /uploads/signed-...pdf
                // We need to fetch it differently. Since signedUrl is just a static file path, we can try fetching it directly
                // BUT, to be consistent with our base64 route used in SignClient, let's see.

                // If it's a signed URL, it's directly accessible in public/uploads usually.
                // But let's check how the API route handles it. The API route expects a filename.

                const targetUrl = document.signedUrl || document.originalUrl;
                const fileName = targetUrl.split('/').pop();

                if (!fileName) throw new Error("Dosya adı bulunamadı");

                const response = await fetch(`/api/pdf-base64/${fileName}`);
                if (!response.ok) throw new Error(`Sunucu hatası: ${response.status}`);

                const data = await response.json();
                if (!data.base64) throw new Error("PDF verisi alınamadı");

                const byteCharacters = atob(data.base64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });

                currentUrl = URL.createObjectURL(blob);
                setBlobUrl(currentUrl);
                setLoadError(null);
            } catch (error: any) {
                console.error('PDF Fetch Error:', error);
                setLoadError(error.message || "PDF yüklenirken teknik bir hata oluştu.");
            }
        };

        fetchPdf();

        return () => {
            if (currentUrl) URL.revokeObjectURL(currentUrl);
        };
    }, [document]);

    return (
        <div className="flex h-[calc(100vh-10rem)] flex-col gap-6">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={backLink}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                        >
                            <ChevronLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {document.name}
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                    Salt Okunur Mod
                                </span>
                                <div className="h-1 w-1 rounded-full bg-slate-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 gap-6 overflow-hidden">
                    <div className="relative flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-inner dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="h-full overflow-auto p-8">
                            {blobUrl ? (
                                <div className="mx-auto max-w-4xl shadow-2xl relative">
                                    <Viewer
                                        fileUrl={blobUrl}
                                        plugins={[defaultLayoutPluginInstance]}
                                    />
                                </div>
                            ) : loadError ? (
                                <div className="flex h-full items-center justify-center p-12 text-center">
                                    <div className="flex flex-col items-center gap-4 max-w-md">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                                            <AlertCircle size={32} />
                                        </div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">PDF Yüklenemedi</h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{loadError}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="h-12 w-12 animate-spin text-sky-500" />
                                        <p className="text-slate-500 font-medium">Belge yükleniyor...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Worker>
        </div>
    );
}
