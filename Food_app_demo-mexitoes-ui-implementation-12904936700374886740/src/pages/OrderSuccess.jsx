import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ordersAPI } from '../api/api';

export default function OrderSuccess() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        if (orderId) {
            ordersAPI.getHistory().then(({ data }) => {
                const found = data.find(o => o.id === orderId);
                if (found) setOrder(found);
            });
        }
    }, [orderId]);

    // Order number format: #MX-[last 4 chars of orderId] or #MX-8829 as fallback
    const orderNumber = order ? `#MX-${order.id.split('-')[0].substring(0, 4).toUpperCase()}` : '#MX-8829';

    return (
        <div className="flex-1 flex flex-col px-6 overflow-y-auto no-scrollbar pb-24 top-0 bg-background-dark relative">
            <header className="flex items-center justify-between py-6">
                <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
                <h1 className="text-sm font-bold tracking-widest text-slate-300 uppercase absolute left-1/2 -translate-x-1/2">
                    MEXITOS
                </h1>
                <div className="w-10"></div> {/* spacer */}
            </header>

            <div className="flex flex-col items-center flex-1 mt-6">
                {/* Glow + Icon */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-accent/10 blur-2xl rounded-full"></div>
                    <div className="relative w-28 h-28 rounded-full border border-white/5 flex items-center justify-center bg-white/5 backdrop-blur-md">
                        <div className="w-20 h-20 rounded-full border border-accent/20 flex items-center justify-center bg-accent/5">
                            <span className="material-symbols-outlined text-accent text-5xl font-light">check_circle</span>
                        </div>
                    </div>
                </div>

                <p className="text-accent text-sm font-bold tracking-[0.2em] mb-4 uppercase">
                    Success
                </p>

                <h2 className="text-3xl font-extrabold text-white text-center tracking-tight leading-tight mb-4">
                    Order Placed<br />Successfully!
                </h2>

                <p className="text-slate-400 text-center text-[15px] leading-relaxed px-4 italic">
                    "Good food is the foundation of genuine happiness."
                </p>

                {/* Info Card */}
                <div className="w-full bg-black/20 border border-white/10 rounded-[32px] p-7 mt-8 mb-6 backdrop-blur-sm relative overflow-hidden shadow-2xl">
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <span className="text-slate-500 text-xs font-semibold tracking-wider uppercase">Order Number</span>
                        <span className="text-white font-bold tracking-wide">{orderNumber}</span>
                    </div>

                    {/* Card Divider */}
                    <div className="h-px bg-white/5 w-full mb-6 relative z-10"></div>

                    <div className="flex justify-between items-center relative z-10">
                        <span className="text-slate-500 text-xs font-semibold tracking-wider uppercase">Est. Arrival</span>
                        <span className="text-accent font-bold tracking-wide">25 - 30 mins</span>
                    </div>
                </div>

                {/* Dots */}
                <div className="flex gap-3 justify-center mb-10 w-full">
                    <div className="w-2 h-2 rounded-full bg-accent/30"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/80"></div>
                    <div className="w-2 h-2 rounded-full bg-accent/30"></div>
                </div>
            </div>

            <div className="flex flex-col gap-4 w-full mt-auto mb-2">
                <button
                    onClick={() => navigate(`/tracking/${orderId}`)}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
                >
                    Contact Delivery Person
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-white font-bold py-4 rounded-full transition-transform active:scale-[0.98]"
                >
                    Go to Home
                </button>
            </div>
        </div>
    );
}
