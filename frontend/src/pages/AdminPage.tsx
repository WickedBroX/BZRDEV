import React, { useState } from 'react';
import axios from 'axios';
import { useSettings } from '../contexts/SettingsContext';
import { Loader2, Save, Trash2, Plus, RefreshCw } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const AdminPage: React.FC = () => {
  const { general, socials, refreshSettings } = useSettings();
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'socials' | 'apikeys'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [editGeneral, setEditGeneral] = useState(general);
  const [editSocials, setEditSocials] = useState(socials);
  const [apiKeyEtherscan, setApiKeyEtherscan] = useState('');
  const [apiKeyCronos, setApiKeyCronos] = useState('');

  // Initial load of form state from context
  React.useEffect(() => {
    setEditGeneral(general);
    setEditSocials(socials);
  }, [general, socials]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/admin/login`, { password });
      setToken(data.token);
      localStorage.setItem('adminToken', data.token);
      setMessage(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Invalid password' });
    } finally {
      setIsLoading(false);
    }
  };

  const authenticatedAxios = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  const saveGeneral = async () => {
    setIsLoading(true);
    try {
      await authenticatedAxios.post('/api/admin/settings', { key: 'general', value: editGeneral });
      setMessage({ type: 'success', text: 'General settings saved!' });
      refreshSettings();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save general settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSocials = async () => {
    setIsLoading(true);
    try {
      await authenticatedAxios.post('/api/admin/settings', { key: 'socials', value: editSocials });
      setMessage({ type: 'success', text: 'Social links saved!' });
      refreshSettings();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save social links' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiKeys = async () => {
    setIsLoading(true);
    try {
      const keys = { etherscan: apiKeyEtherscan, cronos: apiKeyCronos };
      await authenticatedAxios.post('/api/admin/settings', { key: 'apiKeys', value: keys });
      setMessage({ type: 'success', text: 'API Keys saved! Backend will pick them up shortly.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save API keys' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
          <h2 className="text-xl font-bold mb-6 text-gray-900">Admin Login</h2>
          {message && (
            <div className={`p-3 rounded mb-4 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message.text}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={() => { setToken(''); localStorage.removeItem('adminToken'); }}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Logout
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 flex items-center justify-between ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="hover:opacity-75"><Trash2 size={16} /></button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-4 text-sm font-medium ${activeTab === 'general' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`px-6 py-4 text-sm font-medium ${activeTab === 'socials' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('socials')}
          >
            Social Links
          </button>
          <button
            className={`px-6 py-4 text-sm font-medium ${activeTab === 'apikeys' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('apikeys')}
          >
            API Keys
          </button>
        </div>

        <div className="p-6">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 p-2.5"
                  value={editGeneral.logoUrl || ''}
                  onChange={(e) => setEditGeneral({ ...editGeneral, logoUrl: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Token Address</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 p-2.5 font-mono"
                  value={editGeneral.tokenAddress || ''}
                  onChange={(e) => setEditGeneral({ ...editGeneral, tokenAddress: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Supply</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-gray-300 p-2.5"
                  value={editGeneral.maxSupply || ''}
                  onChange={(e) => setEditGeneral({ ...editGeneral, maxSupply: Number(e.target.value) })}
                />
              </div>
              <button
                onClick={saveGeneral}
                disabled={isLoading}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save Changes
              </button>
            </div>
          )}

          {/* SOCIALS TAB */}
          {activeTab === 'socials' && (
            <div className="space-y-4">
              {editSocials.map((link, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <input
                    type="text"
                    className="w-1/3 rounded-lg border border-gray-300 p-2"
                    placeholder="Name (e.g. Website)"
                    value={link.name}
                    onChange={(e) => {
                      const newSocials = [...editSocials];
                      newSocials[index].name = e.target.value;
                      setEditSocials(newSocials);
                    }}
                  />
                  <input
                    type="text"
                    className="flex-1 rounded-lg border border-gray-300 p-2"
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => {
                      const newSocials = [...editSocials];
                      newSocials[index].url = e.target.value;
                      setEditSocials(newSocials);
                    }}
                  />
                  <button
                    onClick={() => setEditSocials(editSocials.filter((_, i) => i !== index))}
                    className="text-red-500 hover:bg-red-50 p-2 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setEditSocials([...editSocials, { name: '', url: '' }])}
                className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800"
              >
                <Plus size={18} /> Add Link
              </button>
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={saveSocials}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Save Socials
                </button>
              </div>
            </div>
          )}

          {/* API KEYS TAB */}
          {activeTab === 'apikeys' && (
            <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Security Note</p>
                    These keys are stored in the database. When set, they override the environment variables (ETHERSCAN_V2_API_KEY).
                    The backend checks for updates every minute.
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Etherscan API Keys (Comma separated)</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 p-2.5 h-32 font-mono text-sm"
                  placeholder="key1, key2, key3..."
                  value={apiKeyEtherscan}
                  onChange={(e) => setApiKeyEtherscan(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cronos API Key</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 p-2.5 font-mono text-sm"
                  value={apiKeyCronos}
                  onChange={(e) => setApiKeyCronos(e.target.value)}
                />
              </div>
              <button
                onClick={saveApiKeys}
                disabled={isLoading}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save Keys
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
