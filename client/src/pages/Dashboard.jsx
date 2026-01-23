import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRaffles } from '../services/api';
import { Calendar, Clock, Gamepad2, Zap } from 'lucide-react'; // Updated imports for icons
import Layout from '../components/Layout'; // New import

import WinnerList from '../components/WinnerList';

const Dashboard = () => {
  const { user } = useAuth();
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRaffles = async () => {
        try {
            const data = await getRaffles();
            setRaffles(data);
        } catch (error) {
            console.error("Failed to fetch raffles", error);
        } finally {
            setLoading(false);
        }
    };
    if (user) fetchRaffles();
  }, [user]);

  return (
    <Layout>
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
            <div>
                <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tight glitch-text" data-text="DASHBOARD">
                    DASHBOARD
                </h1>
                <p className="text-slate-400 mt-2 text-lg">
                    Bienvenido de nuevo, <span className="text-[#00f3ff] font-bold">@{user?.username}</span>
                </p>
            </div>
            
            <Link 
                to="/raffle/new" 
                className="group relative px-8 py-4 bg-[#ccff00] text-black font-black uppercase tracking-widest hover:bg-[#b3e600] transition-colors skew-x-[-10deg] hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(204,255,0,0.3)]"
            >
                <div className="skew-x-[10deg] flex items-center gap-2">
                    <Zap size={20} className="fill-black" />
                    Nuevo Sorteo
                </div>
            </Link>
        </div>

        {/* Recent Activity Section */}
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="text-[#ff00ff]" />
                Actividad Reciente
            </h2>
            
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-64 bg-white/5 rounded-xl border border-white/5"></div>
                    ))}
                </div>
            ) : raffles.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl bg-black/20">
                    <Gamepad2 size={48} className="mx-auto mb-4 text-slate-600" />
                    <h3 className="text-xl font-bold text-slate-400 mb-2">Sin actividad reciente</h3>
                    <p className="text-slate-500 mb-6">Aún no has creado ningún sorteo. ¡Es hora de empezar!</p>
                    <Link to="/raffle/new" className="text-[#00f3ff] hover:underline uppercase font-bold text-sm tracking-wider">
                        Crear mi primer sorteo
                    </Link>
                </div>
            ) : (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {raffles.slice(0, 3).map((raffle) => (
                            <div key={raffle.id} className="group relative bg-[#0c0c1e] border border-white/5 hover:border-[#ff00ff]/50 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#ff00ff]/10 flex flex-col">
                                
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-white group-hover:text-[#00f3ff] transition-colors truncate pr-2" title={raffle.title}>
                                        {raffle.title}
                                    </h3>
                                    <div>
                                        {raffle.status === 'active' ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/20 animate-pulse">
                                                En curso
                                            </span>
                                        ) : raffle.status === 'completed' ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 text-slate-400 border border-white/10">
                                                Finalizado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 text-slate-500 border border-white/10">
                                                {raffle.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Stats Row */}
                                <div className="flex gap-4 mb-6 text-xs text-slate-500 font-mono">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={12}/>
                                        {new Date(raffle.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="w-px h-full bg-white/10"></div>
                                    <div>
                                        {raffle.participants?.length || 0} Participantes
                                    </div>
                                </div>

                                {/* Winner Section */}
                                <div className="mt-auto pt-4 border-t border-white/5">
                                    <div className="text-[10px] uppercase font-bold text-slate-600 mb-2 tracking-widest">
                                        Resultados
                                    </div>
                                    <WinnerList winners={raffle.winners} />
                                </div>

                                {/* Actions */}
                                {raffle.public_id && raffle.winners && raffle.winners.some(w => w.status === 'won') && (
                                    <div className="mt-4 pt-4">
                                         <Link 
                                            to={`/raffle-results/${raffle.public_id}`}
                                            target="_blank"
                                            className="w-full flex items-center justify-center gap-2 py-2 rounded border border-[#ccff00]/20 text-[#ccff00] hover:bg-[#ccff00]/10 hover:border-[#ccff00]/50 transition-all uppercase text-xs font-bold tracking-wider"
                                        >
                                            Ver Postal
                                        </Link>
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <Link 
                            to="/history"
                            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 hover:border-[#ff00ff] transition-all group"
                        >
                            <span className="uppercase font-bold tracking-wider text-xs group-hover:text-[#ff00ff] transition-colors">Ver historial completo</span>
                            <Clock size={14} className="group-hover:text-[#ff00ff] transition-colors"/>
                        </Link>
                    </div>
                </div>
            )}
          </div>
    </Layout>
  );
};

export default Dashboard;
