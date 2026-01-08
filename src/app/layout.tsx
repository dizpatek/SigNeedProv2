import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/src/components/Navbar";
import { ThemeProvider } from "@/src/components/ThemeProvider";
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
            <body className={`${inter.className} min-h-screen antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`} suppressHydrationWarning={true}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-100 via-white to-white dark:from-sky-950 dark:via-slate-950 dark:to-slate-950" />
                    <Navbar />
                    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        {children}
                    </main>
                </ThemeProvider>
            </body>
        </html>
    );
}
