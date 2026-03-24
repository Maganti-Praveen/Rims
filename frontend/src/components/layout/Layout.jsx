import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Lock, LogOut, ChevronDown, Download } from 'lucide-react';
import NotificationBell from '../ui/NotificationBell';
import ChangePasswordModal from '../ui/ChangePasswordModal';

const PAGE_TITLES = {
    '/home':           'Home',
    '/my-research':    'My Research',
    '/my-profile':     'My Profile',
    '/dashboard':      'Dashboard',
    '/explore':        'Explore',
    '/faculty':        'Faculty',
    '/compare':        'Compare',
    '/create-account': 'Create Account',
    '/activity-logs':  'Activity Logs',
};

const Layout = ({ children }) => {
    const { user, logout }  = useAuth();
    const location          = useLocation();
    const navigate          = useNavigate();
    const [passwordModal, setPasswordModal] = useState(false);
    const [dropOpen, setDropOpen]           = useState(false);
    const dropRef                           = useRef(null);
    const [installPrompt, setInstallPrompt] = useState(null);

    /* Capture PWA install prompt */
    useEffect(() => {
        const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', () => setInstallPrompt(null));
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') setInstallPrompt(null);
    };

    useEffect(() => {
        AOS.init({ duration: 450, easing: 'ease-out-cubic', once: true, offset: 40 });
    }, []);
    useEffect(() => { AOS.refresh(); }, [location.pathname]);

    /* Close dropdown on outside click */
    useEffect(() => {
        const close = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const currentTitle = Object.entries(PAGE_TITLES)
        .find(([path]) => location.pathname.startsWith(path))?.[1] || 'RCEE RIMS';

    const handleLogout = () => { setDropOpen(false); logout(); navigate('/login'); };
    const handleChangePassword = () => { setDropOpen(false); setPasswordModal(true); };

    return (
        <div className="flex min-h-screen bg-dark-50">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        fontSize: '13px',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        border: '1px solid #fed7aa',
                        boxShadow: '0 4px 14px rgba(234,88,12,0.15)',
                        maxWidth: '90vw',
                    },
                    success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
                    error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }}
            />

            <Sidebar />

            {/* Content shifts right by sidebar width on desktop */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden lg:ml-64 transition-all duration-300">

                {/* ── Top header bar ── */}
                <header className="bg-white border-b border-primary-100 sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-2 px-4 py-2.5 max-w-7xl mx-auto">

                        {/* Left — page title */}
                        <div className="flex items-center gap-2 min-w-0 flex-1 pl-10 lg:pl-0">
                            <span className="w-1 h-5 rounded-full bg-gradient-to-b from-primary-500 to-primary-700 shrink-0" />
                            <h2 className="text-sm font-heading font-bold text-dark-900 truncate">{currentTitle}</h2>
                        </div>

                        {/* Right — notification + install + user dropdown */}
                        <div className="flex items-center gap-1 shrink-0">

                            {/* Install App button — only when browser offers it */}
                            {installPrompt && (
                                <button
                                    onClick={handleInstall}
                                    title="Install RCEE RIMS as App"
                                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                                        bg-gradient-to-r from-primary-600 to-primary-500 text-white
                                        text-xs font-bold shadow-sm hover:from-primary-700 hover:to-primary-600
                                        transition-all mr-1"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Install App
                                </button>
                            )}

                            <NotificationBell />

                            {/* User dropdown trigger */}
                            <div className="relative ml-1" ref={dropRef}>
                                <button
                                    onClick={() => setDropOpen(!dropOpen)}
                                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl
                                        hover:bg-primary-50 border border-transparent hover:border-primary-100
                                        transition-all duration-200 group"
                                >
                                    {/* Avatar */}
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700
                                        text-white flex items-center justify-center text-xs font-bold
                                        ring-2 ring-primary-100 shrink-0">
                                        {user?.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    {/* Name + role — hidden on xs */}
                                    <div className="hidden sm:block text-left leading-tight">
                                        <p className="text-xs font-semibold text-dark-800 truncate max-w-[100px]">{user?.name}</p>
                                        <p className="text-[10px] text-dark-400 capitalize">{user?.role}</p>
                                    </div>
                                    <ChevronDown className={`w-3.5 h-3.5 text-dark-400 transition-transform duration-200 hidden sm:block
                                        ${dropOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown panel */}
                                {dropOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl
                                        border border-dark-100 overflow-hidden z-50 animate-fade-in">

                                        {/* User info header */}
                                        <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-orange-50 border-b border-primary-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700
                                                    text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                                                    {user?.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-dark-900 truncate">{user?.name}</p>
                                                    <p className="text-xs text-dark-400 capitalize truncate">{user?.role} · {user?.department}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu items */}
                                        <div className="py-1.5">
                                            <button
                                                onClick={handleChangePassword}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-dark-700
                                                    hover:bg-primary-50 hover:text-primary-700 transition-colors text-left group"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-primary-100 text-primary-600 group-hover:bg-primary-200
                                                    flex items-center justify-center transition-colors shrink-0">
                                                    <Lock className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium leading-tight">Change Password</p>
                                                    <p className="text-[10px] text-dark-400">Update your credentials</p>
                                                </div>
                                            </button>
                                        </div>

                                        {/* Logout — separated */}
                                        <div className="border-t border-dark-100 py-1.5">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600
                                                    hover:bg-red-50 transition-colors text-left group"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-500 group-hover:bg-red-200
                                                    flex items-center justify-center transition-colors shrink-0">
                                                    <LogOut className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium leading-tight">Sign Out</p>
                                                    <p className="text-[10px] text-red-400">End your session</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Main content ── */}
                <main className="flex-1 min-w-0">
                    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* ── Footer ── */}
                <footer className="border-t border-dark-100 bg-white px-4 py-2 text-center">
                    <p className="text-[10px] text-dark-400">
                        © {new Date().getFullYear()} Ramachandra College of Engineering — RCEE RIMS
                    </p>
                </footer>
            </div>

            <ChangePasswordModal isOpen={passwordModal} onClose={() => setPasswordModal(false)} />
        </div>
    );
};

export default Layout;
