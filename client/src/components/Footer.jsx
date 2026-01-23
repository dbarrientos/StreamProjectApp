import React from 'react';

const Footer = () => {
    return (
        <div className="w-full text-center py-6 mt-auto relative z-10">
            <div className="text-slate-600 text-xs font-medium uppercase tracking-widest opacity-50">
                {import.meta.env.VITE_APP_NAME || 'Twitch Raffle App'} • {new Date().getFullYear()}
            </div>
        </div>
    );
};

export default Footer;
