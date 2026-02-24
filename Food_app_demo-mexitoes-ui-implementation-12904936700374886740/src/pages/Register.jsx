import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await register(form.name, form.email, form.password, form.phone);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center px-6 py-12">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40 mb-4">
                    <span className="text-4xl">🌮</span>
                </div>
                <h1 className="text-3xl font-extrabold text-white">Mexitoes</h1>
                <p className="text-slate-400 text-sm mt-1">The real taste of Mexico</p>
            </div>

            <div className="w-full max-w-sm bg-surface-dark border border-white/10 rounded-3xl p-7 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-6">Create your account 🎉</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                        { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Alejandro Rodriguez' },
                        { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com' },
                        { label: 'Phone (optional)', name: 'phone', type: 'tel', placeholder: '+1 555 000 0000' },
                        { label: 'Password', name: 'password', type: 'password', placeholder: 'Min 6 characters' },
                    ].map(field => (
                        <div key={field.name}>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                                {field.label}
                            </label>
                            <input
                                type={field.type}
                                name={field.name}
                                required={field.name !== 'phone'}
                                value={form[field.name]}
                                onChange={handleChange}
                                placeholder={field.placeholder}
                                className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
                            />
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                    >
                        {loading
                            ? <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                            : 'Create Account'
                        }
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-400 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-bold hover:text-orange-400 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
