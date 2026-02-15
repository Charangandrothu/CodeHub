import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, ShieldCheck, UserPlus, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';

const AdminSettings = () => {
    const { currentUser } = useAuth();
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        allowRegistrations: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/api/platform`);
            if (res.ok) {
                const data = await res.json();
                setSettings({
                    maintenanceMode: data.maintenanceMode,
                    allowRegistrations: data.allowRegistrations
                });
            }
        } catch (err) {
            console.error("Failed to fetch settings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch(`${API_URL}/api/platform`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-uid': currentUser.uid
                },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Platform settings updated successfully.' });
                // Reload window to reflect global changes if needed, or rely on context
                // But context fetches only on mount. Maybe strict reload is safer for admin to see effect?
                // Actually, the main app will update on next refresh.
            } else {
                throw new Error('Failed to update settings');
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error updating settings. Ensure you are an admin.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage global configuration and access controls.</p>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="text-blue-500" size={20} />
                        Access Control
                    </h2>
                </div>

                <div className="p-6 space-y-6">
                    {/* Maintenance Mode Toggle */}
                    <div className={`flex items-start justify-between p-5 rounded-xl border transition-all ${settings.maintenanceMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[#1a1a1a] border-gray-800'}`}>
                        <div className="flex gap-4">
                            <div className={`mt-1 p-2 rounded-lg ${settings.maintenanceMode ? 'bg-amber-500/20 text-amber-500' : 'bg-gray-800 text-gray-400'}`}>
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className={`font-medium text-lg ${settings.maintenanceMode ? 'text-amber-500' : 'text-white'}`}>Maintenance Mode</h3>
                                <p className="text-sm text-gray-400 mt-1 max-w-md">
                                    When enabled, checking access for all non-admin users will show a "Under Maintenance" page.
                                    Admin users can still access the platform.
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer mt-2">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.maintenanceMode}
                                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                    </div>

                    {/* Registration Toggle */}
                    <div className={`flex items-start justify-between p-5 rounded-xl border transition-all ${!settings.allowRegistrations ? 'bg-red-500/10 border-red-500/30' : 'bg-[#1a1a1a] border-gray-800'}`}>
                        <div className="flex gap-4">
                            <div className={`mt-1 p-2 rounded-lg ${!settings.allowRegistrations ? 'bg-red-500/20 text-red-500' : 'bg-gray-800 text-gray-400'}`}>
                                {!settings.allowRegistrations ? <ShieldAlert size={24} /> : <UserPlus size={24} />}
                            </div>
                            <div>
                                <h3 className={`font-medium text-lg ${!settings.allowRegistrations ? 'text-red-400' : 'text-white'}`}>New Registrations</h3>
                                <p className="text-sm text-gray-400 mt-1 max-w-md">
                                    {settings.allowRegistrations
                                        ? "New users can sign up and create accounts."
                                        : "New registrations are currently disabled. Existing users can still log in."}
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer mt-2">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.allowRegistrations}
                                onChange={(e) => setSettings({ ...settings, allowRegistrations: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-600/20 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;
