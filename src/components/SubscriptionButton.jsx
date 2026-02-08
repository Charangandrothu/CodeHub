import React, { useState } from 'react';
import { loadRazorpay } from '../utils/loadRazorpay';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast'; // Assuming you have toast or use alert

const SubscriptionButton = (props) => {
    const { currentUser, refreshUserData } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubscription = async () => {
        if (!currentUser) {
            toast.error("Please login first");
            return;
        }

        setLoading(true);

        try {
            // 1. Load Razorpay SDK
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                toast.error("Razorpay SDK failed to load. Check your connection.");
                setLoading(false);
                return;
            }

            // 2. Create Subscription on Backend
            const response = await fetch(`${API_URL}/api/payment/create-subscription`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: currentUser.uid })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || "Failed to create subscription");
            }

            const data = await response.json();
            const { subscriptionId, keyId } = data;

            if (!subscriptionId || !keyId) {
                throw new Error("Invalid response from server");
            }

            // 3. Open Razorpay Checkout
            const options = {
                key: keyId,
                subscription_id: subscriptionId,
                name: "CodeHubx Pro",
                description: "Monthly Pro Subscription",
                // IMPORTANT: Must be a direct image URL (png/jpg) or base64. 
                // Do NOT use HTML pages like ibb.co links.
                image: "https://i.postimg.cc/59gWXgtK/logopayment.png",
                handler: async function (response) {
                    try {
                        // 4. Verify Payment on Backend
                        const verificationRes = await fetch(`${API_URL}/api/payment/verify-payment`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_subscription_id: response.razorpay_subscription_id,
                                razorpay_signature: response.razorpay_signature,
                                uid: currentUser.uid
                            })
                        });

                        const verificationData = await verificationRes.json();

                        if (verificationData.success) {
                            toast.success("Welcome to CodeHubx Pro!");
                            await refreshUserData(); // Update context
                        } else {
                            toast.error("Payment verification failed!");
                        }
                    } catch (error) {
                        console.error("Verification Error:", error);
                        toast.error("Verification failed. Contact support.");
                    }
                },
                prefill: {
                    name: currentUser.displayName || "",
                    email: currentUser.email || "",
                    contact: ""
                },
                theme: {
                    color: "#3B82F6"
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error("Payment Failed:", response.error);
                toast.error(response.error.description || "Payment Failed");
                setLoading(false);
            });
            rzp.open();

        } catch (error) {
            console.error("Subscription Error:", error);
            toast.error(error.message || "Something went wrong");
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSubscription}
            disabled={loading}
            className={props.className || "w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"}
        >
            {loading ? (
                <span className="animate-pulse">Processing...</span>
            ) : (
                props.children || (
                    <>
                        <span>Upgrade to PRO</span>
                        <span className="bg-white/20 text-xs py-0.5 px-2 rounded-full">₹99/mo</span>
                    </>
                )
            )}
        </button>
    );
};

export default SubscriptionButton;
