import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { getUserDocument } from '../services/userService';
import LoadingScreen from '../components/LoadingScreen';

import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null); // Stores MongoDB user details (isPro, etc.)
    const [loading, setLoading] = useState(true);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true; // Reset on mount

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!isMounted.current) return;

            setCurrentUser(user);

            if (user) {
                // Determine if we need to sync or just fetch
                let fetchedData = null;

                // 1. Try Sync (Create/Update based on Firebase Auth)
                try {
                    const res = await fetch(`${API_URL}/api/users/sync`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL
                        })
                    });

                    if (res.ok) {
                        fetchedData = await res.json();
                    }
                } catch (err) {
                    console.error("Failed to sync/fetch MongoDB user data:", err);
                }

                // 2. Fallback: If Sync failed, try explicit Get
                if (!fetchedData) {
                    try {
                        fetchedData = await getUserDocument(user.uid);
                    } catch (err) {
                        console.error("Failed to fetch fallback user data:", err);
                    }
                }

                if (isMounted.current) {
                    setUserData(fetchedData || null);
                }

            } else {
                if (isMounted.current) {
                    setUserData(null);
                }
            }

            if (isMounted.current) {
                setLoading(false);
            }
        });

        return () => {
            isMounted.current = false;
            unsubscribe();
        };
    }, []);

    const logout = () => {
        return signOut(auth);
    };

    const refreshUserData = async () => {
        if (currentUser) {
            try {
                // Use getUserDocument for refresh (lighter than sync)
                const data = await getUserDocument(currentUser.uid);
                if (isMounted.current) {
                    setUserData(data);
                }
            } catch (err) {
                console.error("Failed to refresh user data:", err);
            }
        }
    };

    const value = {
        currentUser,
        userData,
        logout,
        refreshUserData
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <LoadingScreen /> : children}
        </AuthContext.Provider>
    );
};
