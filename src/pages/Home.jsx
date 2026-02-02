import React from 'react';
import { useAuth } from '../context/AuthContext';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import LoadingScreen from '../components/LoadingScreen';

const Home = () => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    // Dynamic Route Logic:
    // If User is Authenticated -> Show Dashboard (Authenticated Home View)
    // If User is NULL -> Show Landing Page
    return currentUser ? <Dashboard /> : <LandingPage />;
};

export default Home;
