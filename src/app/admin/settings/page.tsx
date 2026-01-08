
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Lock, Tablet, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    // Form States
    const [password, setPassword] = useState("");
    const [clientWelcomeMessage, setClientWelcomeMessage] = useState("");

    useEffect(() => {
        // Mevcut ayarları çek
        fetch("/api/settings")
            .then(res => res.json())
            .then(data => {
                if (data.clientWelcomeMessage) setClientWelcomeMessage(data.clientWelcomeMessage);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    password,
                    clientWelcomeMessage
                }),
            });

            if (!res.ok) throw new Error("Kaydedilemedi");

            setMessage("Ayarlar başarıyla kaydedildi!");
            setPassword(""); // Şifre alanını temizle

        } catch (error) {
            setMessage("Hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-sky-600" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="mx-auto max-w-2xl px-4 py-12">
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Ayarları</h1>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Admin Password */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800 flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/20">
                                <Lock size={18} />
                            </div>
                            <h2 className="font-semibold text-slate-900 dark:text-white">Yönetici Şifresi</h2>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Yeni Şifre
                            </label>
                            <input
                                type="password"
                                placeholder="Değiştirmek istemiyorsanız boş bırakın"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-slate-800 dark:bg-slate-950"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <p className="mt-2 text-xs text-slate-500">
                                Güvenliğiniz için karmaşık bir şifre kullanmanızı öneririz.
                            </p>
                        </div>
                    </div>

                    {/* Tablet Settings */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800 flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20">
                                <Tablet size={18} />
                            </div>
                            <h2 className="font-semibold text-slate-900 dark:text-white">Tablet (Client) Ayarları</h2>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Karşılama Mesajı
                            </label>
                            <textarea
                                rows={3}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
                                value={clientWelcomeMessage}
                                onChange={(e) => setClientWelcomeMessage(e.target.value)}
                            />
                            <p className="mt-2 text-xs text-slate-500">
                                Tablet ekranının en üstünde görünen mesaj.
                            </p>
                        </div>
                    </div>

                    {message && (
                        <div className="rounded-xl bg-emerald-50 p-4 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
                            {message}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3 font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-70 dark:bg-white dark:text-slate-900"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Ayarları Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
