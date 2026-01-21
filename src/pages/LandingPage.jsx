import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';

const LandingPage = () => {
    return (
        <div className="flex flex-col">
            <Hero />
            <Features />
            <Pricing />
        </div>
    );
};

export default LandingPage;
