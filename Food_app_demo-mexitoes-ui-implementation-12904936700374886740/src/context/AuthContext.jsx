import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('mexitoes_token');
        const storedUser = localStorage.getItem('mexitoes_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const sendOtp = async (phone) => {
        const { data } = await authAPI.sendOtp({ phone });
        return data; // contains demo_otp for testing
    };

    const verifyOtp = async (phone, otp, name) => {
        const { data } = await authAPI.verifyOtp({ phone, otp, name });
        localStorage.setItem('mexitoes_token', data.token);
        localStorage.setItem('mexitoes_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('mexitoes_token');
        localStorage.removeItem('mexitoes_user');
        setToken(null);
        setUser(null);
    };

    const updateUser = (updated) => {
        localStorage.setItem('mexitoes_user', JSON.stringify(updated));
        setUser(updated);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, sendOtp, verifyOtp, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
