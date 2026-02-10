import React from 'react';
import { Save } from 'lucide-react';

const AdminSettings = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Admin Settings</h1>

            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Platform Configuration</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                        <div>
                            <h3 className="font-medium text-white">Maintenance Mode</h3>
                            <p className="text-sm text-gray-400">Disable access for non-admin users</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                        <div>
                            <h3 className="font-medium text-white">Allow New Registrations</h3>
                            <p className="text-sm text-gray-400">Toggle user signups</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                    <Save className="w-4 h-4" /> Save Changes
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;
