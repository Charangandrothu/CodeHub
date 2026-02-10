import React, { useEffect, useState } from 'react';
import { Search, DollarSign, Calendar, CreditCard, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';

const Payments = () => {
    const { currentUser } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (currentUser) fetchPayments();
    }, [currentUser]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/payments`, {
                headers: { 'x-user-uid': currentUser?.uid }
            });
            const data = await res.json();
            setPayments(data);
        } catch (error) {
            console.error("Error fetching payments:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter(payment =>
        (payment.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.razorpayPaymentId || '').includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Payment History</h1>

            <div className="flex gap-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by email or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#1a1a1a] border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-64"
                    />
                </div>
            </div>

            <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[#1a1a1a] border-b border-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">User / Email</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Plan</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Amount</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                        ) : filteredPayments.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No payments found</td></tr>
                        ) : (
                            filteredPayments.map((payment) => (
                                <tr key={payment._id || payment.razorpayPaymentId} className="hover:bg-[#1a1a1a]/50">
                                    <td className="px-6 py-4">
                                        <div className="text-white text-sm">{payment.email || 'N/A'}</div>
                                        <div className="text-xs text-gray-500 font-mono">{payment.razorpayPaymentId}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">{payment.plan || 'Pro'}</td>
                                    <td className="px-6 py-4 text-white font-medium">₹{payment.amount}</td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        {new Date(payment.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${payment.status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                            }`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Payments;
