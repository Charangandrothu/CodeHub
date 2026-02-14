import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

const LandingPage = () => {
    return (
        <div className="flex flex-col">
            <Hero />
            <Features />
            <Pricing />
            <Footer />
        </div>
    );
};

export default LandingPage;
