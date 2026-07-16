import React from 'react';
import { MagnifyingGlass, FileX } from '@phosphor-icons/react';

const EmptyState = ({
    title = 'No records found',
    description = 'Try adjusting your filters or search terms to find what you are looking for.',
    icon: Icon = FileX,
    actionLabel,
    onAction,
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-dark-100 shadow-sm animate-fade-in w-full">
            {/* Illustrated Icon Frame */}
            <div className="relative mb-5 flex items-center justify-center">
                {/* Decorative glowing backdrops */}
                <div className="absolute inset-0 bg-primary-100 rounded-full blur-xl opacity-40 scale-125" />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-orange-50 border border-primary-100 flex items-center justify-center text-primary-500 shadow-sm relative z-10">
                    <Icon className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-accent-100 border border-accent-200 flex items-center justify-center text-accent-600 shadow-sm z-20 animate-bounce">
                    <MagnifyingGlass className="w-3 h-3" />
                </div>
            </div>

            {/* Content text */}
            <h3 className="text-base font-bold text-dark-800 leading-snug">{title}</h3>
            <p className="text-xs text-dark-400 mt-1.5 max-w-sm leading-relaxed">{description}</p>

            {/* Action button */}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="btn-primary mt-6 text-xs px-4 py-2 flex items-center gap-1.5"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
