import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import RaffleWheel from '../components/RaffleWheel';
import confetti from 'canvas-confetti';

import { useTheme } from '../context/ThemeContext';

const RaffleView = () => {
    const { theme } = useTheme();
    const [participants, setParticipants] = useState([]);
    const [spinning, setSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState('IDLE'); // IDLE, SPINNING, WIN, WAIT, LOSS
    const [timeLeft, setTimeLeft] = useState(0);

    const { id } = useParams();

    useEffect(() => {
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

    // Polling System for robust OBS/Cross-browser support
    useEffect(() => {
        if (!id) return;

        const pollState = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/public/raffles/${id}`);
                if (!response.ok) return;
                
                const data = await response.json();
                
                // Sync Basic Info
                if (data.participants) setParticipants(data.participants);
                if (data.title) setTitle(data.title);

                // Handle State Transitions
                // Case 1: Spin Started
                if (data.status === 'spinning' && data.latest_winner && data.latest_winner.status === 'pending_reveal') {
                    if (!spinning && winner !== data.latest_winner.username) {
                         setWinner(data.latest_winner.username);
                         setSpinning(true);
                         setStatus('SPINNING');
                    }
                }
                
                // Case 2: Winner Confirmed
                if (data.latest_winner && data.latest_winner.status === 'won') {
                    if (status !== 'WIN') {
                        setWinner(data.latest_winner.username);
                        setStatus('WIN');
                        setSpinning(false);
                        launchConfetti();
                    }
                }

                // Case 3: Reset / Idle
                if (data.status === 'open' || data.status === 'created') {
                    if (status !== 'IDLE' && status !== 'WAITING') {
                        // Only reset if we were previously spinning/won
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

        // POLL INTERVAL (1s is fast enough for OBS, not too heavy)
        const pollInterval = setInterval(pollState, 1000);

        // Keep BroadcastChannel as fallback/instant local sync
        const channel = new BroadcastChannel(`raffle_channel_${id}`);
        channel.onmessage = (event) => {
             // ... existing broadcast logic is optional now, but good for local latency ...
             // For simplicity, let's rely on polling or keep it minimal
        };

        return () => {
            clearInterval(pollInterval);
            channel.close();
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
            {title && <h1 className="text-4xl font-bold text-skin-accent mb-8 tracking-wider theme-title">{title}</h1>}
            
            <div className="w-full max-w-3xl transform scale-150">
                <RaffleWheel 
                    participants={participants}
                    spinning={spinning} 
                    winner={winner}
                    onAnimationFinish={handleAnimationFinish}
                />
            </div>

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
        </div>
    );
};

export default RaffleView;
