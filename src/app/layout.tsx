import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SigNeed | E-İmza Belge Yönetimi",
    description: "Modern ve güvenli elektronik imza platformu.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr" suppressHydrationWarning={true}>
            <body className={`${inter.className} min-h-screen antialiased`} suppressHydrationWarning={true}>
                <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-100 via-white to-white dark:from-sky-950 dark:via-slate-950 dark:to-slate-950" />
                <nav className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/70">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 font-bold text-white">
                                S
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                SigNeed
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="text-sm font-medium text-slate-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400">
                                Belgelerim
                            </button>
                            <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                                Yeni Yükle
                            </button>
                        </div>
                    </div>
                </nav>
                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {children}
                </main>
            </body>
        </html>
    );
}
