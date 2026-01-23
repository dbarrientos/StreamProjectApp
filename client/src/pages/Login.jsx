import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Twitch, Zap } from 'lucide-react';
import Layout from '../components/Layout';

const Login = () => {
  const { login } = useAuth();

  const handleLogin = () => {
    // Generate a secure random state
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('oauth_state', state); // Store it for verification if needed
    
    // Redirect to backend auth endpoint
    // The backend handles the state generation for omniauth
    window.location.href = 'http://localhost:3000/auth/twitch';
  };

  return (
    <Layout hideNavbar={true}>
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            
            <div className="relative z-10 text-center max-w-md w-full">
                
                {/* Logo / Icon */}
                <div className="mb-8 relative inline-block">
                    <div className="absolute inset-0 bg-[#ccff00] blur-2xl opacity-20 animate-pulse"></div>
                    <div className="relative bg-[#0c0c1e] p-6 rounded-2xl border border-white/10 shadow-2xl skew-y-3 hover:skew-y-0 transition-all duration-500">
                        <Zap size={64} className="text-[#ccff00]" strokeWidth={1.5} />
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter mb-6 leading-tight glitch-text" data-text="TWITCH RAFFLE">
                    TWITCH<br/>RAFFLE
                </h1>
                
                <p className="text-slate-400 text-lg mb-10 font-medium">
                    La plataforma definitiva para tus sorteos.<br/>
                    <span className="text-[#00f3ff]">Rápido. Épico. Cyberpunk.</span>
                </p>

                <button 
                  onClick={handleLogin}
                  className="group relative w-full px-8 py-5 bg-[#9146FF] hover:bg-[#7c2cf8] text-white font-bold text-xl uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(145,70,255,0.4)] rounded-xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <Twitch size={28} />
                    <span>Conectar con Twitch</span>
                  </div>
                </button>
                
                <p className="mt-8 text-xs text-slate-500 uppercase tracking-widest">
                    Secure Login via Twitch
                </p>
            </div>
        </div>
    </Layout>
  );
};

export default Login;
