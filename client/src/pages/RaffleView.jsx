import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import RaffleWheel from '../components/RaffleWheel';
import confetti from 'canvas-confetti';

const RaffleView = () => {
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

    useEffect(() => {
        if (!id) return;
        const channel = new BroadcastChannel(`raffle_channel_${id}`);

        channel.onmessage = (event) => {
            const { type, payload } = event.data;
            console.log("RaffleView received:", type, payload);

            if (type === 'SYNC_STATE') {
                 // Initial sync or state update
                 if (payload.participants) setParticipants(payload.participants);
                 if (payload.title) setTitle(payload.title);
            } else if (type === 'START_SPIN') {
                setParticipants(payload.participants);
                setTitle(payload.title);
                setSpinning(true);
                setWinner(payload.winner); // Winner is pre-calculated
                setStatus('SPINNING');
            } else if (type === 'WAIT_FOR_WINNER') {
                setStatus('WAITING');
                setSpinning(false);
                if (payload.timeLeft) setTimeLeft(payload.timeLeft);
            } else if (type === 'WINNER_CONFIRMED') {
                setStatus('WIN');
                launchConfetti();
            } else if (type === 'SHOW_AL_AGUA') {
                setStatus('AL_AGUA');
                setWinner(payload.loser);
                setSpinning(false);
            } else if (type === 'TIMEOUT') {
                setStatus('LOSS');
                setWinner(payload.loser);
                setSpinning(false);
            } else if (type === 'RESET') {
                setStatus('IDLE');
                setWinner(null);
                setSpinning(false);
            }
        };

        return () => {
            channel.close();
        };
    }, [id]);

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
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-8">
            {title && <h1 className="text-4xl font-bold text-purple-400 mb-8 tracking-wider">{title}</h1>}
            
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
                        <div className="text-6xl font-bold text-green-400">¡GANADOR!</div>
                        <div className="text-3xl text-white mt-2">{winner}</div>
                    </div>
                )}
                {status === 'AL_AGUA' && (
                    <div className="text-red-500 animate-pulse">
                        <div className="text-4xl font-bold">Lo sentimos, te fuiste al agua</div>
                        <div className="text-2xl text-slate-400 mt-2">{winner}</div>
                    </div>
                )}
                {status === 'LOSS' && (
                    <div className="text-red-600 animate-pulse">
                        <div className="text-6xl font-bold">TIEMPO AGOTADO</div>
                        <div className="text-2xl text-slate-400 mt-2">{winner} perdió su oportunidad</div>
                    </div>
                )}
                {status === 'WAITING' && (
                    <div className="flex flex-col items-center">
                        <div className="text-2xl text-yellow-500 mb-2">
                             Esperando a {winner}...
                        </div>
                        <div className="text-5xl font-mono font-bold text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                            {timeLeft}s
                        </div>
                        <div className="text-xl text-red-400 font-bold mt-2 animate-bounce">
                           ¡¡¡RÁPIDO!!! ESCRIBE EN EL CHAT
                        </div>
                    </div>
                )}
                {status === 'SPINNING' && (
                    <div className="text-2xl text-purple-400 animate-pulse">¡Mucha suerte!</div>
                )}
            </div>
        </div>
    );
};

export default RaffleView;
