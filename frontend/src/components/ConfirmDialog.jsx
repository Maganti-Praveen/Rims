import { Warning, Trash, X } from '@phosphor-icons/react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, loading, variant = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95">
                {/* Header stripe */}
                <div className={`h-1.5 ${variant === 'danger' ? 'bg-red-500' : 'bg-primary-500'}`} />

                <div className="p-6">
                    {/* Icon + Close */}
                    <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${variant === 'danger' ? 'bg-red-100' : 'bg-primary-100'}`}>
                            <Warning className={`w-6 h-6 ${variant === 'danger' ? 'text-red-600' : 'text-primary-600'}`} />
                        </div>
                        <button onClick={onClose} className="p-1.5 text-dark-400 hover:text-dark-600 hover:bg-dark-100 rounded-lg transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-dark-900 mb-2">{title}</h3>
                    <p className="text-sm text-dark-500 leading-relaxed">{message}</p>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 mt-6">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2.5 text-sm font-medium text-dark-700 bg-dark-100 hover:bg-dark-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 ${variant === 'danger'
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-primary-600 hover:bg-primary-700'
                                }`}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Trash className="w-4 h-4" />
                            )}
                            {loading ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
