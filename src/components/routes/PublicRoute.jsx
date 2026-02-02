import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../LoadingScreen';

const PublicRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    if (currentUser) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PublicRoute;
