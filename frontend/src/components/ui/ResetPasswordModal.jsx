import { useState } from 'react';
import { Key, Eye, EyeSlash, X, ShieldCheck } from '@phosphor-icons/react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

/**
 * ResetPasswordModal
 * Props:
 *   user  — { _id, name, role, department } of the target user
 *   onClose — called when modal should close
 */
const ResetPasswordModal = ({ user, onClose }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const { data } = await API.put(`/users/${user._id}/reset-password`, { newPassword });
            toast.success(data.message || `Password reset for ${user.name}`);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-primary-800 text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white/20 rounded-lg">
                            <Key className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-base">Reset Password</h2>
                            <p className="text-primary-200 text-xs mt-0.5">{user.name} · {user.department}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Info banner */}
                    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                        <span>
                            You are resetting the password for <strong>{user.name}</strong>.
                            They will need to use the new password on their next login.
                        </span>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">New Password</label>
                        <div className="relative">
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input-field pr-10"
                                placeholder="Enter new password (min 6 chars)"
                                required
                                minLength={6}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                            >
                                {showNew ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field pr-10"
                                placeholder="Confirm new password"
                                required
                                minLength={6}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                            >
                                {showConfirm ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                        )}
                    </div>

                    {/* Strength indicator */}
                    <div className="space-y-1">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4].map((level) => (
                                <div
                                    key={level}
                                    className={`h-1 flex-1 rounded-full transition-colors ${newPassword.length >= level * 3
                                            ? level <= 2 ? 'bg-red-400' : level === 3 ? 'bg-amber-400' : 'bg-emerald-500'
                                            : 'bg-dark-100'
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-dark-400">
                            {newPassword.length === 0 ? '' :
                                newPassword.length < 6 ? 'Too short' :
                                    newPassword.length < 9 ? 'Weak' :
                                        newPassword.length < 12 ? 'Fair' : 'Strong'}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                            disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Key className="w-4 h-4" />
                            )}
                            Reset Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordModal;
