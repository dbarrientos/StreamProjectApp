import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import RaffleWheel from '../components/RaffleWheel';
import confetti from 'canvas-confetti';
import { API_URL } from '../services/api';

import { useTheme } from '../context/ThemeContext';

const RaffleView = () => {
    const { theme } = useTheme();
    const [participants, setParticipants] = useState([]);
    const [spinning, setSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState('IDLE'); // IDLE, SPINNING, WIN, WAIT, LOSS
    const [host, setHost] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    const { id } = useParams();

    useEffect(() => {
        // ... (existing timer logic)
        let interval;
        if (status === 'WAITING' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [status, timeLeft]);

    // Polling System...
    useEffect(() => {
        if (!id) return;

        const pollState = async () => {
            try {
                const response = await fetch(`${API_URL}/api/public/raffles/${id}`, { cache: 'no-store' });
                if (!response.ok) return;
                
                const data = await response.json();
                
                // Sync Basic Info
                // Sync Basic Info
                if (data.participants) {
                    // Filter out already won winners
                    const winnersSet = new Set(
                        (data.winners || [])
                            .filter(w => w.status === 'won')
                            .map(w => w.username)
                    );
                    
                    const eligibleParticipants = data.participants.filter(p => !winnersSet.has(p));

                    setParticipants(prev => {
                        if (JSON.stringify(prev) !== JSON.stringify(eligibleParticipants)) {
                            return eligibleParticipants;
                        }
                        return prev;
                    });
                }
                if (data.title && data.title !== title) setTitle(data.title);
                if (data.host) setHost(data.host);

                // Handle State Transitions
                if (data.status === 'completed') {
                    setStatus('COMPLETED');
                    return; 
                }
                // Case 1: Spin Started
                if (data.status === 'spinning' && data.latest_winner && data.latest_winner.status === 'pending_reveal') {
                    if (!spinning && winner !== data.latest_winner.username) {
                         setWinner(data.latest_winner.username);
                         setSpinning(true);
                         setStatus('SPINNING');
                    }
                }
                
                // Case 1.5: Waiting for Claim (Countdown)
                if (data.latest_winner && data.latest_winner.status === 'waiting_claim') {
                    const expiry = data.latest_winner.claimed_at ? new Date(data.latest_winner.claimed_at) : null;
                    let seconds = 60;
                    if (expiry) {
                        seconds = Math.max(0, Math.floor((expiry.getTime() - Date.now()) / 1000));
                    }

                    // Always update time if it's drifting, or set status
                    if (status !== 'WAITING') {
                        setWinner(data.latest_winner.username);
                        setStatus('WAITING');
                        setSpinning(false);
                    }
                    
                    // Update timer if significant drift or we need to sync
                    // We can just set it every poll to stay roughly synced
                    setTimeLeft(seconds);
                }

                // Case 2a: Winner Confirmed (Al Agua)
                if (data.latest_winner && data.latest_winner.status === 'al_agua') {
                    if (status !== 'AL_AGUA') {
                        setWinner(data.latest_winner.username);
                        setStatus('AL_AGUA');
                        setSpinning(false);
                    }
                }

                // Case 2b: Winner Confirmed (Won)
                if (data.latest_winner && data.latest_winner.status === 'won') {
                    if (status !== 'WIN') {
                        setWinner(data.latest_winner.username);
                        setStatus('WIN');
                        setSpinning(false);
                        launchConfetti();
                    }
                }

                // Case 2c: Winner Lost (Timeout)
                if (data.latest_winner && data.latest_winner.status === 'lost') {
                    if (status !== 'LOSS') {
                        setWinner(data.latest_winner.username);
                        setStatus('LOSS');
                        setSpinning(false);
                    }
                }

                // Case 3: Reset / Idle
                if (data.status === 'open' || data.status === 'created' || data.status === 'active') {
                    if (status !== 'IDLE' && status !== 'WAITING' && status !== 'AL_AGUA' && status !== 'WIN') {
                         setStatus('IDLE');
                         setSpinning(false);
                         setWinner(null);
                    }
                }
                
            } catch (e) {
                console.error("Polling error:", e);
            }
        };

        // Initial fetch
        pollState();

        // Initial fetch
        pollState();

        // Dynamic Polling Interval
        // - Fast (1s) during action (Spinning/Waiting)
        // - Medium (3s) during idle (Waiting for host to start)
        // - Slow (5s) during results (Winner on screen)
        const getInterval = () => {
            if (status === 'SPINNING' || status === 'WAITING') return 1000; 
            if (status === 'IDLE') return 3000;
            return 5000; 
        };

        const intervalId = setInterval(pollState, getInterval());

        return () => {
            clearInterval(intervalId);
        };
    }, [id, spinning, winner, status]);



    const launchConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 }
        });
    };

    const handleAnimationFinish = () => {
        setSpinning(false);
        const channel = new BroadcastChannel(`raffle_channel_${id}`);
        channel.postMessage({ type: 'SPIN_FINISHED' });
        channel.close();
    };

    return (
        <div className="min-h-screen bg-skin-base text-skin-text-base flex flex-col items-center justify-center p-8 transition-colors duration-500 font-display">
            {/* Host Header */}
            {host && (
                <div className="flex flex-col items-center gap-4 mb-4">
                    {host.image && (
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-skin-accent to-skin-secondary rounded-full opacity-75 blur group-hover:opacity-100 transition duration-500"></div>
                            <img 
                                src={host.image} 
                                alt={host.username} 
                                className="relative w-20 h-20 rounded-full border-4 border-skin-base shadow-xl" 
                            />
                        </div>
                    )}
                    <div className="flex flex-col items-center gap-0.5">
                        <span className="text-skin-accent text-[10px] font-bold uppercase tracking-widest opacity-80">Organizado por</span>
                        <span className="text-lg font-bold text-skin-text-base tracking-wide">@{host.username}</span>
                    </div>
                </div>
            )}
            
            {title && <h1 className="text-4xl font-bold text-skin-accent mb-8 tracking-wider theme-title">{title}</h1>}
            
            {status === 'COMPLETED' ? (
                 <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-skin-border/30 rounded-3xl bg-skin-panel/50 backdrop-blur-sm animate-fade-in my-12">
                    <div className="text-6xl mb-4 opacity-50">🏁</div>
                    <div className="text-4xl font-bold text-skin-text-muted theme-title tracking-widest uppercase">
                        Sorteo Finalizado
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-3xl transform scale-150">
                    <RaffleWheel 
                        participants={participants}
                        spinning={spinning} 
                        winner={winner}
                        onAnimationFinish={handleAnimationFinish}
                    />
                </div>
            )}

            <div className="mt-16 text-center h-24">
                {status === 'WIN' && (
                    <div className="animate-bounce">
                        <div className="text-6xl font-bold text-skin-success theme-title">¡GANADOR!</div>
                        <div className="text-3xl text-skin-text-base mt-2 theme-title">{winner}</div>
                    </div>
                )}
                {status === 'AL_AGUA' && (
                    <div className="text-red-500 animate-pulse">
                        <div className="text-4xl font-bold text-skin-danger theme-title">Lo sentimos, te fuiste al agua</div>
                        <div className="text-2xl text-skin-text-muted mt-2 theme-title">{winner}</div>
                    </div>
                )}
                {status === 'LOSS' && (
                    <div className="text-red-600 animate-pulse">
                        <div className="text-6xl font-bold text-skin-danger theme-title">TIEMPO AGOTADO</div>
                        <div className="text-2xl text-skin-text-muted mt-2 theme-title">{winner} perdió su oportunidad</div>
                    </div>
                )}
                {status === 'WAITING' && (
                    <div className="flex flex-col items-center">
                        <div className="text-2xl text-skin-warning mb-2 theme-title">
                             Esperando a {winner}...
                        </div>
                        <div className="text-5xl font-mono font-bold text-skin-warning drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                            {timeLeft}s
                        </div>
                        <div className="text-xl text-red-400 font-bold mt-2 animate-bounce">
                           ¡¡¡RÁPIDO!!! ESCRIBE EN EL CHAT
                        </div>
                    </div>
                )}
                {status === 'SPINNING' && (
                    <div className="text-2xl text-skin-accent animate-pulse theme-title">¡Mucha suerte!</div>
                )}
            </div>
            <div className="absolute bottom-4 text-skin-text-muted text-xs font-medium uppercase tracking-widest opacity-50">
                {import.meta.env.VITE_APP_NAME || 'Twitch Raffle App'} • {new Date().getFullYear()}
            </div>
            
        </div>
    );
};

export default RaffleView;
