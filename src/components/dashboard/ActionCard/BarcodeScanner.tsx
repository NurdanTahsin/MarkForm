import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useActiveTheme, useUserStore } from '../../../store/useUserStore';
import { X, Camera, Zap, ZapOff } from 'lucide-react';

export function BarcodeScanner({ onScan, onClose }: { onScan: (b: string) => void, onClose: () => void }) {
    const T = useActiveTheme();
    const language = useUserStore((s) => s.language);
    const t = (tr: string, en: string) => (language === 'tr' ? tr : en);

    const [isFlashOn, setIsFlashOn] = useState(false);
    const qrInstance = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        const scannerId = "reader";
        qrInstance.current = new Html5Qrcode(scannerId);

        const config = {
            fps: 20,
            // Kutuyu biraz büyütmek odaklamayı rahatlatır
            qrbox: { width: 280, height: 180 },
            aspectRatio: 1.0,
            // Sadece EAN-13 ve benzeri standartları destekle ki ilk rakamı atlayıp UPC-A sanmasın
            formatsToSupport: [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.QR_CODE
            ]
        };

        qrInstance.current.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
                qrInstance.current?.stop().then(() => onScan(decodedText));
            },
            () => { /* Hata loglamaya gerek yok */ }
        ).catch(err => console.error("Kamera başlatılamadı:", err));

        return () => {
            if (qrInstance.current?.isScanning) {
                qrInstance.current.stop().then(() => {
                    qrInstance.current?.clear();
                }).catch(() => { });
            } else {
                qrInstance.current?.clear();
            }
        };
    }, [onScan]);

    // Flash/Fener Kontrolü (Odaklanmayı tetikler)
    const toggleFlash = async () => {
        if (!qrInstance.current) return;
        try {
            const newState = !isFlashOn;
            await qrInstance.current.applyVideoConstraints({
                advanced: [{ torch: newState } as any]
            });
            setIsFlashOn(newState);
        } catch (e) {
            console.log("Flash desteklenmiyor");
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

            <div className={`relative w-full max-w-md rounded-3xl ${T.cardBg} border ${T.cardBorder} shadow-2xl overflow-hidden z-10`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Camera className={`h-5 w-5 ${T.accent}`} />
                        <span className={`font-bold ${T.title}`}>{t('Barkod Okut', 'Scan Barcode')}</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                        <X className={T.title} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Kamera Alanı */}
                    <div className="relative aspect-square w-full bg-black rounded-2xl overflow-hidden ring-2 ring-white/10">
                        {/* Aynalama işlemi CSS ile sadece kullanıcı için yapılıyor, algoritma orijinal halini tarıyor */}
                        <div id="reader" className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_video]:-scale-x-100" />

                        {/* Flash Butonu - Odaklama için kritik */}
                        <button
                            onClick={toggleFlash}
                            className="absolute bottom-4 right-4 p-3 bg-black/50 backdrop-blur-md border border-white/20 rounded-full z-20"
                        >
                            {isFlashOn ? <Zap className="text-yellow-400" /> : <ZapOff className="text-white" />}
                        </button>
                    </div>

                    <div className="mt-6 text-center space-y-2">
                        <p className={`text-sm font-medium ${T.title}`}>
                            {t('Ürünü yavaşça yaklaştırıp uzaklaştırın', 'Move product slowly back and forth')}
                        </p>
                        <p className={`text-xs opacity-60 ${T.subtitle}`}>
                            {t('Parlama varsa feneri açmayı deneyin.', 'If there is glare, try turning on the flashlight.')}
                        </p>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}