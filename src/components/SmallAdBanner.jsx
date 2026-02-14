import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const SmallAdBanner = ({ adSlot, className = '' }) => {
    const { userData } = useAuth();
    const isPro = userData?.isPro === true;
    const adRef = useRef(null);
    const pushed = useRef(false);

    useEffect(() => {
        if (!isPro && typeof window !== 'undefined' && !pushed.current && adRef.current) {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                pushed.current = true;
            } catch (err) {
                console.error("AdSense error:", err);
            }
        }
    }, [isPro]);

    if (isPro) return null;

    return (
        <div className={`flex justify-center items-center my-4 ${className}`}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{
                    display: 'inline-block',
                    width: '100%',
                    maxWidth: '728px',
                    height: '90px'
                }}
                data-ad-client="ca-pub-6907980845698047"
                data-ad-slot={adSlot}
            >
                {/* Mobile Fallback Style via CSS if needed, but style prop handles the main sizing. 
                    For strict 320x50 on mobile, we can use media queries on the wrapper or override styles.
                    Here we set 100% width/90px height, which AdSense will fill responsively.
                */}
            </ins>
            <style jsx>{`
                @media (max-width: 768px) {
                    .adsbygoogle {
                        width: 320px !important;
                        height: 50px !important;
                    }
                }
                @media (min-width: 769px) {
                    .adsbygoogle {
                        width: 728px !important;
                        height: 90px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default SmallAdBanner;
