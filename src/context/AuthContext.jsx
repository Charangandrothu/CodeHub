import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { getUserDocument } from '../services/userService';
import LoadingScreen from '../components/LoadingScreen';
import { AnimatePresence, motion } from 'framer-motion';

import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true); // Main loading state
    const [platformSettings, setPlatformSettings] = useState({ maintenanceMode: false, allowRegistrations: true });

    // Internal counters to track parallel loading
    const [authInitialized, setAuthInitialized] = useState(false);
    const [settingsInitialized, setSettingsInitialized] = useState(false);

    const isMounted = useRef(true);

    // 1. Fetch Platform Settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_URL}/api/platform`);
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted.current) {
                        setPlatformSettings(data);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch platform settings:", err);
            } finally {
                if (isMounted.current) setSettingsInitialized(true);
            }
        };
        fetchSettings();
    }, []);

    // 2. Auth Listener
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
                setAuthInitialized(true);
            }
        });

        return () => {
            isMounted.current = false;
            unsubscribe();
        };
    }, []);

    // Combined Loading Effect
    useEffect(() => {
        if (authInitialized && settingsInitialized) {
            setLoading(false);
        }
    }, [authInitialized, settingsInitialized]);

    const logout = () => {
        return signOut(auth);
    };

    const refreshUserData = async () => {
        if (currentUser) {
            try {
                // Fetch directly from API to ensure we get fresh (or cached) data including roadmap
                const res = await fetch(`${API_URL}/api/users/${currentUser.uid}`);
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted.current) {
                        setUserData(data);
                    }
                }
            } catch (err) {
                console.error("Failed to refresh user data:", err);
            }
        }
    };

    const value = {
        currentUser,
        userData,
        platformSettings,
        logout,
        refreshUserData
    };

    return (
        <AuthContext.Provider value={value}>
            <AnimatePresence mode="wait">
                {loading ? (
                    <LoadingScreen key="auth-loader" />
                ) : (
                    <motion.div key="auth-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthContext.Provider>
    );
};
