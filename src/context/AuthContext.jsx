import { createContext, useContext, useEffect, useState } from 'react';
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // Fetch MongoDB User Data
                let mongoData = null;
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
                        mongoData = await res.json();
                    }
                } catch (err) {
                    console.error("Failed to fetch MongoDB user data:", err);
                }

                // Fetch Firestore User Data
                let firestoreData = null;
                try {
                    firestoreData = await getUserDocument(user.uid);
                } catch (err) {
                    console.error("Failed to fetch Firestore user data:", err);
                }

                setUserData({ ...mongoData, ...firestoreData });

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
                // Refresh both sources
                const [mongoRes, firestoreData] = await Promise.all([
                    fetch(`${API_URL}/api/users/${currentUser.uid}`).then(r => r.ok ? r.json() : null).catch(() => null),
                    getUserDocument(currentUser.uid)
                ]);
                setUserData({ ...mongoRes, ...firestoreData });
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
