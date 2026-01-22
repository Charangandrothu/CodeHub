import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

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
                try {
                    const res = await fetch(`http://localhost:5000/api/users/${user.uid}`);
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

    const value = {
        currentUser,
        userData,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
