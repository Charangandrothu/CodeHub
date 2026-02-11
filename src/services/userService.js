import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { API_URL } from "../config";

export const checkUsernameExists = async (username) => {
    try {
        const response = await fetch(`${API_URL}/api/users/check-username/${username}`);
        if (!response.ok) throw new Error("Failed to check username");
        const data = await response.json();
        return !data.available;
    } catch (error) {
        console.error("Error checking username:", error);
        return false; // Assume available on error to not block user, or handle differently
    }
};

/**
 * Creates a new user document in Firestore if it doesn't exist.
 * This is used for the initial Google login.
 */
export const createFirestoreUser = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
        const { email, photoURL } = user;
        const createdAt = serverTimestamp();

        try {
            await setDoc(userRef, {
                uid: user.uid,
                email,
                photoURL: photoURL || null,
                provider: "google",
                username: null,
                hasPassword: false,
                profileCompleted: false,
                role: "user",
                plan: "free",
                createdAt,
                ...additionalData
            });
            return { isNew: true };
        } catch (error) {
            console.error("Error creating user document", error);
            throw error;
        }
    } else {
        return { isNew: false, userData: userSnapshot.data() };
    }
};

/**
 * Updates the user profile after they complete the registration form.
 */
export const completeUserProfile = async (uid, { username }) => {
    try {
        const response = await fetch(`${API_URL}/api/users/complete-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to complete profile");
        }
    } catch (error) {
        console.error("Error completing user profile", error);
        throw error;
    }
};

export const getUserDocument = async (uid) => {
    if (!uid) return null;
    try {
        const response = await fetch(`${API_URL}/api/users/${uid}`);
        if (!response.ok) return null;
        return await response.json(); // Returns MongoDB user object
    } catch (error) {
        console.error("Error fetching user document", error);
        return null;
    }
};
