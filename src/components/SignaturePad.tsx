import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, Check, X } from "lucide-react";
import { useTheme } from "next-themes";

interface SignaturePadProps {
    onSave: (signatureDataUrl: string) => void;
    onClose: () => void;
}

export default function SignaturePad({ onSave, onClose }: SignaturePadProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const clear = () => {
        sigCanvas.current?.clear();
    };

    const save = () => {
        if (sigCanvas.current?.isEmpty()) {
            alert("Lütfen önce imzanızı çizin.");
            return;
        }

        // Get the trimmed canvas
        const canvas = sigCanvas.current?.getTrimmedCanvas();
        if (!canvas) return;

        // If we are in dark mode, we drew in white. 
        // We should convert white pixels to dark blue for the final PDF.
        if (resolvedTheme === "dark") {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Target color: #0f172a (RGB: 15, 23, 42)
                for (let i = 0; i < data.length; i += 4) {
                    // If the pixel is not fully transparent
                    if (data[i + 3] > 0) {
                        // If it's white (drawn in dark mode)
                        if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200) {
                            data[i] = 15;     // R
                            data[i + 1] = 23; // G
                            data[i + 2] = 42; // B
                        }
                    }
                }
                ctx.putImageData(imageData, 0, 0);
            }
        }

        const dataUrl = canvas.toDataURL("image/png");
        if (dataUrl) {
            onSave(dataUrl);
        }
    };

    const penColor = mounted && resolvedTheme === "dark" ? "#ffffff" : "#0f172a";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">İmzanızı Çizin</h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="relative rounded-xl border-2 border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                        <SignatureCanvas
                            ref={sigCanvas}
                            penColor={penColor}
                            canvasProps={{
                                className: "signature-canvas w-full h-64 cursor-crosshair",
                            }}
                        />
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-slate-300 dark:text-slate-700 pointer-events-none">
                            İmza Alanı
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 bg-slate-50 px-6 py-4 dark:bg-slate-900/50">
                    <button
                        onClick={clear}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                        <Eraser size={16} />
                        Temizle
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            Vazgeç
                        </button>
                        <button
                            onClick={save}
                            className="flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-sky-700 shadow-lg shadow-sky-500/20"
                        >
                            <Check size={16} />
                            İmzayı Kaydet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
