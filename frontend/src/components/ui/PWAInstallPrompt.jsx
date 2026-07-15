import { useState, useEffect } from 'react';
import { DownloadSimple, X } from '@phosphor-icons/react';

/**
 * Shows a styled "Install App" banner when the browser fires
 * the beforeinstallprompt event (Chrome/Edge/Android).
 * Dismissed state stored in localStorage — never shows again if user says "Not now".
 */
const PWAInstallPrompt = () => {
    const [prompt, setPrompt]     = useState(null);
    const [visible, setVisible]   = useState(false);

    useEffect(() => {
        if (localStorage.getItem('pwaInstallDismissed')) return;
        const handler = (e) => { e.preventDefault(); setPrompt(e); setVisible(true); };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    if (!visible || !prompt) return null;

    const handleInstall = async () => {
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === 'accepted') setVisible(false);
    };

    const handleDismiss = () => {
        localStorage.setItem('pwaInstallDismissed', '1');
        setVisible(false);
    };

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl border border-primary-100 p-4 flex items-center gap-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500
                    flex items-center justify-center shrink-0 shadow-sm">
                    <DownloadSimple className="w-5 h-5 text-white" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-dark-900 leading-tight">Install RCEE RIMS</p>
                    <p className="text-xs text-dark-400 leading-tight">Add to home screen for quick access</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={handleInstall}
                        className="bg-gradient-to-r from-primary-600 to-primary-500 text-white
                            text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm
                            hover:from-primary-700 hover:to-primary-600 transition-all"
                    >
                        Install
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="w-7 h-7 rounded-lg flex items-center justify-center
                            text-dark-400 hover:bg-dark-100 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallPrompt;
