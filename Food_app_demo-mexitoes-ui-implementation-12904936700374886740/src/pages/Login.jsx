import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { sendOtp, verifyOtp } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState('phone'); // 'phone' | 'otp'
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [demoOtp, setDemoOtp] = useState(''); // NEW STATE FOR DEMO OTP
    const [resendTimer, setResendTimer] = useState(0);
    const otpRefs = [useRef(), useRef(), useRef(), useRef()];
    const timerRef = useRef(null);

    const startTimer = () => {
        setResendTimer(30);
        timerRef.current = setInterval(() => {
            setResendTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
        }, 1000);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (phone.length !== 10) { setError('Enter a valid 10-digit number'); return; }
        setLoading(true); setError('');
        try {
            const data = await sendOtp(phone);
            if (data?.demo_otp) setDemoOtp(data.demo_otp);
            setStep('otp');
            startTimer();
            setTimeout(() => otpRefs[0].current?.focus(), 100);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP. Try again.');
        } finally { setLoading(false); }
    };

    const handleOtpChange = (idx, val) => {
        if (!/^\d?$/.test(val)) return;
        const next = [...otp];
        next[idx] = val;
        setOtp(next);
        if (val && idx < 3) otpRefs[idx + 1].current?.focus();
        if (!val && idx > 0) otpRefs[idx - 1].current?.focus();
    };

    const handleOtpKeyDown = (idx, e) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs[idx - 1].current?.focus();
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpStr = otp.join('');
        if (otpStr.length !== 4) { setError('Enter the 4-digit OTP'); return; }
        setLoading(true); setError('');
        try {
            await verifyOtp(phone, otpStr, name || undefined);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP. Try again.');
            setOtp(['', '', '', '']);
            otpRefs[0].current?.focus();
        } finally { setLoading(false); }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setLoading(true); setError('');
        try {
            const data = await sendOtp(phone);
            if (data?.demo_otp) setDemoOtp(data.demo_otp);
            setOtp(['', '', '', '']);
            startTimer();
            otpRefs[0].current?.focus();
        } catch (err) {
            setError('Failed to resend OTP.');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center px-6">
            {/* Logo */}
            <div className="flex flex-col items-center mb-10 w-full px-4">
                <img src="/logo.png" alt="Mexitoes Express Logo" className="w-full max-w-[280px] h-auto object-contain drop-shadow-2xl" />
            </div>

            <div className="w-full max-w-sm">
                {step === 'phone' ? (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">Enter your number</h2>
                            <p className="text-slate-400 text-sm">We'll send a 4-digit OTP to verify</p>
                        </div>

                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 focus-within:border-primary/60 focus-within:bg-white/8 transition-all">
                            <span className="text-white font-bold text-base shrink-0">🇮🇳 +91</span>
                            <div className="w-px h-5 bg-white/20 shrink-0"></div>
                            <input
                                autoFocus
                                className="flex-1 bg-transparent text-white text-lg font-semibold placeholder-slate-500 focus:outline-none tracking-widest"
                                inputMode="numeric"
                                maxLength={10}
                                onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                                placeholder="98765 43210"
                                type="tel"
                                value={phone}
                            />
                        </div>

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <button
                            className="w-full bg-primary text-white py-4 rounded-2xl text-base font-bold hover:bg-primary-dark active:scale-95 transition-all shadow-lg shadow-primary/30 disabled:opacity-60 flex items-center justify-center gap-2"
                            disabled={loading || phone.length !== 10}
                            type="submit"
                        >
                            {loading ? <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span> : null}
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                        <div>
                            <button type="button" onClick={() => { setStep('phone'); setError(''); }} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm mb-3">
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span> Change number
                            </button>
                            <h2 className="text-xl font-bold text-white mb-1">Enter OTP</h2>
                            <p className="text-slate-400 text-sm">Sent to +91 {phone}</p>
                            {demoOtp && (
                                <div className="mt-3 bg-primary/20 border-2 border-primary/50 text-white p-3 rounded-xl text-center font-bold tracking-widest text-lg shadow-lg">
                                    Demo OTP: <span className="text-primary text-2xl">{demoOtp}</span>
                                </div>
                            )}
                        </div>


                        {/* 4-digit OTP boxes */}
                        <div className="flex gap-3 justify-center">
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={otpRefs[idx]}
                                    className="w-14 h-14 text-center text-2xl font-bold text-white bg-white/5 border-2 border-white/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-white/8 transition-all caret-primary"
                                    inputMode="numeric"
                                    maxLength={1}
                                    onChange={e => handleOtpChange(idx, e.target.value)}
                                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                                    type="text"
                                    value={digit}
                                />
                            ))}
                        </div>

                        {/* Name field for new users */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 focus-within:border-primary/60 transition-all">
                            <input
                                className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm"
                                onChange={e => setName(e.target.value)}
                                placeholder="Your name (optional, for new users)"
                                type="text"
                                value={name}
                            />
                        </div>

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <button
                            className="w-full bg-primary text-white py-4 rounded-2xl text-base font-bold hover:bg-primary-dark active:scale-95 transition-all shadow-lg shadow-primary/30 disabled:opacity-60 flex items-center justify-center gap-2"
                            disabled={loading || otp.join('').length !== 4}
                            type="submit"
                        >
                            {loading ? <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span> : null}
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendTimer > 0}
                                className={`text-sm transition-colors ${resendTimer > 0 ? 'text-slate-500 cursor-not-allowed' : 'text-primary hover:text-accent'}`}
                            >
                                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
