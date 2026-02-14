import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';
import AdBanner from '../components/AdBanner';

const LandingPage = () => {
    return (
        <div className="flex flex-col">
            <Hero />
            {/* Ad placement: Below Hero, before Features */}
            <div className="bg-[#0a0a0a] px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <AdBanner adSlot="9351763178" className="py-2" />
                </div>
            </div>
            <Features />
            {/* Ad placement: Between Features and Pricing */}
            <div className="bg-[#0a0a0a] px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <AdBanner adSlot="2786354821" className="py-2" />
                </div>
            </div>
            <Pricing />
            <Footer />
        </div>
    );
};

export default LandingPage;
