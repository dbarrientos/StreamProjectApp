import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation, Trans } from 'react-i18next';
import { getRaffles } from '../services/api';
import { Calendar, Clock, Gamepad2, Zap } from 'lucide-react';
import Layout from '../components/Layout';

import WinnerList from '../components/WinnerList';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
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
                <h1 className="text-4xl md:text-5xl text-skin-text-base theme-title glitch-text" data-text={t('dashboard.title')}>
                    {t('dashboard.title')}
                </h1>
                <p className="text-skin-text-muted mt-2 text-lg">
                    <Trans 
                        i18nKey="dashboard.welcome"
                        values={{ username: user?.username }}
                        components={{ 1: <span className="text-skin-accent font-bold"/> }}
                    />
                </p>
            </div>
            
            <Link 
                to="/raffle/new" 
                className="group relative px-8 py-4 bg-skin-success text-black font-black uppercase tracking-widest hover:bg-opacity-80 transition-colors skew-x-[-10deg] hover:scale-105 active:scale-95 shadow-lg shadow-skin-success/20"
            >
                <div className="skew-x-[10deg] flex items-center gap-2">
                    <Zap size={20} className="fill-black" />
                    {t('dashboard.new_raffle')}
                </div>
            </Link>
        </div>

        {/* Recent Activity Section */}
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-skin-text-base mb-6 flex items-center gap-2">
                <Clock className="text-skin-secondary" />
                {t('dashboard.recent_activity.title')}
            </h2>
            
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-64 bg-skin-base-secondary rounded-xl border border-skin-border"></div>
                    ))}
                </div>
            ) : raffles.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-skin-border rounded-2xl bg-black/20">
                    <Gamepad2 size={48} className="mx-auto mb-4 text-skin-text-muted" />
                    <h3 className="text-xl font-bold text-skin-text-muted mb-2">{t('dashboard.recent_activity.empty_title')}</h3>
                    <p className="text-skin-text-muted mb-6 opacity-70">{t('dashboard.recent_activity.empty_desc')}</p>
                    <Link to="/raffle/new" className="text-skin-accent hover:underline uppercase font-bold text-sm tracking-wider">
                        {t('dashboard.recent_activity.create_first')}
                    </Link>
                </div>
            ) : (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {raffles.slice(0, 3).map((raffle) => (
                            <div key={raffle.id} className="group relative bg-skin-base-secondary border border-skin-border hover:border-skin-accent rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-skin-accent/10 flex flex-col">
                                
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-skin-text-base group-hover:text-skin-accent transition-colors truncate pr-2" title={raffle.title}>
                                        {raffle.title}
                                    </h3>
                                    <div>
                                        {raffle.status === 'active' ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-skin-accent/10 text-skin-accent border border-skin-accent/20 animate-pulse">
                                                {t('dashboard.raffle.status.active')}
                                            </span>
                                        ) : raffle.status === 'completed' ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-skin-border/30 text-skin-text-muted border border-skin-border">
                                                {t('dashboard.raffle.status.completed')}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-skin-border/30 text-skin-text-muted border border-skin-border">
                                                {raffle.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Stats Row */}
                                <div className="flex gap-4 mb-6 text-xs text-skin-text-muted font-mono">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={12}/>
                                        {new Date(raffle.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="w-px h-full bg-skin-border"></div>
                                    <div>
                                        {raffle.participants?.length || 0} {t('dashboard.raffle.participants')}
                                    </div>
                                </div>

                                {/* Winner Section */}
                                <div className="mt-auto pt-4 border-t border-skin-border">
                                    <div className="text-[10px] uppercase font-bold text-skin-text-muted mb-2 tracking-widest opacity-70">
                                        {t('dashboard.raffle.results')}
                                    </div>
                                    <WinnerList winners={raffle.winners} />
                                </div>

                                {/* Actions */}
                                {raffle.public_id && raffle.winners && raffle.winners.some(w => w.status === 'won') && (
                                    <div className="mt-4 pt-4">
                                         <Link 
                                            to={`/raffle-results/${raffle.public_id}`}
                                            target="_blank"
                                            className="w-full flex items-center justify-center gap-2 py-2 rounded border border-skin-success/20 text-skin-success hover:bg-skin-success/10 hover:border-skin-success/50 transition-all uppercase text-xs font-bold tracking-wider"
                                        >
                                            {t('dashboard.raffle.view_postcard')}
                                        </Link>
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <Link 
                            to="/history"
                            className="flex items-center gap-2 px-6 py-3 bg-skin-base-secondary hover:bg-skin-border/10 text-skin-text-base rounded-lg border border-skin-border hover:border-skin-accent transition-all group"
                        >
                            <span className="uppercase font-bold tracking-wider text-xs group-hover:text-skin-accent transition-colors">{t('dashboard.view_history')}</span>
                            <Clock size={14} className="group-hover:text-skin-accent transition-colors"/>
                        </Link>
                    </div>
                </div>
            )}
          </div>
    </Layout>
  );
};

export default Dashboard;
