import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI, cartAPI } from '../api/api';
import { useCart } from '../context/CartContext';

const STATUS_COLOR = {
  placed: 'bg-blue-500/10 text-blue-400',
  preparing: 'bg-yellow-500/10 text-yellow-400',
  out_for_delivery: 'bg-accent/10 text-accent',
  delivered: 'bg-green-500/10 text-green-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

const STATUS_LABEL = {
  placed: 'Order Placed',
  preparing: 'Preparing',
  out_for_delivery: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('past');

  useEffect(() => {
    ordersAPI.getHistory()
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  const pastOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');
  const upcomingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const displayed = activeTab === 'past' ? pastOrders : upcomingOrders;

  const handleReorder = async (order) => {
    try {
      for (const item of order.items || []) {
        await cartAPI.addItem(item.menu_item_id, item.quantity);
      }
      await fetchCart();
      navigate('/cart');
    } catch {
      navigate('/cart');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + ' UTC');
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) + ' • ' +
      d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  };

  if (loading) {
    return <div className="min-h-screen bg-background-dark flex items-center justify-center"><span className="text-5xl animate-bounce">🍛</span></div>;
  }

  return (
    <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto pb-24">
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-surface-highlight px-4 pt-4 pb-2 -mx-4 -mt-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-surface-highlight transition-colors text-slate-900 dark:text-white">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h1 className="text-lg font-bold text-center flex-1 pr-10">My Orders</h1>
        </div>
        <div className="flex gap-2 pb-2">
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${activeTab === 'past' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-200 dark:bg-surface-highlight text-slate-600 dark:text-slate-400'}`}
          >
            Past Orders ({pastOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${activeTab === 'upcoming' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-200 dark:bg-surface-highlight text-slate-600 dark:text-slate-400'}`}
          >
            Upcoming ({upcomingOrders.length})
          </button>
        </div>
      </header>

      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="text-6xl">📋</span>
          <p className="text-white font-bold text-lg">No {activeTab === 'past' ? 'past' : 'upcoming'} orders</p>
          <button onClick={() => navigate('/menu')} className="bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary-dark transition-colors">
            Order Now
          </button>
        </div>
      ) : (
        displayed.map(order => (
          <div key={order.id} className={`bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-slate-100 dark:border-surface-highlight flex flex-col gap-4 ${order.status === 'cancelled' ? 'opacity-75' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary-dark/50 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-2xl">🍛</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">Quick Bites Restaurant</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatDate(order.created_at)}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${STATUS_COLOR[order.status] || 'bg-slate-500/10 text-slate-400'}`}>
                  {STATUS_LABEL[order.status] || order.status}
                </span>
                <span className={`font-bold text-slate-900 dark:text-white ${order.status === 'cancelled' ? 'line-through decoration-slate-500 decoration-2 text-slate-500' : ''}`}>
                  ₹{order.total.toFixed(0)}
                </span>
              </div>
            </div>

            <div className="py-2 border-t border-dashed border-slate-200 dark:border-surface-highlight">
              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{order.items_summary}</p>
            </div>

            <div className="flex gap-3 pt-1">
              {order.status === 'delivered' && (
                <button onClick={() => handleReorder(order)} className="flex-1 h-10 rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-[18px]">refresh</span>Reorder
                </button>
              )}
              {(order.status === 'placed' || order.status === 'preparing' || order.status === 'out_for_delivery') && (
                <button onClick={() => navigate(`/tracking/${order.id}`)} className="flex-1 h-10 rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>Track Order
                </button>
              )}
              <button className="flex-1 h-10 rounded-full border border-slate-200 dark:border-surface-highlight bg-transparent hover:bg-slate-50 dark:hover:bg-surface-highlight text-slate-900 dark:text-white text-sm font-medium flex items-center justify-center gap-2 transition-all">
                <span className="material-symbols-outlined text-[18px]">star</span>Rate
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
