import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ordersAPI } from '../api/api';

const STATUSES = ['placed', 'preparing', 'out_for_delivery', 'delivered'];
const STATUS_LABELS = {
  placed: 'Order Placed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};
const STATUS_TIMES = {
  placed: 'Just now',
  preparing: 'Est. 5-10 min',
  out_for_delivery: 'Est. 5-15 min',
  delivered: 'Delivered!',
};

export default function Tracking() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchOrder = async () => {
    if (!orderId) { setLoading(false); return; }
    try {
      const { data } = await ordersAPI.getById(orderId);
      setOrder(data);
      if (data.status === 'delivered') clearInterval(intervalRef.current);
    } catch {
      // ignore polling errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    intervalRef.current = setInterval(fetchOrder, 5000);
    return () => clearInterval(intervalRef.current);
  }, [orderId]);

  const currentStatusIdx = order ? STATUSES.indexOf(order.status) : 0;

  if (loading) {
    return <div className="min-h-screen bg-background-dark flex items-center justify-center"><span className="text-5xl animate-bounce">🌮</span></div>;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display antialiased overflow-hidden h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-md flex items-center justify-between p-4 pt-12 bg-gradient-to-b from-black/60 to-transparent pointer-events-auto">
          <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full bg-background-dark/80 text-white backdrop-blur-md shadow-lg border border-white/10">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <button onClick={() => navigate('/orders')} className="flex px-4 h-10 items-center justify-center rounded-full bg-background-dark/80 text-white backdrop-blur-md shadow-lg border border-white/10 text-sm font-bold">
            My Orders
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div className="relative w-full h-[55%] bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBPCzjihGjxlcu2DCVhTmPA7iMg240YRmAjvk0J1p-6Qhp4Zj2vHnq26sWjUvZTU8W7LsGEmCEZEt5YnwkToY-d62Ezi-ZpfhcXoBtsXnHn9Bp9m8s4f529P57-Ci9YYMbXITVChRtYYGElESHarc7p2i3KQHw_nJP33R0MiWxxT1DDMy5sbxfhGtQk6fKH13nh3pdOb-SdGS1mj92DFosvcsPFPslqVdIpUtLaBHdjz81xvCXZESR0aPLL9yJb96nc-TLCunvdN94')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/20 via-transparent to-background-dark/90"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 overflow-visible z-0 pointer-events-none">
            <path className="opacity-80 drop-shadow-[0_0_8px_rgba(236,109,19,0.6)]" d="M 20 200 Q 80 150 120 120 T 220 50" fill="none" stroke="#ec6d13" strokeDasharray="10 4" strokeLinecap="round" strokeWidth="6"></path>
          </svg>
          <div className="absolute top-[28%] left-[20%] flex flex-col items-center z-10">
            <div className="w-10 h-10 bg-background-dark rounded-full flex items-center justify-center border-2 border-primary shadow-lg">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>restaurant</span>
            </div>
          </div>
          <div className="absolute top-[18%] right-[18%] z-10">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-lg">
              <span className="material-symbols-outlined text-black" style={{ fontSize: '20px' }}>home</span>
            </div>
          </div>
          {order?.status !== 'delivered' && (
            <div className="absolute top-[45%] left-[45%] flex flex-col items-center z-20">
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping"></div>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-[0_4px_12px_rgba(236,109,19,0.5)] border-2 border-white relative z-10">
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>two_wheeler</span>
                </div>
              </div>
              <div className="mt-2 bg-background-dark/90 px-3 py-1 rounded-lg border border-white/10 backdrop-blur-sm shadow-xl">
                <span className="text-white text-xs font-bold whitespace-nowrap">On the way!</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="relative flex-1 -mt-6 bg-background-dark rounded-t-xl z-10 flex flex-col shadow-[0_-4px_24px_rgba(0,0,0,0.5)] border-t border-white/5">
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {order && (
            <>
              <div className="flex items-center justify-between mb-8 mt-4">
                <div>
                  <p className="text-primary text-sm font-semibold tracking-wide uppercase mb-1">
                    {order.status === 'delivered' ? 'Delivered!' : 'Estimated Arrival'}
                  </p>
                  <h1 className="text-white text-3xl font-bold tracking-tight">
                    {order.status === 'delivered' ? '✓ Done' : 'On its way!'}
                  </h1>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-white text-sm font-medium">{order.items_summary.split(',').length} Items</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative pl-4 border-l-2 border-white/10 space-y-8 mb-8">
                {STATUSES.map((status, idx) => {
                  const done = idx < currentStatusIdx;
                  const active = idx === currentStatusIdx;
                  return (
                    <div key={status} className="relative">
                      {done && <div className="absolute -left-[21px] top-0.5 bg-primary text-white rounded-full p-0.5 border-4 border-background-dark shadow-sm"><span className="material-symbols-outlined text-sm font-bold block">check</span></div>}
                      {active && <div className="absolute -left-[23px] top-0 bg-background-dark rounded-full p-1 border border-primary shadow-[0_0_10px_rgba(236,109,19,0.4)]"><div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div></div>}
                      {!done && !active && <div className="absolute -left-[19px] top-1 w-3 h-3 bg-white/20 rounded-full border-4 border-background-dark"></div>}
                      <div className="flex flex-col">
                        <h3 className={`text-base font-medium ?{done ? 'text-slate-400 line-through decoration-slate-600' : active ? 'text-white text-lg font-bold' : 'text-slate-500'}`}>
                          {STATUS_LABELS[status]}
                        </h3>
                        {active && <p className="text-primary text-sm mt-0.5">{STATUS_TIMES[status]}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Driver Card */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center border-2 border-white/10">
                      <span className="text-2xl">🏍️</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white text-background-dark text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center border border-background-dark">
                      4.9 <span className="material-symbols-outlined text-[10px] ml-0.5">star</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg leading-tight">Carlos R.</h4>
                    <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">electric_moped</span>
                      Black Scooter • HNX-402
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined">chat</span>
                  </button>
                  <button className="bg-primary hover:bg-[#d65f0e] shadow-[0_4px_12px_rgba(236,109,19,0.4)] text-white w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined">call</span>
                  </button>
                </div>
              </div>

              {order.status === 'delivered' && (
                <div className="mt-6 flex gap-3">
                  <button onClick={() => navigate('/orders')} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
                    View Orders
                  </button>
                  <button onClick={() => navigate('/menu')} className="flex-1 py-3 bg-surface-dark border border-white/10 text-white font-semibold rounded-xl hover:bg-white/5 transition-colors">
                    Order Again
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

