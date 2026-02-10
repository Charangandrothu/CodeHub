import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // Fetch MongoDB User Data
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
                    const data = await res.json();
                    setUserData(data);
                } catch (err) {
                    console.error("Failed to fetch user data:", err);
                    setUserData({ isPro: false }); // Default to free on error
                }

            } else {
                setUserData(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = () => {
        return signOut(auth);
    };

    const refreshUserData = async () => {
        if (currentUser) {
            try {
                const res = await fetch(`${API_URL}/api/users/${currentUser.uid}`);
                const data = await res.json();
                setUserData(data);
            } catch (err) {
                console.error("Failed to fetch user data:", err);
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
