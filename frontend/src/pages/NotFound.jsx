import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { House, ArrowLeft, BookOpen } from '@phosphor-icons/react';

const NotFound = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const homeUrl = user ? (user.role === 'faculty' ? '/home' : '/dashboard') : '/login';

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-5"
            style={{ background: 'linear-gradient(150deg,#ea580c 0%,#f97316 45%,#fb923c 75%,#fed7aa 100%)' }}
        >
            {/* Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center">

                {/* Giant 404 */}
                <div className="relative mb-4">
                    <p
                        className="font-heading font-black leading-none select-none"
                        style={{ fontSize: 'clamp(5rem,20vw,8rem)', color: '#fed7aa' }}
                    >
                        404
                    </p>
                    {/* Floating icon on top */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500
                            flex items-center justify-center shadow-lg shadow-orange-300">
                            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>
                    </div>
                </div>

                <h1 className="font-heading text-xl sm:text-2xl font-bold text-dark-900 mb-2">
                    Page Not Found
                </h1>
                <p className="text-dark-400 text-sm sm:text-base leading-relaxed mb-8">
                    The page you're looking for doesn't exist or you don't have permission to view it.
                </p>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2
                            border-2 border-primary-200 text-primary-700 bg-primary-50
                            hover:bg-primary-100 hover:border-primary-400
                            px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate(homeUrl)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2
                            bg-gradient-to-r from-primary-600 to-primary-500 text-white
                            px-5 py-2.5 rounded-xl font-semibold text-sm
                            shadow-md shadow-orange-200 hover:shadow-orange-300
                            hover:from-primary-700 hover:to-primary-600
                            transition-all"
                    >
                        <House className="w-4 h-4" />
                        Back to Home
                    </button>
                </div>

                {/* Breadcrumb hint */}
                <p className="text-xs text-dark-300 mt-6">
                    RCEE RIMS · Ramachandra College of Engineering
                </p>
            </div>

            {/* Decorative blobs */}
            <div className="fixed top-10 left-8 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-10 right-8 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
};

export default NotFound;
