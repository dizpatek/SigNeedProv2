"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { Settings, LogOut } from "lucide-react";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isTabletMode = pathname?.startsWith("/tablet") || searchParams.get("source") === "tablet";

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Çıkış yapılamadı", error);
        }
    };

    return (
        <nav className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/70">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href={isTabletMode ? "/tablet" : "/"} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 font-bold text-white">
                        S
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        SigNeed
                    </span>
                    {isTabletMode && (
                        <span className="hidden sm:inline-block ml-2 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                            Tablet
                        </span>
                    )}
                </Link>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {!isTabletMode && pathname !== "/login" && (
                        <>
                            <Link
                                href="/admin/settings"
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                            >
                                <Settings size={18} />
                                <span className="hidden sm:inline">Ayarlar</span>
                            </Link>
                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline">Çıkış</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
