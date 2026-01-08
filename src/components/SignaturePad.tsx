"use client";

import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, Check, X } from "lucide-react";

interface SignaturePadProps {
    onSave: (signatureDataUrl: string) => void;
    onClose: () => void;
}

export default function SignaturePad({ onSave, onClose }: SignaturePadProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);

    const clear = () => {
        sigCanvas.current?.clear();
    };

    const save = () => {
        if (sigCanvas.current?.isEmpty()) {
            alert("Lütfen önce imzanızı çizin.");
            return;
        }
        const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
        if (dataUrl) {
            onSave(dataUrl);
        }
    };

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
                            penColor="#0f172a"
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
