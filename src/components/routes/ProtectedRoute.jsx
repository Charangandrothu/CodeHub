import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../LoadingScreen';

const ProtectedRoute = ({ children }) => {
    const { currentUser, userData, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }



    return children;
};

export default ProtectedRoute;
