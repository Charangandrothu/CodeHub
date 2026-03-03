import React, { useEffect, useRef } from 'react';
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

const SmallAdBanner = ({ adSlot, className = '' }) => {
    const { userData } = useAuth();
    const location = useLocation();
    const isPro = userData?.isPro === true;
    const adRef = useRef(null);
    const pushed = useRef(false);

    const showAds = contentRoutes.some(route => location.pathname.startsWith(route));

    useEffect(() => {
        if (isPro || !showAds) return;
        if (typeof window === 'undefined') return;

        if (!document.getElementById('adsense-script')) {
            const script = document.createElement('script');
            script.id = 'adsense-script';
            script.async = true;
            script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6907980845698047";
            script.crossOrigin = "anonymous";
            document.head.appendChild(script);
        }

        if (!pushed.current && adRef.current) {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                pushed.current = true;
            } catch (err) {
                console.error("AdSense error:", err);
            }
        }
    }, [isPro, showAds, location.pathname]);

    if (isPro || !showAds) return null;

    return (
        <div className={`flex justify-center items-center overflow-hidden h-fit my-4 ${className}`}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{
                    display: 'block',
                    width: '100%',
                    maxWidth: '100%',
                    maxHeight: '100px',
                    minHeight: '50px'
                }}
                data-ad-client="ca-pub-6907980845698047"
                data-ad-slot={adSlot}
                data-ad-format="horizontal"
                data-full-width-responsive="true"
            />
        </div>
    );
};

export default SmallAdBanner;
