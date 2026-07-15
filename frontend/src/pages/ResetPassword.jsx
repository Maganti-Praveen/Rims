import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeSlash, CheckCircle, ArrowLeft } from '@phosphor-icons/react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid reset link. Please request a new one.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) {
            setStatus('error');
            setMessage('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters.');
            return;
        }
        setStatus('loading');
        try {
            const { data } = await API.put('/auth/reset-password', { token, password });
            setStatus('success');
            setMessage(data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-primary-800 px-8 py-6 text-center">
                    <h1 className="text-2xl font-bold text-white">RCEE RIMS</h1>
                    <p className="text-primary-200 text-sm mt-1">Research Information Management System</p>
                </div>

                <div className="px-8 py-8">
                    <h2 className="text-xl font-semibold text-dark-900 mb-1">Set New Password</h2>
                    <p className="text-dark-500 text-sm mb-6">Enter your new password below.</p>

                    {status === 'success' ? (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-7 h-7 text-emerald-600" />
                            </div>
                            <p className="text-dark-700 font-medium">{message}</p>
                            <p className="text-dark-400 text-sm mt-2">Redirecting to login…</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                    <input
                                        type={showPwd ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setStatus('idle'); }}
                                        placeholder="Minimum 6 characters"
                                        className="input-field pl-9 pr-10 w-full"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600">
                                        {showPwd ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                    <input
                                        type={showPwd ? 'text' : 'password'}
                                        value={confirm}
                                        onChange={(e) => { setConfirm(e.target.value); setStatus('idle'); }}
                                        placeholder="Re-enter new password"
                                        className="input-field pl-9 w-full"
                                        required
                                    />
                                </div>
                            </div>

                            {status === 'error' && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading' || !token}
                                className="btn-primary w-full"
                            >
                                {status === 'loading' ? 'Resetting…' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <Link to="/forgot-password"
                            className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium">
                            <ArrowLeft className="w-4 h-4" />
                            Request a new link
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
