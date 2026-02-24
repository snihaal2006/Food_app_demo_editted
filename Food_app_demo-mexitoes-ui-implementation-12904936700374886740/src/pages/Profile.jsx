import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    profileAPI.get().then(({ data }) => {
      setProfile(data);
      setForm({ name: data.name, phone: data.phone || '', address: data.address || '' });
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await profileAPI.update(form);
      setProfile(data);
      updateUser(data);
      setEditing(false);
      setMessage('Profile updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tierColors = {
    Standard: 'from-slate-500 to-slate-600',
    Silver: 'from-slate-400 to-slate-500',
    Gold: 'from-primary to-accent',
    Platinum: 'from-purple-500 to-indigo-600',
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center w-full max-w-md mx-auto pb-24">
      <div className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-[#392f28] w-full">
        <div className="flex items-center justify-between p-4 pt-12 pb-3 w-full">
          <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white flex items-center justify-center rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <h2 className="text-lg font-bold leading-tight">My Profile</h2>
          <button onClick={() => setEditing(!editing)} className="text-primary flex items-center justify-center rounded-full p-2 hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-[24px]">{editing ? 'close' : 'edit'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="w-full px-4 mt-3">
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm text-center">{message}</div>
        </div>
      )}

      {/* Profile Header */}
      <div className="flex flex-col items-center w-full px-6 py-8">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary-dark/50 border-4 border-surface-dark shadow-xl flex items-center justify-center">
          <span className="text-5xl">👤</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white text-center">{profile?.name || user?.name}</h1>
        <p className="text-slate-500 dark:text-[#b9a89d] text-sm font-medium mt-1">{profile?.email || user?.email}</p>
        <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${tierColors[profile?.loyalty_tier] || 'from-primary to-accent'} rounded-full shadow-lg`}>
          <span className="material-symbols-outlined text-white text-[20px]">verified</span>
          <span className="text-white text-sm font-bold tracking-wide uppercase">Mexitoes {profile?.loyalty_tier || 'Standard'}</span>
        </div>
      </div>

      {/* Edit Form */}
      {editing ? (
        <div className="w-full px-4 space-y-4 mb-6">
          {[
            { label: 'Name', key: 'name', type: 'text' },
            { label: 'Phone', key: 'phone', type: 'tel' },
            { label: 'Delivery Address', key: 'address', type: 'text' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{field.label}</label>
              <input
                type={field.type}
                value={form[field.key]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>
          ))}
          <button onClick={handleSave} disabled={saving} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      ) : (
        <div className="w-full px-4 space-y-3">
          {[
            { icon: 'edit', label: 'Edit Profile', sub: '', action: () => setEditing(true) },
            { icon: 'location_on', label: 'Delivery Address', sub: profile?.address || 'Not set', action: () => setEditing(true) },
            { icon: 'phone', label: 'Phone', sub: profile?.phone || 'Not set', action: () => setEditing(true) },
            { icon: 'receipt_long', label: 'Order History', sub: '', action: () => navigate('/orders') },
            { icon: 'admin_panel_settings', label: 'Admin Dashboard', sub: 'Manage live orders', action: () => navigate('/admin') },
            { icon: 'credit_card', label: 'Payment Methods', sub: '', action: () => { } },
            { icon: 'support_agent', label: 'Refunds & Support', sub: '', action: () => { } },
          ].map(item => (
            <button key={item.label} onClick={item.action} className="w-full group flex items-center justify-between p-4 bg-white dark:bg-[#27201c] rounded-2xl hover:bg-gray-50 dark:hover:bg-[#322a25] transition-all border border-transparent hover:border-primary/20">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 dark:bg-primary-dark/20 text-primary">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-base font-semibold text-slate-900 dark:text-white">{item.label}</span>
                  {item.sub && <span className="text-xs text-slate-500 dark:text-[#b9a89d] truncate max-w-[200px]">{item.sub}</span>}
                </div>
              </div>
              <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">chevron_right</span>
            </button>
          ))}
        </div>
      )}

      {/* Logout */}
      <div className="mt-8 w-full px-4 flex flex-col items-center gap-4">
        <button onClick={handleLogout} className="w-full py-4 rounded-full border border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold tracking-wide transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Logout
        </button>
        <p className="text-xs text-slate-400 dark:text-[#6b5d54]">App Version 1.0.0</p>
      </div>
    </div>
  );
}
