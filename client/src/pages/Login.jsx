import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Twitch, Zap } from 'lucide-react';
import Layout from '../components/Layout';

const Login = () => {
  const { login } = useAuth();
  const { theme } = useTheme();
  const appName = import.meta.env.VITE_APP_NAME || "TWITCH RAFFLE";
  const [firstLine, secondLine] = appName.split(" ");

  const handleLogin = () => {
    // Generate a secure random state
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('oauth_state', state); // Store it for verification if needed
    
    // Redirect to backend auth endpoint
    // The backend handles the state generation for omniauth
    window.location.href = 'https://localhost:3000/auth/twitch';
  };

  return (
    <Layout hideNavbar={true}>
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            
            <div className="relative z-10 text-center max-w-md w-full">
                
                {/* Logo / Icon */}
                <div className="mb-8 relative inline-block">
                    <div className="absolute inset-0 bg-skin-success blur-2xl opacity-20 animate-pulse"></div>
                    <div className="relative bg-skin-base-secondary p-6 rounded-2xl border border-skin-border shadow-2xl skew-y-3 hover:skew-y-0 transition-all duration-500">
                        <Zap size={64} className="text-skin-success" strokeWidth={1.5} />
                    </div>
                </div>

                <div className="text-5xl md:text-7xl text-skin-text-base theme-title mb-6 leading-tight">
                   {theme === 'cyberpunk' || theme === 'kawaii' || theme === 'mario' ? (
                       <>
                           <div className="glitch-text" data-text={firstLine.toUpperCase()}>
                                {firstLine.toUpperCase()}
                           </div>
                           {secondLine && (
                               <div className="glitch-text" data-text={secondLine.toUpperCase()}>
                                   {secondLine.toUpperCase()}
                               </div>
                           )}
                       </>
                   ) : (
                       <>
                           <div>
                                {firstLine.toUpperCase()}
                           </div>
                           {secondLine && (
                               <div>
                                   {secondLine.toUpperCase()}
                               </div>
                           )}
                       </>
                   )}
                </div>
                
                <p className="text-skin-text-muted text-lg mb-10 font-medium max-w-md mx-auto">
                    La plataforma definitiva para tus sorteos.<br/>
                    <span className="text-skin-accent">Rápido. Épico. Cyberpunk.</span>
                </p>

                <div className="max-w-md mx-auto">
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
                </div>
                
                <p className="mt-8 text-xs text-skin-text-muted uppercase tracking-widest">
                    Secure Login via Twitch
                </p>
            </div>
        </div>
    </Layout>
  );
};

export default Login;
