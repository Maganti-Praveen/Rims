import { useState, useEffect } from 'react';
import { Bell, PaperPlaneRight, Users, Buildings, X, Envelope } from '@phosphor-icons/react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

/**
 * SendNotificationModal
 * Props: onClose — called when modal should close
 */
const SendNotificationModal = ({ onClose }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState('all');
    const [department, setDepartment] = useState(user?.role === 'hod' ? user.department : '');
    const [departments, setDepartments] = useState([]);
    const [sendEmail, setSendEmail] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.role === 'admin') {
            API.get('/users/departments').then(r => setDepartments(r.data.data || [])).catch(() => { });
        }
    }, [user]);

    const targetOptions = user?.role === 'hod'
        ? [{ value: 'all', label: `All — ${user.department}`, icon: Users }]
        : [
            { value: 'all', label: 'All Faculty & HODs', icon: Users },
            { value: 'department', label: 'Specific Department', icon: Buildings },
        ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) { toast.error('Message cannot be empty'); return; }
        if (target === 'department' && !department) { toast.error('Please select a department'); return; }

        setLoading(true);
        try {
            const payload = { title: title.trim(), message: message.trim(), target, sendEmail };
            if (target === 'department') payload.department = department;

            const { data } = await API.post('/notifications/send', payload);
            toast.success(data.message || 'Notification sent!');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-primary-800 text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white/20 rounded-lg">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-base">Send Notification</h2>
                            <p className="text-primary-200 text-xs mt-0.5">Broadcast a message to faculty / HODs</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Target audience */}
                    <div>
                        <label className="block text-sm font-medium text-dark-700 mb-2">Send To</label>
                        <div className="flex flex-wrap gap-2">
                            {targetOptions.map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setTarget(value)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${target === value
                                            ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                                            : 'bg-white text-dark-600 border-dark-200 hover:border-primary-300'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Department picker (admin only, when department target) */}
                    {target === 'department' && user?.role === 'admin' && (
                        <div>
                            <label className="block text-sm font-medium text-dark-700 mb-1">Department</label>
                            <select
                                value={department}
                                onChange={e => setDepartment(e.target.value)}
                                className="select-field"
                                required
                            >
                                <option value="">Select department...</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                            Title <span className="text-dark-400 font-normal">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g., Deadline Reminder"
                            className="input-field"
                            maxLength={100}
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">Message *</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Write your notification message here..."
                            className="input-field resize-none"
                            rows={4}
                            required
                            maxLength={500}
                        />
                        <p className="text-xs text-dark-400 mt-1 text-right">{message.length}/500</p>
                    </div>

                    {/* Email Toggle */}
                    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all cursor-pointer ${sendEmail ? 'border-primary-500 bg-primary-50' : 'border-dark-200 bg-dark-50'}`}
                        onClick={() => setSendEmail(!sendEmail)}>
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${sendEmail ? 'bg-primary-600 text-white' : 'bg-dark-200 text-dark-500'}`}>
                                <Envelope className="w-4 h-4" />
                            </div>
                            <div>
                                <p className={`text-sm font-medium ${sendEmail ? 'text-primary-700' : 'text-dark-600'}`}>
                                    Also send via Email
                                </p>
                                <p className="text-xs text-dark-400">Delivers to recipients' email inbox</p>
                            </div>
                        </div>
                        {/* Toggle switch */}
                        <div className={`w-11 h-6 rounded-full transition-colors relative ${sendEmail ? 'bg-primary-600' : 'bg-dark-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-transform ${sendEmail ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                    </div>

                    {/* Preview */}
                    {(title || message) && (
                        <div className="p-3 bg-primary-50 border border-primary-100 rounded-xl">
                            <p className="text-xs text-primary-600 font-semibold uppercase tracking-wider mb-1">Preview</p>
                            <p className="text-sm text-dark-900 font-medium">{title || '(No title)'}</p>
                            <p className="text-xs text-dark-600 mt-0.5">{message || '(No message)'}</p>
                        </div>
                    )}

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
                            disabled={loading}
                        >
                            {loading
                                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <PaperPlaneRight className="w-4 h-4" />
                            }
                            {sendEmail ? 'Send + Email' : 'Send Notification'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SendNotificationModal;
