import React from 'react';

const Logo = ({ className = "" }) => {
    return (
        <div className={`font-rajdhani font-bold tracking-tight select-none ${className}`}>
            <span className="text-[#00f3ff] text-3xl md:text-4xl uppercase tracking-widest mr-2 drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
                Stream
            </span>
            <span 
                className="text-[#ff00ff] text-4xl md:text-5xl uppercase font-black glitch-text drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]" 
                data-text="RAFFLE"
            >
                RAFFLE
            </span>
        </div>
    );
};

export default Logo;
