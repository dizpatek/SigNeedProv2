"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    FileText,
    Trash2,
    FileUp,
    CheckCircle2,
    Clock,
    Eye,
    ExternalLink,
    Search,
    Loader2,
    Share2,
    RotateCw,
    AlertOctagon,
    XCircle
} from "lucide-react";
import { uploadDocument, deleteDocument, requestDeletion, rejectDeletion } from "@/src/app/actions/documents";
import { cn } from "@/src/lib/utils";
import { ConfirmDialog } from "@/src/components/ConfirmDialog";
import { Toast } from "@/src/components/Toast";

interface Document {
    id: string;
    name: string;
    originalUrl: string;
    signedUrl: string | null;
    status: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    deletionRequested?: boolean;
}

interface DashboardStats {
    totalDocs: number;
    signedDocs: number;
    pendingDocs: number;
    deletionRequests: number;
}

interface DashboardClientProps {
    initialDocuments: Document[];
    viewMode?: "admin" | "tablet";
    stats?: DashboardStats;
}

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function DashboardClient({ initialDocuments, viewMode = "admin", stats }: DashboardClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Confirm Dialog State
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: "danger" | "warning" | "info";
    }>({ isOpen: false, title: "", message: "", onConfirm: () => { }, variant: "warning" });

    // Toast State
    const [toast, setToast] = useState<{
        isOpen: boolean;
        message: string;
        type?: "success" | "error" | "info";
    }>({ isOpen: false, message: "", type: "success" });
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [selectedShareDoc, setSelectedShareDoc] = useState<Document | null>(null);
    const [welcomeMessage, setWelcomeMessage] = useState("Lütfen imzalamak veya görüntülemek istediğiniz belgeyi seçiniz.");

    React.useEffect(() => {
        if (viewMode === "tablet") {
            fetch("/api/settings/public")
                .then(res => res.json())
                .then(data => {
                    if (data.clientWelcomeMessage) setWelcomeMessage(data.clientWelcomeMessage);
                })
                .catch(err => console.error("Ayarlar çekilemedi:", err));
        }
    }, [viewMode]);


    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        startTransition(async () => {
            await uploadDocument(formData);
        });
    };

    const handleShare = async (doc: Document) => {
        const shareUrl = `${window.location.origin}/view/${doc.id}`;
        const shareData = {
            title: 'SigNeed Belge Paylaşımı',
            text: `${doc.name} belgesini incelemeniz için paylaşıyorum.`,
            url: shareUrl,
        };

        // Try native share first
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {
                console.log("Native share cancelled or failed, falling back to modal");
            }
        }

        // Fallback to modal
        setSelectedShareDoc(doc);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Bağlantı kopyalandı!");
        setSelectedShareDoc(null);
    };

    const filteredDocs = initialDocuments.filter((doc) => {
        const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
        let matchesFilter = filter === "all" || doc.status.toLowerCase() === filter.toLowerCase();

        if (filter === "deletion_requested") {
            matchesFilter = !!doc.deletionRequested;
        }

        // 15 Dakika Kuralı (Tablet Modu İçin)
        if (viewMode === "tablet" && doc.status === "SIGNED") {
            const updatedAt = new Date(doc.updatedAt);
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000); // 15 dakika
            if (updatedAt < fifteenMinutesAgo) return false;
        }

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 relative">
            {/* Share Modal */}
            {selectedShareDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                        <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Paylaş</h3>
                            <button onClick={() => setSelectedShareDoc(null)} className="text-slate-400 hover:text-slate-600">
                                <span className="sr-only">Kapat</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="p-6 grid gap-3">
                            <p className="text-sm text-slate-500 mb-2">
                                <span className="font-medium text-slate-900 dark:text-white">{selectedShareDoc.name}</span> belgesini paylaşmak için bir yöntem seçin:
                            </p>

                            <button
                                onClick={() => {
                                    const url = `${window.location.origin}/view/${selectedShareDoc.id}`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(`Belgeyi inceleyin: ${url}`)}`, '_blank');
                                    setSelectedShareDoc(null);
                                }}
                                className="flex items-center gap-3 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                            >
                                <Share2 size={18} /> WhatsApp ile Gönder
                            </button>

                            <button
                                onClick={() => {
                                    const url = `${window.location.origin}/view/${selectedShareDoc.id}`;
                                    window.location.href = `mailto:?subject=${encodeURIComponent(selectedShareDoc.name)}&body=${encodeURIComponent(`Merhaba,\n\nBu belgeyi incelemeniz gerekiyor: ${url}`)}`;
                                    setSelectedShareDoc(null);
                                }}
                                className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition-transform hover:scale-[1.02] dark:bg-slate-800 dark:text-slate-200"
                            >
                                <ExternalLink size={18} /> E-posta Gönder
                            </button>

                            <button
                                onClick={() => copyToClipboard(`${window.location.origin}/view/${selectedShareDoc.id}`)}
                                className="flex items-center gap-3 rounded-xl border-2 border-slate-100 px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:border-sky-200 hover:bg-sky-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                                <FileText size={18} /> Bağlantıyı Kopyala
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header for Tablet Mode */}
            {viewMode === "tablet" && (
                <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 p-8 text-white shadow-xl flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Belge İmzalama Paneli</h1>
                        <p className="text-sky-100">{welcomeMessage}</p>
                    </div>
                    <button
                        onClick={() => {
                            // Basit bir refresh animasyonu için
                            const btn = document.getElementById('refresh-btn');
                            if (btn) btn.classList.add('animate-spin');
                            setTimeout(() => {
                                if (btn) btn.classList.remove('animate-spin');
                                router.refresh();
                            }, 500);
                        }}
                        className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-semibold text-white transition-all hover:bg-white/20 backdrop-blur-sm group"
                    >
                        <RotateCw id="refresh-btn" size={20} className="transition-transform" />
                        Yenile
                    </button>
                </div>
            )}

            {/* Stats Cards (Admin Only) */}
            {viewMode === "admin" && stats && (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div className="rounded-2xl border border-sky-100 bg-sky-50 p-6 dark:border-sky-900/30 dark:bg-sky-900/10">
                        <div className="flex items-center gap-3 text-sky-600 dark:text-sky-400">
                            <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-sky-950">
                                <FileText size={20} />
                            </div>
                            <span className="text-sm font-semibold">Toplam Belge</span>
                        </div>
                        <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{stats.totalDocs}</p>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                        <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                            <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-emerald-950">
                                <CheckCircle2 size={20} />
                            </div>
                            <span className="text-sm font-semibold">İmzalanan</span>
                        </div>
                        <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{stats.signedDocs}</p>
                    </div>

                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 dark:border-amber-900/30 dark:bg-amber-900/10">
                        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                            <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-amber-950">
                                <Clock size={20} />
                            </div>
                            <span className="text-sm font-semibold">Bekleyen</span>
                        </div>
                        <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{stats.pendingDocs}</p>
                    </div>

                    <div className="rounded-2xl border border-red-100 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-900/10">
                        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                            <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-red-950">
                                <AlertOctagon size={20} />
                            </div>
                            <span className="text-sm font-semibold">Silme İsteği</span>
                        </div>
                        <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{stats.deletionRequests}</p>
                    </div>
                </div>
            )}

            {/* Upload Zone - Only for Admin */}
            {viewMode === "admin" && (
                <label className="group relative block cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center transition-all hover:border-sky-500 hover:bg-sky-50/50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-sky-400 dark:hover:bg-sky-950/20">
                    <input type="file" className="hidden" accept=".pdf" onChange={handleUpload} disabled={isPending} />
                    <div className="flex flex-col items-center gap-4">
                        <div className={cn(
                            "flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-600 transition-transform dark:bg-sky-900/30 dark:text-sky-400",
                            isPending ? "animate-pulse" : "group-hover:scale-110"
                        )}>
                            {isPending ? <Loader2 className="animate-spin" size={32} /> : <FileUp size={32} />}
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                {isPending ? "Yükleniyor..." : "Yeni PDF Yükle"}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Dosyanızı buraya sürükleyin veya seçmek için tıklayın
                            </p>
                        </div>
                    </div>
                </label>
            )}

            {/* Deletion Requests Notification Bar (Admin Only) */}
            {viewMode === "admin" && initialDocuments.some(d => d.deletionRequested) && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/10">
                    <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
                        <AlertOctagon size={20} className="shrink-0" />
                        <div>
                            <p className="text-sm font-bold">Silme İstekleri Mevcut</p>
                            <p className="text-xs opacity-80">Bazı belgeler için tabletten silme isteği gönderildi. Onaylamak için aşağıdaki kırmızı işaretli belgeleri kalıcı olarak silebilirsiniz.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter & Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Belge ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-slate-800 dark:bg-slate-950"
                    />
                </div>
                <button
                    onClick={() => {
                        const btn = document.getElementById('refresh-list-btn');
                        if (btn) btn.classList.add('animate-spin');
                        setTimeout(() => {
                            if (btn) btn.classList.remove('animate-spin');
                            router.refresh();
                        }, 500);
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-sky-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400"
                    title="Listeyi Yenile"
                >
                    <RotateCw id="refresh-list-btn" size={18} />
                </button>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
                >
                    <option value="all">Tümü</option>
                    <option value="pending">Bekleyenler</option>
                    <option value="signed">İmzalananlar</option>
                    {viewMode === 'admin' && <option value="deletion_requested">Silme İstekleri</option>}
                </select>
            </div>

            {/* Document List */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
                        <tr>
                            <th className="px-6 py-4">Belge Adı</th>
                            <th className="px-6 py-4">Durum</th>
                            <th className="px-6 py-4">Tarih</th>
                            <th className="px-6 py-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredDocs.map((doc) => (
                            <tr key={doc.id} className={cn("group hover:bg-slate-50/50 dark:hover:bg-slate-900/30", doc.deletionRequested && "bg-red-50 dark:bg-red-900/10")}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900 dark:text-white">{doc.name}</div>
                                            <div className="text-xs text-slate-500">ID: {doc.id.slice(-6)}</div>
                                            {doc.deletionRequested && viewMode === 'admin' && (
                                                <span className="mt-1 inline-block rounded bg-red-100 px-1 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">SİLME TALEP EDİLDİ</span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {doc.status === "PENDING" ? (
                                        <div className="flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                            <Clock size={14} />
                                            Bekliyor
                                        </div>
                                    ) : (
                                        <div className="flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                            <CheckCircle2 size={14} />
                                            İmzalandı
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-slate-500">{formatDate(new Date(doc.createdAt))}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {viewMode === "admin" && (
                                            <>
                                                {doc.deletionRequested && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setConfirmDialog({
                                                                isOpen: true,
                                                                title: "Silme Talebini Reddet",
                                                                message: "Bu silme talebini reddetmek istediğinize emin misiniz? Belge normal durumuna geri dönecektir.",
                                                                variant: "info",
                                                                onConfirm: () => {
                                                                    startTransition(async () => {
                                                                        try {
                                                                            await rejectDeletion(doc.id);
                                                                            setToast({
                                                                                isOpen: true,
                                                                                message: "Silme talebi reddedildi",
                                                                                type: "success"
                                                                            });
                                                                        } catch (err) {
                                                                            setToast({
                                                                                isOpen: true,
                                                                                message: "Talep reddedilirken hata oluştu",
                                                                                type: "error"
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }}
                                                        disabled={isPending}
                                                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900/20 cursor-pointer relative z-20"
                                                        title="Talebi Reddet"
                                                    >
                                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle size={18} />}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setConfirmDialog({
                                                            isOpen: true,
                                                            title: "Belgeyi Sil",
                                                            message: "Bu belgeyi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
                                                            variant: "danger",
                                                            onConfirm: () => {
                                                                startTransition(async () => {
                                                                    try {
                                                                        await deleteDocument(doc.id);
                                                                        setToast({
                                                                            isOpen: true,
                                                                            message: "Belge başarıyla silindi",
                                                                            type: "success"
                                                                        });
                                                                    } catch (err) {
                                                                        setToast({
                                                                            isOpen: true,
                                                                            message: "Belge silinirken hata oluştu",
                                                                            type: "error"
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }}
                                                    disabled={isPending}
                                                    className={cn(
                                                        "transition-all p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20 cursor-pointer relative z-20",
                                                        doc.deletionRequested ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                                    )}
                                                    title="Sil"
                                                >
                                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={18} />}
                                                </button>
                                            </>
                                        )}

                                        {viewMode === "tablet" && (
                                            doc.deletionRequested ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setConfirmDialog({
                                                            isOpen: true,
                                                            title: "Talebi Geri Al",
                                                            message: "Gönderdiğiniz silme talebini geri çekmek istediğinize emin misiniz?",
                                                            variant: "info",
                                                            onConfirm: () => {
                                                                startTransition(async () => {
                                                                    try {
                                                                        await rejectDeletion(doc.id);
                                                                        setToast({
                                                                            isOpen: true,
                                                                            message: "Silme talebi geri çekildi",
                                                                            type: "success"
                                                                        });
                                                                    } catch (err) {
                                                                        setToast({
                                                                            isOpen: true,
                                                                            message: "Talep geri çekilirken hata oluştu",
                                                                            type: "error"
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }}
                                                    className="transition-all p-3 rounded-xl cursor-pointer relative z-20 bg-blue-50 text-blue-600 dark:bg-blue-950/20 opacity-100 shadow-sm hover:bg-blue-100"
                                                    title="Talebi Geri Al"
                                                >
                                                    <RotateCw size={24} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setConfirmDialog({
                                                            isOpen: true,
                                                            title: "Silme İsteği Gönder",
                                                            message: "Bu belgeyi listeden kaldırmak için yönetici onayı isteği göndermek üzeresiniz. Onaylıyor musunuz?",
                                                            variant: "warning",
                                                            onConfirm: () => {
                                                                startTransition(async () => {
                                                                    try {
                                                                        await requestDeletion(doc.id);
                                                                        setToast({
                                                                            isOpen: true,
                                                                            message: "Silme isteği yöneticiye iletildi",
                                                                            type: "success"
                                                                        });
                                                                    } catch (err) {
                                                                        setToast({
                                                                            isOpen: true,
                                                                            message: "Silme isteği gönderilirken hata oluştu",
                                                                            type: "error"
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }}
                                                    className="transition-all p-3 rounded-xl cursor-pointer relative z-20 bg-orange-50 text-orange-600 dark:bg-orange-950/20 opacity-100 shadow-sm hover:bg-orange-100"
                                                    title="Silme İsteği Gönder"
                                                >
                                                    <AlertOctagon size={24} />
                                                </button>
                                            )
                                        )}

                                        {doc.status === "PENDING" ? (
                                            <Link
                                                href={`/sign/${doc.id}${viewMode === 'tablet' ? '?source=tablet' : ''}`}
                                                className={cn(
                                                    "flex items-center gap-2 rounded-xl px-4 py-2 font-bold transition-all",
                                                    viewMode === "tablet"
                                                        ? "bg-sky-600 text-white shadow-lg shadow-sky-500/20 py-4 px-6 text-sm"
                                                        : "bg-sky-50 text-sky-600 px-4 py-2 text-xs hover:bg-sky-100 dark:bg-sky-900/20 dark:text-sky-400"
                                                )}
                                            >
                                                <FileText size={viewMode === "tablet" ? 20 : 16} />
                                                <span>İmzala</span>
                                            </Link>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {viewMode === "tablet" && (
                                                    <button
                                                        onClick={() => handleShare(doc)}
                                                        className="p-3 text-sky-600 bg-sky-50 dark:bg-sky-950/30 rounded-xl transition-colors"
                                                        title="Paylaş"
                                                    >
                                                        <Share2 size={24} />
                                                    </button>
                                                )}
                                                <Link
                                                    href={`/view/${doc.id}${viewMode === 'tablet' ? '?source=tablet' : ''}`}
                                                    className={cn(
                                                        "flex items-center gap-2 rounded-xl font-bold transition-all",
                                                        viewMode === "tablet"
                                                            ? "bg-slate-100 text-slate-700 py-4 px-6 text-sm dark:bg-slate-800 dark:text-slate-200"
                                                            : "border border-slate-200 px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400"
                                                    )}
                                                >
                                                    <Eye size={viewMode === "tablet" ? 20 : 14} />
                                                    <span>Görüntüle</span>
                                                </Link>
                                                {viewMode === "admin" && (
                                                    <a
                                                        href={doc.signedUrl || "#"}
                                                        download
                                                        className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                                        title="İndir"
                                                    >
                                                        <ExternalLink size={18} />
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredDocs.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    Belge bulunamadı.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                variant={confirmDialog.variant}
                confirmText="Onayla"
                cancelText="İptal"
            />

            {/* Toast Notification */}
            <Toast
                isOpen={toast.isOpen}
                onClose={() => setToast({ ...toast, isOpen: false })}
                message={toast.message}
                type={toast.type}
            />
        </div>
    );
}
