import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../api/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCart = useCallback(async () => {
        if (!user) { setCartItems([]); return; }
        try {
            setLoading(true);
            const { data } = await cartAPI.getCart();
            setCartItems(data);
        } catch {
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (menuItemId, quantity = 1) => {
        const existing = cartItems.find(i => i.menu_item_id === menuItemId);
        const newQty = existing ? existing.quantity + quantity : quantity;
        await cartAPI.addItem(menuItemId, newQty);
        await fetchCart();
    };

    const removeFromCart = async (menuItemId) => {
        await cartAPI.removeItem(menuItemId);
        await fetchCart();
    };

    const updateQuantity = async (menuItemId, quantity) => {
        if (quantity <= 0) {
            await removeFromCart(menuItemId);
        } else {
            await cartAPI.addItem(menuItemId, quantity);
            await fetchCart();
        }
    };

    const clearCart = async () => {
        await cartAPI.clearCart();
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    const cartSubtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const cartTax = parseFloat((cartSubtotal * 0.08).toFixed(2));
    const cartTotal = parseFloat((cartSubtotal + cartTax).toFixed(2));

    return (
        <CartContext.Provider value={{
            cartItems, cartCount, cartSubtotal, cartTax, cartTotal,
            loading, fetchCart, addToCart, removeFromCart, updateQuantity, clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);

