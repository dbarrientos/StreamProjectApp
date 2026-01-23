import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Trophy, Share2, Calendar, Clock, Copy, Check } from 'lucide-react';
import { API_URL } from '../services/api';

const RaffleResults = () => {
    const { public_id } = useParams();
    const [raffle, setRaffle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await fetch(`${API_URL}/api/public/raffles/${public_id}`);
                if (!response.ok) throw new Error('Sorteo no encontrado');
                const data = await response.json();
                setRaffle(data);
                
                // Launch confetti if we have winners
                if (data.winners && data.winners.length > 0) {
                    const duration = 3000;
                    const end = Date.now() + duration;

                    (function frame() {
                    confetti({
                        particleCount: 5,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: ['#a855f7', '#ec4899', '#fbbf24'] 
                    });
                    confetti({
                        particleCount: 5,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: ['#a855f7', '#ec4899', '#fbbf24']
                    });

                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                    }());
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [public_id]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-red-500 font-bold text-xl">
            {error}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-purple-500/30">
            
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#00f3ff]/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-[#ff00ff]/10 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-[#ccff00]/5 rounded-full blur-[80px]"></div>
                
                {/* Sublimated Trophies */}
                <Trophy strokeWidth={0.5} className="absolute top-10 -left-10 text-[#00f3ff]/5 w-96 h-96 -rotate-[15deg]" />
                <Trophy strokeWidth={0.5} className="absolute bottom-0 -right-20 text-[#ff00ff]/5 w-[500px] h-[500px] rotate-[15deg]" />
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 w-full max-w-4xl">
                
                {/* Header Section */}
                <div className="text-center mb-12">
                     {raffle.host && (
                        <div className="flex flex-col items-center gap-4 mb-8">
                            {raffle.host.image && (
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-br from-[#00f3ff] to-[#ff00ff] rounded-full opacity-75 blur group-hover:opacity-100 transition duration-500"></div>
                                    <img 
                                        src={raffle.host.image} 
                                        alt={raffle.host.username} 
                                        className="relative w-24 h-24 rounded-full border-4 border-[#0a0a1a] shadow-2xl" 
                                    />
                                </div>
                            )}
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[#00f3ff] text-[10px] font-bold uppercase tracking-widest">Organizado por</span>
                                <span className="text-xl font-bold text-white tracking-wide">@{raffle.host.username}</span>
                            </div>
                        </div>
                    )}
                    
                    <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter mb-4 drop-shadow-[0_0_5px_rgba(255,0,255,0.8)] leading-tight glitch-text" data-text={raffle.title}>
                        {raffle.title}
                    </h1>
                    
                    <div className="flex items-center justify-center gap-6 text-slate-400 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-[#00f3ff]" />
                            {new Date(raffle.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Winners List */}
                <div className="flex flex-col gap-4 mb-12 w-full max-w-2xl mx-auto">
                    {raffle.winners.length === 0 ? (
                        <div className="text-slate-500 italic py-12 text-lg border-2 border-dashed border-slate-800 rounded-2xl w-full text-center">
                            No se registraron ganadores en este evento.
                        </div>
                    ) : (
                        raffle.winners.map((winner, idx) => (
                            <div key={idx} className="group relative w-full perspective-1000">
                                {/* Glow Effect */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00f3ff] via-[#ff00ff] to-[#ccff00] rounded-xl opacity-0 blur group-hover:opacity-100 transition duration-500"></div>
                                
                                <div className="relative bg-[#0a0a1a] border border-[#ff00ff]/20 rounded-xl p-4 flex items-center justify-between shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:bg-white/5">
                                    
                                    {/* Left: Number */}
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#0a0a1a] border border-[#00f3ff]/50 text-[#00f3ff] font-bold text-xl shrink-0">
                                        #{idx + 1}
                                    </div>

                                    {/* Center: Info */}
                                    <div className="flex-1 flex flex-col items-center justify-center px-4">
                                        <div className="text-2xl font-bold text-white group-hover:text-[#ccff00] transition-colors tracking-wide">
                                            {winner.username}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[#ccff00] text-[10px] uppercase font-bold tracking-wider mt-0.5">
                                            <Check size={10} strokeWidth={4} />
                                            Ganador Verificado
                                        </div>
                                    </div>

                                    {/* Right: Trophy */}
                                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#ff00ff]/10 border border-[#ff00ff]/30 text-[#ff00ff] shrink-0 group-hover:bg-[#ff00ff] group-hover:text-black transition-colors duration-300">
                                        <Trophy size={20} />
                                    </div>

                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / Actions */}
                <div className="flex flex-col items-center gap-8 pb-12">
                     <button 
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95 group"
                    >
                        {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-slate-400 group-hover:text-white" />}
                        <span className={copied ? "text-green-400" : "text-slate-300 group-hover:text-white"}>
                            {copied ? 'Enlace Copiado' : 'Compartir Resultado'}
                        </span>
                    </button>

                    <div className="text-slate-600 text-xs font-medium uppercase tracking-widest opacity-50">
                        {import.meta.env.VITE_APP_NAME || 'Twitch Raffle App'} • {new Date().getFullYear()}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RaffleResults;
