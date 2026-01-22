"use client";

import React, { useState } from "react";
import { Viewer, Worker, RenderPageProps } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { ChevronLeft, Share2, Download, MousePointer2, Type, Calendar, Check, Loader2, AlertCircle, ExternalLink, Users } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SignaturePad from "./SignaturePad";
import { signDocument } from "@/src/app/actions/documents";
import { cn } from "@/src/lib/utils";
import * as pdfjsLib from "pdfjs-dist";

// Set worker path for scanning logic
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface SignClientProps {
    document: any;
}

export default function SignClient({ document }: SignClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const source = searchParams.get("source");
    const backLink = source === "tablet" ? "/tablet" : "/";
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const [showSigPad, setShowSigPad] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [boxes, setBoxes] = useState<any[]>([]);
    const [isMounted, setIsMounted] = React.useState(false);
    const [activeZone, setActiveZone] = useState<any | null>(null);
    const [batchSignTarget, setBatchSignTarget] = useState<'left' | 'right' | null>(null);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedShareUrl, setSelectedShareUrl] = useState<string | null>(null);

    React.useEffect(() => {
        setIsMounted(true);

        let currentUrl: string | null = null;

        const fetchPdf = async () => {
            try {
                // Extract filename from /uploads/filename.pdf
                const fileName = document.originalUrl.split('/').pop();
                if (!fileName) throw new Error("Dosya adı bulunamadı");

                const response = await fetch(`/api/files/${fileName}`);
                if (!response.ok) throw new Error(`Sunucu hatası: ${response.status}`);

                const blob = await response.blob();

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
    }, [document.originalUrl]);

    // Handle automated detection when blobUrl is ready
    React.useEffect(() => {
        if (!blobUrl) return;

        const scanPdf = async () => {
            try {
                const loadingTask = pdfjsLib.getDocument(blobUrl);
                const pdf = await loadingTask.promise;
                const numPages = pdf.numPages;
                const allZones: any[] = [];

                for (let i = 1; i <= numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const viewport = page.getViewport({ scale: 1 });

                    // Group items by Y coordinate with more tolerance
                    const lines: { [key: number]: any[] } = {};
                    textContent.items.forEach((item: any) => {
                        const [, , , , x, y] = item.transform;
                        const roundedY = Math.round(y);

                        let targetY = roundedY;
                        const existingY = Object.keys(lines).find(k => Math.abs(parseFloat(k) - roundedY) < 5);
                        if (existingY) targetY = parseFloat(existingY);

                        if (!lines[targetY]) lines[targetY] = [];
                        lines[targetY].push(item);
                    });

                    // Sort items in each line by X coordinate and check for the tag(s)
                    Object.keys(lines).forEach(yKey => {
                        const lineItems = lines[parseFloat(yKey)].sort((a, b) => a.transform[4] - b.transform[4]);
                        const fullLineText = lineItems.map(item => item.str).join('');

                        // Find all occurrences of $SIGN in the line
                        const regex = /\$SIGN/g;
                        let match;
                        while ((match = regex.exec(fullLineText)) !== null) {
                            const matchIndex = match.index;

                            // Find which item corresponds to this match index
                            let currentTotalLen = 0;
                            let startItem = lineItems[0];
                            for (const item of lineItems) {
                                const itemLen = (item.str || "").length;
                                if (currentTotalLen <= matchIndex && matchIndex < currentTotalLen + itemLen) {
                                    startItem = item;
                                    break;
                                }
                                currentTotalLen += itemLen;
                            }

                            const [, , , scaleY, x, y] = startItem.transform;

                            // Calculate percentages based on the unscaled viewport
                            const xPct = (x / viewport.width) * 100;
                            // PDF Y is from bottom. Converted to top-down CSS:
                            const yPct = ((viewport.height - y) / viewport.height) * 100;

                            allZones.push({
                                id: Math.random(),
                                pageIndex: i - 1,
                                x: xPct,
                                y: yPct,
                                width: 150,
                                height: 50,
                                data: null
                            });
                        }
                    });
                }
                setBoxes(allZones);
            } catch (error) {
                console.error("Scanning error:", error);
            }
        };

        scanPdf();
    }, [blobUrl]);

    const handleBatchSignClick = (target: 'left' | 'right') => {
        setBatchSignTarget(target);
        setActiveZone(null);
        setShowSigPad(true);
    };

    const handleZoneClick = (zoneId: number) => {
        const zone = boxes.find(b => b.id === zoneId);
        if (zone) {
            setActiveZone(zone);
            setBatchSignTarget(null);
            setShowSigPad(true);
        }
    };

    const onSaveSignature = (dataUrl: string) => {
        if (activeZone) {
            setBoxes(boxes.map(b => b.id === activeZone.id ? { ...b, data: dataUrl } : b));
            setActiveZone(null);
        } else if (batchSignTarget) {
            setBoxes(boxes.map(b => {
                const isTarget = batchSignTarget === 'left' ? b.x < 50 : b.x >= 50;
                if (isTarget) {
                    return { ...b, data: dataUrl };
                }
                return b;
            }));
            setBatchSignTarget(null);
        }
        setShowSigPad(false);
    };

    const renderPage = (props: RenderPageProps) => {
        return (
            <>
                {props.canvasLayer.children}
                {props.textLayer.children}
                {props.annotationLayer.children}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ zIndex: 10 }}
                >
                    {boxes.filter(box => box.pageIndex === props.pageIndex).map(box => (
                        <div
                            key={box.id}
                            onClick={() => !box.data && handleZoneClick(box.id)}
                            className={cn(
                                "absolute cursor-pointer rounded border-2 transition-all pointer-events-auto shadow-lg",
                                box.data
                                    ? "border-sky-400 bg-white/90"
                                    : "border-emerald-400 bg-emerald-400/20 hover:bg-emerald-400/40 animate-pulse"
                            )}
                            style={{
                                left: `${box.x}%`,
                                top: `${box.y}%`,
                                width: '150px',
                                height: '50px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transform: 'translate(0, 0)' // Remove offset to align exactly top-left
                            }}
                        >
                            {box.data ? (
                                <>
                                    <img src={box.data} alt="Signature" className="h-full w-full object-contain p-1" />
                                    <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm">
                                        <Check size={10} />
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Check size={14} className="text-emerald-600 mb-0.5" />
                                    <span className="text-[10px] font-bold text-emerald-700 uppercase leading-none">İmza Alanı</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </>
        );
    };

    if (!isMounted) return null;

    const saveChanges = async (): Promise<boolean> => {
        const signedBoxes = boxes.filter(b => b.data);
        if (signedBoxes.length === 0) {
            // Hiç imza yoksa da devam edebiliriz (belki sadece görüntülemek için paylaşıyordur)
            // Ama orijinal koda sadık kalıp uyarı verelim veya hiç imza yoksa direkt orijinali paylaşalım.
            // Kullanıcı mantığı: "İmzalama ekranında paylaş diyorsa, şu anki halini paylaşmak istiyordur."
            // Eğer imza yoksa, orijinal hali geçerlidir.
            return true;
        }

        try {
            const signatures = signedBoxes.map(box => ({
                dataUrl: box.data,
                x: box.x,
                y: box.y,
                pageIndex: box.pageIndex
            }));

            await signDocument(document.id, signatures);
            return true;
        } catch (error) {
            console.error(error);
            alert("Kaydetme sırasında bir hata oluştu.");
            return false;
        }
    };

    const handleFinalize = async () => {
        const signedBoxes = boxes.filter(b => b.data);
        if (signedBoxes.length === 0) {
            alert("Lütfen en az bir imza ekleyin.");
            return;
        }

        setIsFinalizing(true);
        const success = await saveChanges();

        if (success) {
            // Navigate back - revalidatePath on server will handle cache
            router.push(backLink);
            router.refresh();
        } else {
            setIsFinalizing(false);
        }
    };

    const handleShare = async () => {
        setIsFinalizing(true); // Loading göstergesi için
        const success = await saveChanges();
        setIsFinalizing(false);

        if (success) {
            const url = `${window.location.origin}/view/${document.id}`;
            setSelectedShareUrl(url);

            // Try native share
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'SigNeed Belge Paylaşımı',
                        text: `${document.name} belgesini incelemeniz için paylaşıyorum.`,
                        url: url,
                    });
                    setSelectedShareUrl(null); // Native share başarılıysa modalı açma/kapat
                } catch (err) {
                    console.log("Native share failed, modal is open");
                }
            }
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Bağlantı kopyalandı!");
        setSelectedShareUrl(null);
    };

    return (
        <div className="flex h-[calc(100vh-10rem)] flex-col gap-6 relative">
            {/* Share Modal */}
            {selectedShareUrl && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-800 animate-in fade-in zoom-in duration-200">
                        <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Paylaş</h3>
                            <button onClick={() => setSelectedShareUrl(null)} className="text-slate-400 hover:text-slate-600">
                                <span className="sr-only">Kapat</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="p-6 grid gap-3">
                            <p className="text-sm text-slate-500 mb-2">
                                <span className="font-medium text-slate-900 dark:text-white">{document.name}</span> belgesini paylaşmak için bir yöntem seçin:
                            </p>

                            <button
                                onClick={() => {
                                    window.open(`https://wa.me/?text=${encodeURIComponent(`Belgeyi inceleyin: ${selectedShareUrl}`)}`, '_blank');
                                    setSelectedShareUrl(null);
                                }}
                                className="flex items-center gap-3 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                            >
                                <Share2 size={18} /> WhatsApp ile Gönder
                            </button>

                            <button
                                onClick={() => {
                                    window.location.href = `mailto:?subject=${encodeURIComponent(document.name)}&body=${encodeURIComponent(`Merhaba,\n\nBu belgeyi incelemeniz gerekiyor: ${selectedShareUrl}`)}`;
                                    setSelectedShareUrl(null);
                                }}
                                className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition-transform hover:scale-[1.02] dark:bg-slate-800 dark:text-slate-200"
                            >
                                <ExternalLink size={18} /> E-posta Gönder
                            </button>

                            <button
                                onClick={() => copyToClipboard(selectedShareUrl)}
                                className="flex items-center gap-3 rounded-xl border-2 border-slate-100 px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:border-sky-200 hover:bg-sky-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                                <MousePointer2 size={18} /> Bağlantıyı Kopyala
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                    Belge Düzenleme Modu
                                </span>
                                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleShare}
                            disabled={isFinalizing}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 disabled:opacity-50"
                        >
                            {isFinalizing ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
                            Paylaş
                        </button>
                        <button
                            className="group flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-2 text-sm font-semibold text-white transition-all enabled:hover:bg-sky-700 shadow-lg shadow-sky-500/20 disabled:opacity-50"
                            onClick={handleFinalize}
                            disabled={isFinalizing}
                        >
                            {isFinalizing ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Download size={16} className="transition-transform group-hover:-translate-y-0.5" />
                            )}
                            {isFinalizing ? "İmzalanıyor..." : "Kesinleştir ve Bitir"}
                        </button>
                    </div>
                </div>

                {/* Control Panels - Top on Mobile/Tablet (Compact Mode) */}
                <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1">
                    <button
                        onClick={() => handleBatchSignClick('left')}
                        className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                        <Users size={14} className="text-sky-600" />
                        1. Kişi (Sol)
                    </button>
                    <button
                        onClick={() => handleBatchSignClick('right')}
                        className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                        <Users size={14} className="text-indigo-600" />
                        2. Kişi (Sağ)
                    </button>

                    <div className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {boxes.length} İmza Alanı
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-1 gap-6 overflow-hidden">
                    <div className="relative flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-inner dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="h-full overflow-auto p-4 lg:p-8">
                            {blobUrl ? (
                                <div className="mx-auto w-full lg:max-w-4xl shadow-2xl relative">
                                    <Viewer
                                        fileUrl={blobUrl}
                                        plugins={[defaultLayoutPluginInstance]}
                                        renderPage={renderPage}
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
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="mt-2 rounded-xl bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800"
                                        >
                                            Yeniden Dene
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="h-12 w-12 animate-spin text-sky-500" />
                                        <p className="text-slate-500 font-medium">Belge hazırlanıyor...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Control Panels - Right Side on Desktop */}
                    <div className="hidden lg:block w-80 space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                                Toplu İmzalama
                            </h3>
                            <div className="grid gap-2">
                                <button
                                    onClick={() => handleBatchSignClick('left')}
                                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 font-medium text-slate-700 transition-all hover:border-sky-200 hover:bg-sky-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-sky-900 dark:hover:bg-sky-950/30"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800">
                                        <Users size={18} className="text-sky-600" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-semibold">1. Kişi (Sol)</div>
                                        <div className="text-xs text-slate-400">Tüm sol alanları imzala</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleBatchSignClick('right')}
                                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 font-medium text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/30"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800">
                                        <Users size={18} className="text-indigo-600" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-semibold">2. Kişi (Sağ)</div>
                                        <div className="text-xs text-slate-400">Tüm sağ alanları imzala</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 dark:border-emerald-900/10 dark:bg-emerald-950/20">
                            <div className="mb-3 flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-400">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Otomatik Tespit
                            </div>
                            <p className="text-xs leading-relaxed text-emerald-800/70 dark:text-emerald-400/60">
                                Bekleyen <b>{boxes.length}</b> imza alanı tespit edildi. Toplu imza ile veya kutucuklara tıklayarak imzalayabilirsiniz.
                            </p>
                        </div>
                    </div>
                </div>

                {showSigPad && (
                    <SignaturePad
                        onSave={onSaveSignature}
                        onClose={() => setShowSigPad(false)}
                    />
                )}
            </Worker>
        </div>
    );
}
