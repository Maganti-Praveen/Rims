import { X } from '@phosphor-icons/react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]}
        max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-dark-100">
                    <h2 className="text-lg font-semibold text-dark-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-dark-400 hover:text-dark-600 hover:bg-dark-100 p-1.5 rounded-lg transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
