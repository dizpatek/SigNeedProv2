"use client";

import React, { useState, useTransition } from "react";
import { FileUp, FileText, Search, Clock, CheckCircle2, Trash2, Loader2, ExternalLink } from "lucide-react";
import { uploadDocument, deleteDocument } from "@/src/app/actions/documents";
import { cn, formatDate, formatBytes } from "@/src/lib/utils";
import Link from "next/link";

interface Document {
    id: string;
    name: string;
    originalUrl: string;
    signedUrl: string | null;
    status: string;
    createdAt: Date;
}

export default function DashboardClient({ initialDocuments }: { initialDocuments: any[] }) {
    const [isPending, startTransition] = useTransition();
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        startTransition(async () => {
            await uploadDocument(formData);
        });
    };

    const filteredDocs = initialDocuments.filter((doc) => {
        const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" || doc.status.toLowerCase() === filter.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8">
            {/* Upload Zone */}
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
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
                >
                    <option value="all">Tümü</option>
                    <option value="pending">Bekleyenler</option>
                    <option value="signed">İmzalananlar</option>
                </select>
            </div>

            {/* Document List */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
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
                            <tr key={doc.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900 dark:text-white">{doc.name}</div>
                                            <div className="text-xs text-slate-500">Belge ID: {doc.id.slice(-6)}</div>
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
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => startTransition(() => deleteDocument(doc.id))}
                                            className="opacity-0 transition-opacity group-hover:opacity-100 text-slate-400 hover:text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        {doc.status === "PENDING" ? (
                                            <Link
                                                href={`/sign/${doc.id}`}
                                                className="rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-sky-700 hover:shadow-lg hover:shadow-sky-500/20"
                                            >
                                                İmzala
                                            </Link>
                                        ) : (
                                            <a
                                                href={doc.signedUrl ? encodeURI(doc.signedUrl) : "#"}
                                                download
                                                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400"
                                            >
                                                <ExternalLink size={14} />
                                                İndir
                                            </a>
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
        </div>
    );
}
