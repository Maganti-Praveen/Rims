import { useState, useEffect } from 'react';
import { WifiSlash, ArrowsCounterClockwise } from '@phosphor-icons/react';

/**
 * Shows a full-screen offline overlay when the browser loses internet.
 * Listens to the native online/offline events — no service worker needed.
 */
const OfflineOverlay = () => {
    const [isOnline, setIsOnline] = useState(navigator?.onLine ?? true);

    useEffect(() => {
        const online  = () => setIsOnline(true);
        const offline = () => setIsOnline(false);
        window.addEventListener('online',  online);
        window.addEventListener('offline', offline);
        return () => {
            window.removeEventListener('online',  online);
            window.removeEventListener('offline', offline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-5"
             style={{ background: 'linear-gradient(150deg,#ea580c 0%,#f97316 45%,#fb923c 75%,#fed7aa 100%)' }}>

            <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center">

                {/* Icon */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500
                    flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-200">
                    <WifiSlash className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200
                    text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    No Internet Connection
                </div>

                <h1 className="font-heading text-xl sm:text-2xl font-bold text-dark-900 mb-2">
                    You're Offline
                </h1>
                <p className="text-dark-400 text-sm sm:text-base leading-relaxed mb-6">
                    RCEE RIMS couldn't reach the server. Check your connection and try again.
                </p>

                {/* Tips */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-left mb-6">
                    <p className="text-xs font-bold text-primary-700 mb-2">Things to check:</p>
                    <ul className="space-y-1 text-xs text-dark-500 pl-2">
                        <li>• Check your Wi-Fi or mobile data</li>
                        <li>• Move closer to your router</li>
                        <li>• Disable airplane mode</li>
                    </ul>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="w-full flex items-center justify-center gap-2
                        bg-gradient-to-r from-primary-600 to-primary-500 text-white
                        py-3 rounded-xl font-bold text-sm
                        shadow-md shadow-orange-200 hover:from-primary-700 hover:to-primary-600
                        active:scale-95 transition-all"
                >
                    <ArrowsCounterClockwise className="w-4 h-4" />
                    Try Again
                </button>

                <p className="text-xs text-dark-300 mt-5">
                    RCEE RIMS · Ramachandra College of Engineering
                </p>
            </div>

            {/* Blobs */}
            <div className="fixed top-10 left-8 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-10 right-8 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
};

export default OfflineOverlay;
