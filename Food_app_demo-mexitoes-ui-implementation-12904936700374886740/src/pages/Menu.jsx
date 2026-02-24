import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { menuAPI } from '../api/api';
import { useCart } from '../context/CartContext';

const CATEGORY_EMOJI = {
  'Quick Bites': '🍢',
  'Starters': '🍗',
  'Masalas': '🍛',
  'Pasta': '🍝',
};

export default function Menu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [loadingItem, setLoadingItem] = useState(null);
  const searchTimeout = useRef(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { addToCart, updateQuantity, cartItems, cartCount, cartTotal } = useCart();

  const getItemQty = (id) => {
    const c = cartItems.find(i => i.menu_item_id === id);
    return c ? c.quantity : 0;
  };

  useEffect(() => {
    const initialCat = searchParams.get('category') || 'All';
    setActiveCategory(initialCat);
    menuAPI.getCategories().then(({ data }) => setCategories(['All', ...data]));
    fetchItems({ category: initialCat !== 'All' ? initialCat : undefined });
  }, []);

  const fetchItems = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await menuAPI.getAll(params);
      setItems(vegOnly ? data.filter(i => i.is_veg) : data);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSearch('');
    fetchItems({ category: cat !== 'All' ? cat : undefined });
  };

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    if (!val.trim()) { fetchItems({ category: activeCategory !== 'All' ? activeCategory : undefined }); return; }
    searchTimeout.current = setTimeout(() => fetchItems({ search: val }), 300);
  };

  const handleAddToCart = async (e, id) => {
    e.stopPropagation();
    setLoadingItem(id);
    await addToCart(id, 1);
    setLoadingItem(null);
  };

  const handleQtyChange = async (e, id, delta) => {
    e.stopPropagation();
    const qty = getItemQty(id);
    await updateQuantity(id, qty + delta);
  };

  const displayed = vegOnly ? items.filter(i => i.is_veg) : items;

  return (
    <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar bg-background-dark pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-dark px-4 pt-10 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <h1 className="text-2xl font-extrabold text-white">Our Menu</h1>
        </div>
        <div className="relative mb-3">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 material-symbols-outlined text-[20px]">search</span>
          <input
            className="w-full pl-9 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Search momos, starters, pasta..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
          {search && <button onClick={() => handleSearch('')} className="absolute inset-y-0 right-3 flex items-center text-slate-400"><span className="material-symbols-outlined text-[18px]">close</span></button>}
        </div>
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${activeCategory === cat ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'}`}
            >
              {CATEGORY_EMOJI[cat] || ''} {cat}
            </button>
          ))}
          <button
            onClick={() => setVegOnly(v => !v)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 border transition-colors ${vegOnly ? 'bg-green-600 text-white border-green-600' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
          >
            🌿 Veg Only
          </button>
        </div>
      </header>

      {/* Items Grid */}
      <div className="px-4 mt-4">
        {loading ? (
          <div className="flex justify-center py-20"><span className="text-4xl animate-bounce">🍛</span></div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 text-slate-500">No items found</div>
        ) : (
          <div className="flex flex-col gap-4">
            {displayed.map(item => {
              const qty = getItemQty(item.id);
              return (
                <div key={item.id} className="flex gap-3 bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/30 transition-colors p-3">
                  <div className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = `https://dummyimage.com/400x300/1e293b/fff&text=${encodeURIComponent(item.name)}` }}
                    />
                    {item.is_veg ? <span className="absolute top-1 left-1 bg-green-700/90 text-[9px] text-white font-bold px-1 py-0.5 rounded">VEG</span>
                      : <span className="absolute top-1 left-1 bg-red-700/90 text-[9px] text-white font-bold px-1 py-0.5 rounded">NON-VEG</span>}
                  </div>
                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-bold text-white leading-snug line-clamp-1 pr-2">{item.name}</h3>
                        <div className="flex items-center gap-0.5 bg-green-900/40 px-1.5 py-0.5 rounded border border-green-700 shrink-0">
                          <span className="text-[10px] text-green-400 font-bold">{item.rating}</span>
                          <span className="material-symbols-outlined text-green-400 text-[10px]">star</span>
                        </div>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-primary font-extrabold text-base">₹{item.price.toFixed(0)}</span>
                      {qty === 0 ? (
                        <button
                          onClick={e => handleAddToCart(e, item.id)}
                          disabled={loadingItem === item.id}
                          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-dark active:scale-95 transition-all disabled:opacity-60 shadow-md shadow-primary/30"
                        >
                          <span className="material-symbols-outlined text-[18px]">{loadingItem === item.id ? 'progress_activity' : 'add'}</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 bg-black/40 rounded-full border border-white/10 p-1">
                          <button onClick={e => handleQtyChange(e, item.id, -1)} className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-white/10">
                            <span className="material-symbols-outlined text-[16px]">{qty === 1 ? 'delete' : 'remove'}</span>
                          </button>
                          <span className="text-xs font-bold text-white px-1">{qty}</span>
                          <button onClick={e => handleQtyChange(e, item.id, 1)} className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-white/10">
                            <span className="material-symbols-outlined text-[16px]">add</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-28 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="w-full max-w-md px-4 pointer-events-auto">
            <Link to="/cart" className="w-full bg-primary text-white p-4 rounded-2xl shadow-2xl shadow-primary-dark/50 flex items-center justify-between hover:bg-primary-dark transition-colors">
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
