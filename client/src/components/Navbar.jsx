import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';

import ThemeSelector from './ThemeSelector'; // Import ThemeSelector

const Logo = () => {
    const appName = import.meta.env.VITE_APP_NAME || "RAFFLE";
    return (
        <div className="flex items-center gap-2 group">
            <div className="p-1 bg-skin-accent/10 rounded-lg group-hover:bg-skin-accent/20 transition-colors">
                <Zap className="text-skin-accent" size={20} fill="currentColor" fillOpacity={0.2} />
            </div>
            <span className="theme-title text-xl text-skin-text-base group-hover:text-skin-accent transition-colors">
                {appName.toUpperCase()}
            </span>
        </div>
    );
};

const Navbar = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <header className="relative z-10 flex justify-between items-center mb-8 border-b border-skin-border pb-4">
            <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
                <Logo />
            </Link>
            <div className="flex items-center gap-6">
                <div className="hidden md:block">
                     <ThemeSelector />
                </div>
                
                <Link to="/dashboard" className="text-skin-text-muted hover:text-skin-text-base transition-colors font-bold uppercase tracking-wider text-xs">
                    Dashboard
                </Link>
                <div className="flex items-center gap-3 border-l border-skin-border pl-6">
                    <div className="flex items-center gap-3">
                        {user?.image ? (
                            <img 
                                src={user.image} 
                                alt={user.username} 
                                className="w-10 h-10 rounded-full border-2 border-[#ff00ff] shadow-[0_0_10px_rgba(255,0,255,0.3)] object-cover" 
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-[#ff00ff]/20 border-2 border-[#ff00ff] flex items-center justify-center text-[#ff00ff] font-bold">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        
                        <span className="font-bold text-skin-text-base text-sm tracking-wide hidden md:block">
                            {user?.username}
                        </span>
                    </div>

                    <div className="w-px h-6 bg-skin-border mx-2"></div>

                    <button 
                        onClick={logout}
                        className="text-xs font-bold text-slate-500 hover:text-skin-accent uppercase tracking-wider transition-colors"
                    >
                        Salir
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
