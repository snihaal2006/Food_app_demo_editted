import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../api/api';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, cartSubtotal, cartTax, cartTotal, updateQuantity, loading } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'mexitoes10') setPromoApplied(true);
  };

  const handlePlaceOrder = async () => {
    if (placing || cartItems.length === 0) return;
    setPlacing(true);
    try {
      const { data } = await ordersAPI.placeOrder();
      navigate(`/tracking/${data.id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <span className="text-4xl animate-bounce">🌮</span>
      </div>
    );
  }

  const discount = promoApplied ? cartSubtotal * 0.1 : 0;
  const finalTotal = cartTotal - discount;

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl overflow-hidden pb-24 bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased">
      <header className="flex items-center p-4 pb-2 justify-between sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">My Cart</h2>
      </header>

      {cartItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-20">
          <span className="text-7xl">🛒</span>
          <h3 className="text-xl font-bold text-white">Your cart is empty</h3>
          <p className="text-slate-400 text-sm text-center">Add some delicious items from our menu!</p>
          <Link to="/menu" className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors">
            Browse Menu
          </Link>
        </div>
      ) : (
        <>
          {/* Cart Items List */}
          <div className="flex flex-col gap-4 px-4 pt-4">
            {cartItems.map(item => (
              <div key={item.menu_item_id} className="flex items-center gap-4 bg-white dark:bg-[#2e231b] p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="bg-center bg-no-repeat bg-cover rounded-xl size-20 shrink-0" style={{ backgroundImage: `url("${item.image_url}")` }}></div>
                <div className="flex flex-col flex-1 gap-1">
                  <div className="flex justify-between items-start">
                    <p className="text-base font-bold leading-snug line-clamp-1">{item.name}</p>
                    <p className="text-primary font-bold text-base">₹{(item.price * item.quantity).toFixed(0)}</p>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">₹{item.price.toFixed(0)} each</p>
                  <div className="flex items-center justify-between gap-3 mt-2">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900/50 rounded-full p-1">
                      <button onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)} className="size-7 flex items-center justify-center rounded-full bg-white dark:bg-[#3d2f25] text-slate-900 dark:text-white shadow-sm hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[16px]">{item.quantity === 1 ? 'delete' : 'remove'}</span>
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)} className="size-7 flex items-center justify-center rounded-full bg-primary text-white shadow-sm hover:bg-primary/90 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-800 mx-4 my-6"></div>

          {/* Payment Method */}
          <div className="px-4 mt-2">
            <h3 className="text-lg font-bold tracking-tight mb-3">Payment Method</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'card', icon: 'credit_card', label: 'Card', sub: '**** 4242' },
                { id: 'wallet', icon: 'account_balance_wallet', label: 'Wallet', sub: '' },
                { id: 'cash', icon: 'payments', label: 'Cash', sub: '' },
              ].map(method => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-start p-3 min-w-[100px] rounded-2xl border-2 relative cursor-pointer transition-all ${paymentMethod === method.id ? 'bg-primary/10 border-primary' : 'bg-white dark:bg-[#2e231b] border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                >
                  {paymentMethod === method.id && <div className="absolute top-2 right-2 text-primary"><span className="material-symbols-outlined text-[20px]">check_circle</span></div>}
                  <span className={`material-symbols-outlined mb-2 text-3xl ${paymentMethod === method.id ? 'text-primary' : 'text-slate-400'}`}>{method.icon}</span>
                  <span className={`text-sm font-bold ${paymentMethod === method.id ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}>{method.label}</span>
                  {method.sub && <span className={`text-[10px] font-medium ${paymentMethod === method.id ? 'text-primary/70' : 'text-slate-400'}`}>{method.sub}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Promo Code */}
          <div className="px-4 mt-6">
            <div className="flex items-center gap-2 bg-white dark:bg-[#2e231b] p-2 pr-2 pl-4 rounded-full border border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-slate-400">sell</span>
              <input
                className="bg-transparent border-none outline-none flex-1 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 p-0"
                placeholder={promoApplied ? 'MEXITOES10 applied! 🎉' : 'Enter Promo Code'}
                type="text"
                value={promoApplied ? '' : promoCode}
                onChange={e => setPromoCode(e.target.value)}
                disabled={promoApplied}
              />
              <button onClick={handleApplyPromo} className={`text-xs font-bold py-2 px-4 rounded-full transition-colors ${promoApplied ? 'bg-green-500 text-white' : 'bg-slate-900 dark:bg-slate-700 hover:bg-primary text-white'}`}>
                {promoApplied ? 'Applied' : 'APPLY'}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="px-4 mt-6 mb-8">
            <h3 className="text-lg font-bold tracking-tight mb-3">Order Summary</h3>
            <div className="bg-white dark:bg-[#2e231b] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                <span className="font-semibold">₹{cartSubtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">Delivery Fee</span>
                <span className="font-semibold text-primary">Free</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-500">Promo (10%)</span>
                  <span className="font-semibold text-green-500">-₹{discount.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">Tax (8%)</span>
                <span className="font-semibold">₹{cartTax.toFixed(0)}</span>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
              <div className="flex justify-between items-center text-base font-bold">
                <span>Total</span>
                <span className="text-xl text-primary">₹{finalTotal.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Sticky Place Order */}
          <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center w-full pointer-events-none">
            <div className="w-full max-w-md p-4 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 pointer-events-auto">
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg h-14 rounded-full flex items-center justify-between px-6 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                <span>{placing ? 'Placing Order...' : 'Place Order'}</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">₹{finalTotal.toFixed(0)}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
