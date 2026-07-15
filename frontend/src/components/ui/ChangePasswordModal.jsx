import { useState } from 'react';
import API from '../../api/axios';
import { Lock, Eye, EyeSlash, X, Check } from '@phosphor-icons/react';

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.newPassword !== form.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (form.newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await API.put('/auth/change-password', {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            setSuccess(true);
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-5 border-b border-dark-100">
                    <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary-800" />
                        <h2 className="text-lg font-semibold text-dark-900">Change Password</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-dark-100">
                        <X className="w-4 h-4 text-dark-500" />
                    </button>
                </div>

                {success ? (
                    <div className="p-8 text-center">
                        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-7 h-7 text-emerald-600" />
                        </div>
                        <p className="text-lg font-semibold text-dark-900">Password Changed!</p>
                        <p className="text-dark-400 text-sm mt-1">Your password has been updated successfully.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-dark-700 mb-1">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showCurrent ? 'text' : 'password'}
                                    value={form.currentPassword}
                                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                                    className="input-field w-full pr-10"
                                    required
                                />
                                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {showCurrent ? <EyeSlash className="w-4 h-4 text-dark-400" /> : <Eye className="w-4 h-4 text-dark-400" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-700 mb-1">New Password</label>
                            <div className="relative">
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    value={form.newPassword}
                                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                    className="input-field w-full pr-10"
                                    required
                                    minLength={6}
                                />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {showNew ? <EyeSlash className="w-4 h-4 text-dark-400" /> : <Eye className="w-4 h-4 text-dark-400" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-700 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={form.confirmPassword}
                                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                className="input-field w-full"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full">
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ChangePasswordModal;
