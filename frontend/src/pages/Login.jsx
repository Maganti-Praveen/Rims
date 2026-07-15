import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeSlash, WarningCircle, Envelope, PaperPlaneRight } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import collegeLogo from '../assets/rcee.png';
import API from '../api/axios';
import Modal from '../components/ui/Modal';

const Login = () => {
    const [identifier, setIdentifier]     = useState('');
    const [password, setPassword]         = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading]           = useState(false);
    const [errorMsg, setErrorMsg]         = useState('');

    const [forgotOpen, setForgotOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotStatus, setForgotStatus] = useState('idle'); // idle | loading | success | error
    const [forgotMessage, setForgotMessage] = useState('');

    const { login }  = useAuth();
    const navigate   = useNavigate();

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setForgotStatus('loading');
        try {
            const { data } = await API.post('/auth/forgot-password', { email: forgotEmail });
            setForgotStatus('success');
            setForgotMessage(data.message);
        } catch (err) {
            setForgotStatus('error');
            setForgotMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);
        try {
            const user = await login(identifier, password);
            toast.success(`Welcome back, ${user.name}!`);
            navigate(user.role === 'faculty' ? '/home' : '/dashboard');
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">

            {/* ── Left panel — branding (desktop only) ── */}
            <div className="hidden lg:flex lg:w-[44%] flex-col items-center justify-center bg-gradient-to-br from-[#ea580c] to-[#fb923c] px-14">
                {/* Logo */}
                <div className="bg-white rounded-2xl px-6 py-4 shadow-md mb-8 w-64 flex items-center justify-center">
                    <img src={collegeLogo} alt="RCEE" className="w-full h-16 object-contain" />
                </div>

                {/* College name */}
                <h1 className="text-white text-2xl font-bold text-center leading-snug mb-2">
                    Ramachandra College<br />of Engineering
                </h1>
                <p className="text-orange-100 text-sm text-center mb-10">
                    Jawaharlal Nehru Technological University
                </p>

                {/* Divider */}
                <div className="w-12 h-0.5 bg-white/40 rounded-full mb-8" />

                {/* System name */}
                <p className="text-white text-lg font-semibold tracking-wide mb-1">RCEE RIMS</p>
                <p className="text-orange-100 text-xs text-center max-w-[220px] leading-relaxed">
                    Research Information Management System
                </p>
            </div>

            {/* ── Right panel — login form ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-10 bg-gray-50">
                <div className="w-full max-w-sm">

                    {/* Mobile logo header */}
                    <div className="flex items-center gap-3 mb-8 lg:hidden">
                        <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
                            <img src={collegeLogo} alt="RCEE" className="w-10 h-10 object-contain" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800 leading-tight">Ramachandra College</p>
                            <p className="text-xs text-gray-500">RCEE RIMS Portal</p>
                        </div>
                    </div>

                    {/* Heading */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h2>
                    <p className="text-sm text-gray-500 mb-7">Enter your email or Employee ID to continue</p>

                    {/* Error */}
                    {errorMsg && (
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 mb-5">
                            <WarningCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{errorMsg}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email / ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email / Employee ID
                            </label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="email@rcee.ac.in or RCEE001"
                                required
                                autoComplete="username"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white
                                    text-sm text-gray-900 placeholder-gray-400
                                    focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                                    transition-shadow"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm font-medium text-gray-700">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setForgotOpen(true)}
                                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-300 bg-white
                                        text-sm text-gray-900 placeholder-gray-400
                                        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                                        transition-shadow"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700
                                text-white font-semibold py-2.5 rounded-xl
                                transition-colors disabled:opacity-60 mt-1"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Signing in…
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-xs text-gray-400 text-center mt-8">
                        © {new Date().getFullYear()} Ramachandra College of Engineering
                    </p>
                </div>
            </div>

            {/* Forgot Password Modal */}
            <Modal
                isOpen={forgotOpen}
                onClose={() => {
                    setForgotOpen(false);
                    setForgotStatus('idle');
                    setForgotEmail('');
                    setForgotMessage('');
                }}
                title="Forgot Password"
            >
                <div className="p-1">
                    <p className="text-dark-500 text-sm mb-5">
                        Enter your college email and we'll send you a reset link.
                    </p>

                    {forgotStatus === 'success' ? (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-subtle">
                                <PaperPlaneRight className="w-7 h-7 text-emerald-600" />
                            </div>
                            <p className="text-dark-700 font-medium">{forgotMessage}</p>
                            <p className="text-dark-400 text-xs mt-2">Check your inbox and click the reset link within 15 minutes.</p>
                            <button
                                onClick={() => {
                                    setForgotOpen(false);
                                    setForgotStatus('idle');
                                    setForgotEmail('');
                                    setForgotMessage('');
                                }}
                                className="btn-secondary mt-6 w-full text-sm"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1.5">
                                    College Email
                                </label>
                                <div className="relative">
                                    <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                    <input
                                        type="email"
                                        value={forgotEmail}
                                        onChange={(e) => { setForgotEmail(e.target.value); setForgotStatus('idle'); }}
                                        placeholder="yourname@rcee.ac.in"
                                        className="input-field pl-9 w-full text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            {forgotStatus === 'error' && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl animate-fade-in">
                                    {forgotMessage}
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-4 border-t border-dark-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForgotOpen(false);
                                        setForgotStatus('idle');
                                        setForgotEmail('');
                                        setForgotMessage('');
                                    }}
                                    className="btn-secondary text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={forgotStatus === 'loading'}
                                    className="btn-primary text-sm flex items-center justify-center gap-2"
                                >
                                    {forgotStatus === 'loading' ? 'Sending…' : 'Send Reset Link'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Login;
