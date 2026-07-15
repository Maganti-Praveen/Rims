import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Envelope, ArrowLeft, PaperPlaneRight } from '@phosphor-icons/react';
import API from '../api/axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const { data } = await API.post('/auth/forgot-password', { email });
            setStatus('success');
            setMessage(data.message);
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
                    <h2 className="text-xl font-semibold text-dark-900 mb-1">Forgot Password?</h2>
                    <p className="text-dark-500 text-sm mb-6">
                        Enter your college email and we'll send you a reset link.
                    </p>

                    {status === 'success' ? (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <PaperPlaneRight className="w-7 h-7 text-emerald-600" />
                            </div>
                            <p className="text-dark-700 font-medium">{message}</p>
                            <p className="text-dark-400 text-sm mt-2">Check your inbox and click the reset link within 15 minutes.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1">
                                    College Email
                                </label>
                                <div className="relative">
                                    <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                                        placeholder="yourname@rcee.ac.in"
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
                                disabled={status === 'loading'}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {status === 'loading' ? 'Sending…' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
