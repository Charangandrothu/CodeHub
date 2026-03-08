import React from 'react';

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={`animate-pulse rounded-md bg-white/5 border border-white/10 ${className}`}
            {...props}
        />
    );
}
