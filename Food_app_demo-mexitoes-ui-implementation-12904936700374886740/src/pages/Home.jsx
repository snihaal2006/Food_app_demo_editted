import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { menuAPI } from '../api/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const { addToCart, updateQuantity, cartItems, cartCount, cartTotal } = useCart();

  const getItemQty = (id) => {
    const c = cartItems.find(i => i.menu_item_id === id);
    return c ? c.quantity : 0;
  };
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    menuAPI.getAll().then(({ data }) => {
      setFeatured(data.sort((a, b) => b.rating - a.rating).slice(0, 3));
    });
  }, []);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await menuAPI.getAll({ search });
        setSearchResults(data);
      } finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAdd = async (e, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(itemId, 1);
  };

  const handleQtyChange = async (e, itemId, delta) => {
    e.preventDefault();
    e.stopPropagation();
    const qty = getItemQty(itemId);
    await updateQuantity(itemId, qty + delta);
  };

  const displayItems = search.trim() ? searchResults : featured;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
      {/* Header Section */}
      <header className="sticky top-0 z-50 bg-background-dark px-4 pt-10 pb-4 border-b border-surface-highlight">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Delivering to</p>
            <button className="flex items-center gap-1 group">
              <span className="text-primary text-2xl material-symbols-outlined">location_on</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate max-w-[180px]">
                {user?.address?.split(',')[0] || 'Set your address'}
              </span>
              <span className="text-slate-400 text-xl material-symbols-outlined">expand_more</span>
            </button>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="relative p-2 rounded-full bg-surface-highlight text-white hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined">notifications</span>
            {cartCount > 0 && <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background-dark"></span>}
          </button>
        </div>
        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">
              {searching ? 'progress_activity' : 'search'}
            </span>
          </div>
          <input
            className="block w-full pl-12 pr-4 py-3.5 bg-surface-dark border-none rounded-full text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:bg-surface-highlight transition-all shadow-sm"
            placeholder="Momos, starters, biryani..."
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          )}
        </div>
      </header>

      {/* Banners — only when not searching */}
      {!search && (
        <section className="pl-4 mt-6">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pr-4 pb-2">
            <div className="relative min-w-[300px] h-44 rounded-3xl overflow-hidden shrink-0 group">
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>
              <img
                alt="Quick Bites"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://images.unsplash.com/photo-1704963925502-7c5c23791fb1?w=600&q=80"
                onError={(e) => { e.target.src = 'https://dummyimage.com/600x400/ea580c/fff&text=Quick+Bites' }}
              />
              <div className="relative z-20 h-full flex flex-col justify-center p-6">
                <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded-full mb-2 w-fit">🍢 QUICK BITES</span>
                <h3 className="text-2xl font-bold text-white leading-tight mb-1">Momos &amp;<br />Burgers</h3>
                <p className="text-slate-200 text-sm mb-4">Starting at ₹80</p>
                <Link to="/menu?category=Quick+Bites" className="bg-white text-primary px-4 py-2 rounded-full text-xs font-bold w-fit hover:bg-slate-100 transition-colors">Order Now</Link>
              </div>
            </div>
            <div className="relative min-w-[300px] h-44 rounded-3xl overflow-hidden shrink-0 group">
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>
              <img
                alt="Starters"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80"
                onError={(e) => { e.target.src = 'https://dummyimage.com/600x400/dc2626/fff&text=Starters' }}
              />
              <div className="relative z-20 h-full flex flex-col justify-center p-6">
                <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full mb-2 w-fit">🍗 STARTERS</span>
                <h3 className="text-2xl font-bold text-white leading-tight mb-1">Kerala &amp;<br />555 Chicken</h3>
                <p className="text-slate-200 text-sm mb-4">Starting at ₹60</p>
                <Link to="/menu?category=Starters" className="bg-white text-red-600 px-4 py-2 rounded-full text-xs font-bold w-fit hover:bg-slate-100 transition-colors">Explore</Link>
              </div>
            </div>
            <div className="relative min-w-[300px] h-44 rounded-3xl overflow-hidden shrink-0 group">
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>
              <img
                alt="Masalas"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80"
                onError={(e) => { e.target.src = 'https://dummyimage.com/600x400/ca8a04/fff&text=Masalas' }}
              />
              <div className="relative z-20 h-full flex flex-col justify-center p-6">
                <span className="inline-block px-3 py-1 bg-yellow-600 text-white text-xs font-bold rounded-full mb-2 w-fit">🍛 MASALAS</span>
                <h3 className="text-2xl font-bold text-white leading-tight mb-1">Rich Curries &amp;<br />Gravies</h3>
                <p className="text-slate-200 text-sm mb-4">Starting at ₹90</p>
                <Link to="/menu?category=Masalas" className="bg-white text-yellow-600 px-4 py-2 rounded-full text-xs font-bold w-fit hover:bg-slate-100 transition-colors">Order Now</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Grid — only when not searching */}
      {!search && (
        <section className="px-4 mt-6">
          <div className="flex justify-between items-start gap-2">
            {[
              { label: 'Quick Bites', emoji: '🍢', cat: 'Quick Bites' },
              { label: 'Starters', emoji: '🍗', cat: 'Starters' },
              { label: 'Masalas', emoji: '🍛', cat: 'Masalas' },
              { label: 'Pasta', emoji: '🍝', cat: 'Pasta' },
            ].map(({ label, emoji, cat }) => (
              <Link to={`/menu?category=${encodeURIComponent(cat)}`} key={cat} className="flex flex-col items-center gap-2 group w-1/4">
                <div className="h-16 w-16 rounded-full bg-surface-dark flex items-center justify-center border border-surface-highlight group-hover:border-primary group-hover:bg-surface-highlight transition-all shadow-lg">
                  <span className="text-3xl">{emoji}</span>
                </div>
                <span className="text-xs font-medium text-slate-400 group-hover:text-primary transition-colors text-center">{label}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular / Search Results */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {search ? `"${search}" results` : 'Popular Near You 🔥'}
          </h2>
          {!search && <Link to="/menu" className="text-primary text-sm font-semibold hover:text-orange-400">View All</Link>}
        </div>

        {displayItems.length === 0 && search && (
          <div className="text-center py-12 text-slate-500">No items found for "{search}"</div>
        )}

        <div className="flex flex-col gap-6">
          {displayItems.map(item => (
            <Link key={item.id} to="/menu" className="bg-surface-dark rounded-3xl overflow-hidden shadow-lg border border-surface-highlight hover:border-primary/50 transition-colors group">
              <div className="relative h-48 w-full">
                <img
                  alt={item.name}
                  className="w-full h-full object-cover"
                  src={item.image_url}
                  onError={(e) => { e.target.src = `https://dummyimage.com/400x300/1e293b/fff&text=${encodeURIComponent(item.name)}` }}
                />
                <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md border border-white/20 p-1.5 rounded-full">
                  <button className="text-white hover:text-primary transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>favorite</span>
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 bg-white text-black text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-md">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {item.prep_time}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-bold text-white truncate pr-2">{item.name}</h3>
                  <div className="flex items-center gap-1 bg-green-900/40 px-2 py-0.5 rounded-lg border border-green-700">
                    <span className="text-green-400 text-xs font-bold">{item.rating}</span>
                    <span className="material-symbols-outlined text-[12px] text-green-400">star</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-4 line-clamp-1">{item.description}</p>
                <div className="flex items-center justify-between border-t border-surface-highlight pt-3">
                  <span className="text-primary font-bold text-lg">₹{item.price.toFixed(0)}</span>
                  {getItemQty(item.id) === 0 ? (
                    <button
                      onClick={(e) => handleAdd(e, item.id)}
                      className="bg-primary hover:bg-orange-600 text-white rounded-full px-5 py-2.5 text-sm font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20"
                    >
                      Add <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 bg-black/40 rounded-full border border-white/10 p-1">
                      <button onClick={(e) => handleQtyChange(e, item.id, -1)} className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10">
                        <span className="material-symbols-outlined text-[16px]">{getItemQty(item.id) === 1 ? 'delete' : 'remove'}</span>
                      </button>
                      <span className="text-sm font-bold text-white px-2">{getItemQty(item.id)}</span>
                      <button onClick={(e) => handleQtyChange(e, item.id, 1)} className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Floating Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-28 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="w-full max-w-md px-4 pointer-events-auto">
            <Link to="/cart" className="w-full bg-primary text-white p-4 rounded-2xl shadow-2xl shadow-orange-900/50 flex items-center justify-between hover:bg-orange-600 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="bg-black/20 h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm">{cartCount}</div>
                <span className="font-bold">View Cart</span>
              </div>
              <span className="font-extrabold text-lg">₹{cartTotal.toFixed(0)}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
