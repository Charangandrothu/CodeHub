import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * AdBanner — Reusable Google AdSense ad component.
 * Only renders for free (non-Pro) users.
 * 
 * @param {string} adSlot   — The AdSense ad slot ID
 * @param {string} adFormat — Ad format (default: "auto")
 * @param {string} className — Additional wrapper classes
 */
const AdBanner = ({ adSlot, adFormat = 'auto', className = '' }) => {
    const { userData } = useAuth();
    const adRef = useRef(null);
    const pushed = useRef(false);

    // Don't render for Pro users
    const isPro = userData?.isPro === true;

    useEffect(() => {
        // Guard: skip if Pro, already pushed, or SSR
        if (isPro || pushed.current) return;
        if (typeof window === 'undefined') return;

        try {
            const adsbygoogle = window.adsbygoogle || [];
            adsbygoogle.push({});
            pushed.current = true;
        } catch (err) {
            // Silently handle - ad blocker or AdSense not loaded
            console.warn('AdSense push failed:', err.message);
        }
    }, [isPro]);

    // Don't render anything for Pro users
    if (isPro) return null;

    return (
        <div className={`ad-banner-wrapper flex justify-center items-center my-4 min-h-[90px] ${className}`}>
            <ins
                className="adsbygoogle"
                style={{
                    display: 'block',
                    width: '100%',
                    minHeight: '90px',
                }}
                ref={adRef}
                data-ad-client="ca-pub-6907980845698047"
                data-ad-slot={adSlot}
                data-ad-format={adFormat}
                data-full-width-responsive="true"
            />
        </div>
    );
};

export default AdBanner;
