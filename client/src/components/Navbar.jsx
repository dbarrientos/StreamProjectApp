import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Logo from './Logo';

const Navbar = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <header className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
            <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
                <Logo />
            </Link>
            <div className="flex items-center gap-6">
                <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                    Dashboard
                </Link>
                <div className="flex items-center gap-3 border-l border-white/10 pl-6">
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
                        
                        <span className="font-bold text-white text-sm tracking-wide hidden md:block">
                            {user?.username}
                        </span>
                    </div>

                    <div className="w-px h-6 bg-white/10 mx-2"></div>

                    <button 
                        onClick={logout}
                        className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-wider transition-colors"
                    >
                        Salir
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
