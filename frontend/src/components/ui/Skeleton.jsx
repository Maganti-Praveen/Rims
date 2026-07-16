import React from 'react';

export const SkeletonCircle = ({ size = 'w-10 h-10', className = '' }) => (
    <div className={`rounded-full bg-dark-200 animate-pulse shrink-0 ${size} ${className}`} />
);

export const SkeletonLine = ({ width = 'w-full', height = 'h-4', className = '' }) => (
    <div className={`rounded-lg bg-dark-200/80 animate-pulse ${width} ${height} ${className}`} />
);

export const SkeletonCard = ({ className = '' }) => (
    <div className={`card p-5 space-y-4 animate-pulse bg-white border border-dark-100 ${className}`}>
        <div className="flex items-center gap-3">
            <SkeletonCircle size="w-12 h-12" />
            <div className="flex-1 space-y-2">
                <SkeletonLine width="w-2/3" height="h-4" />
                <SkeletonLine width="w-1/3" height="h-3" />
            </div>
        </div>
        <div className="space-y-2 pt-1">
            <SkeletonLine width="w-full" height="h-3" />
            <SkeletonLine width="w-5/6" height="h-3" />
        </div>
    </div>
);
