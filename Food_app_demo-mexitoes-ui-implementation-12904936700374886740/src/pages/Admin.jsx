import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('live');

    const fetchOrders = async () => {
        try {
            const { data } = await ordersAPI.getAdminAll();
            setOrders(data);
        } catch (err) {
            console.error(err);
            alert('Failed to load admin orders. Check console.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Auto-refresh every 15 seconds
        const interval = setInterval(fetchOrders, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleStatusChange = async (id, status) => {
        try {
            await ordersAPI.updateStatus(id, status);
            // Optimistic update
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const statusColors = {
        placed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        preparing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        out_for_delivery: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
    };

    const formatTime = (isoString) => {
        const d = new Date(isoString);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="flex-1 min-h-screen bg-background-dark flex items-center justify-center">
                <img src="/logo.png" alt="Loading" className="w-32 h-auto animate-pulse drop-shadow-2xl" />
            </div>
        );
    }

    return (
        <div className="flex-1 w-full bg-background-dark text-white overflow-y-auto no-scrollbar pb-24 h-screen">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-surface-highlight w-full pt-10 pb-4 px-4 flex items-center justify-between shadow-xl shadow-black/20">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="rounded-full p-2 bg-surface-dark hover:bg-surface-highlight transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-wide">Live Orders</h1>
                        <p className="text-xs text-slate-400 mt-0.5">Admin Dashboard • Auto-updates 15s</p>
                    </div>
                </div>
                <button onClick={fetchOrders} className="rounded-full p-2 bg-primary/20 hover:bg-primary/30 text-primary transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 mb-4 sticky top-[88px] z-10 bg-background-dark/95 backdrop-blur-md">
                <button
                    onClick={() => setActiveTab('live')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'live' ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
                >
                    Live Orders
                </button>
                <button
                    onClick={() => setActiveTab('delivered')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'delivered' ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
                >
                    Delivered History
                </button>
            </div>

            {/* Orders List */}
            <div className="p-4 space-y-4 pt-0">
                {orders.filter(o => activeTab === 'live' ? o.status !== 'delivered' : o.status === 'delivered').length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 text-slate-500">
                        <span className="material-symbols-outlined text-5xl mb-3 opacity-50">receipt_long</span>
                        <p>No {activeTab} orders found.</p>
                    </div>
                ) : (
                    orders.filter(o => activeTab === 'live' ? o.status !== 'delivered' : o.status === 'delivered').map(order => (
                        <div key={order.id} className="bg-surface-dark border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                            {/* Highlight bar base on status */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${order.status === 'delivered' ? 'bg-green-500' : 'bg-primary'}`}></div>

                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-300">#{order.id.split('-')[0].toUpperCase()}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{formatTime(order.created_at)}</p>
                                </div>
                                <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${statusColors[order.status] || statusColors.placed}`}>
                                    {order.status.replace(/_/g, ' ')}
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="mb-4 p-3 bg-black/20 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="material-symbols-outlined text-[14px] text-primary">person</span>
                                    <span className="text-sm font-semibold text-slate-200">{order.users?.name || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="material-symbols-outlined text-[14px] text-primary">phone</span>
                                    <span className="text-xs text-slate-400">{order.users?.phone || 'No phone'}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">location_on</span>
                                    <span className="text-xs text-slate-400 capitalize">{order.users?.address || 'Pickup / No address'}</span>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="mb-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 border-b border-white/10 pb-1">Order Items</p>
                                <ul className="space-y-1.5">
                                    {order.items?.map(item => (
                                        <li key={item.id} className="flex justify-between text-sm">
                                            <span className="text-slate-300"><span className="text-primary font-bold">{item.quantity}x</span> {item.name}</span>
                                        </li>
                                    ))}
                                    {(!order.items || order.items.length === 0) && (
                                        <li className="text-xs text-slate-500 italic">{order.items_summary}</li>
                                    )}
                                </ul>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                                    <span className="text-sm font-semibold text-slate-400">Total</span>
                                    <span className="text-base font-bold text-white">₹{order.total}</span>
                                </div>
                            </div>

                            {/* Actions (Only show for live orders) */}
                            {activeTab === 'live' && (
                                <div className="flex gap-2 mt-4 pt-2">
                                    <button
                                        onClick={() => handleStatusChange(order.id, 'preparing')}
                                        disabled={order.status === 'preparing'}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${order.status === 'preparing' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 'bg-surface-highlight text-white hover:bg-yellow-500/20 hover:text-yellow-400'}`}
                                    >
                                        PREPARE
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(order.id, 'out_for_delivery')}
                                        disabled={order.status === 'out_for_delivery'}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${order.status === 'out_for_delivery' ? 'bg-purple-500/20 text-purple-500 border border-purple-500/30' : 'bg-surface-highlight text-white hover:bg-purple-500/20 hover:text-purple-400'}`}
                                    >
                                        DISPATCH
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(order.id, 'delivered')}
                                        disabled={order.status === 'delivered'}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${order.status === 'delivered' ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-surface-highlight text-white hover:bg-green-500/20 hover:text-green-400'}`}
                                    >
                                        DELIVER
                                    </button>
                                </div>
                            )}

                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
