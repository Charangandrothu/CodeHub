import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const contentRoutes = [
    "/problem",
    "/blog",
    "/roadmap",
    "/learn",
    "/articles",
    "/dsa",
    "/interview-experience"
];

/**
 * AdBanner — Reusable Google AdSense ad component.
 * Only renders for free (non-Pro) users on allowed routes.
 */
const AdBanner = ({ adSlot, adFormat = 'auto', className = '' }) => {
    const { userData } = useAuth();
    const location = useLocation();
    const adRef = useRef(null);
    const pushed = useRef(false);

    // Don't render for Pro users
    const isPro = userData?.isPro === true;

    // Check if the current route is an allowed content route
    const showAds = contentRoutes.some(route => location.pathname.startsWith(route));

    useEffect(() => {
        // Guard: skip if Pro, not showing ads, already pushed, or SSR
        if (isPro || !showAds) return;
        if (typeof window === 'undefined') return;

        // Dynamically insert the ad script only on content routes
        if (!document.getElementById('adsense-script')) {
            const script = document.createElement('script');
            script.id = 'adsense-script';
            script.async = true;
            script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6907980845698047";
            script.crossOrigin = "anonymous";
            document.head.appendChild(script);
        }

        if (pushed.current) return;

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            pushed.current = true;
        } catch (err) {
            // Silently handle - ad blocker or AdSense not loaded
            console.warn('AdSense push failed:', err.message);
        }
    }, [isPro, showAds, location.pathname]);

    // Don't render anything for Pro users or restricted routes
    if (isPro || !showAds) return null;

    return (
        <div className={`flex justify-center items-center overflow-hidden h-fit my-4 ${className}`}>
            <ins
                className="adsbygoogle"
                style={{
                    display: 'block',
                    width: '100%',
                    maxWidth: '100%',
                    maxHeight: '100px', // Restrict height heavily
                    minHeight: '50px'
                }}
                ref={adRef}
                data-ad-client="ca-pub-6907980845698047"
                data-ad-slot={adSlot}
                data-ad-format="horizontal" // Tell adsense to specifically serve horizontal formats, not square/auto
                data-full-width-responsive="true"
            />
        </div>
    );
};

export default AdBanner;
