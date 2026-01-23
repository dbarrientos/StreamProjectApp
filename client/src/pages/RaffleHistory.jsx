import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getRaffles } from '../services/api';
import { ArrowLeft, Search, Calendar, Trophy } from 'lucide-react';
import Layout from '../components/Layout';
import WinnerList from '../components/WinnerList';

const RaffleHistory = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Reset page when filters change
  useEffect(() => {
      setCurrentPage(1);
  }, [searchTerm, dateFilter]);

  const filteredRaffles = raffles.filter(raffle => {
      const matchTitle = raffle.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDate = dateFilter ? new Date(raffle.created_at).toISOString().split('T')[0] === dateFilter : true;
      return matchTitle && matchDate;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredRaffles.length / itemsPerPage);
  const paginatedRaffles = filteredRaffles.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  return (
    <Layout>
        {/* Header Action */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
                <Link to="/dashboard" className="p-2 hover:bg-skin-text-muted/10 rounded-full transition-colors text-skin-text-muted hover:text-skin-text-base">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h2 className="text-3xl text-skin-text-base theme-title">{t('history.title')}</h2>
                    <p className="text-skin-text-muted">{t('history.subtitle')}</p>
                </div>
            </div>
        </div>

        {/* Filters */}
        <div className="bg-skin-base-secondary border border-skin-border rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-skin-text-muted" size={18} />
                <input 
                    type="text" 
                    placeholder={t('history.search_placeholder')} 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-skin-panel border border-skin-border rounded-lg py-2 pl-10 pr-4 text-skin-text-base focus:border-skin-accent outline-none transition-colors"
                />
            </div>
            <div className="relative w-full md:w-auto">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-skin-text-muted" size={18} />
                <input 
                    type="date" 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-skin-panel border border-skin-border rounded-lg py-2 pl-10 pr-4 text-skin-text-base focus:border-skin-accent outline-none transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                />
            </div>
            {(searchTerm || dateFilter) && (
                <button 
                    onClick={() => {setSearchTerm(""); setDateFilter("");}}
                    className="text-xs text-skin-secondary hover:underline whitespace-nowrap"
                >
                    {t('history.clear_filters')}
                </button>
            )}
        </div>

        {/* History Grid */}
        <div className="mb-8">
            {loading ? (
                <div className="text-skin-text-muted animate-pulse">{t('history.loading')}</div>
            ) : filteredRaffles.length === 0 ? (
                <div className="text-skin-text-muted italic py-12 text-center border-2 border-dashed border-skin-border rounded-2xl">
                    {t('history.empty')}
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-4">
                    {paginatedRaffles.map((raffle) => (
                        <div key={raffle.id} className="group relative bg-skin-base-secondary border border-skin-border hover:border-skin-accent rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-skin-accent/10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                            
                            {/* Left: Info */}
                            <div className="flex-grow min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-skin-text-base group-hover:text-skin-accent transition-colors truncate" title={raffle.title}>
                                        {raffle.title}
                                    </h3>
                                    {raffle.status === 'active' ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-skin-accent/10 text-skin-accent border border-skin-accent/20 animate-pulse">
                                            {t('dashboard.raffle.status.active')}
                                        </span>
                                    ) : raffle.status === 'completed' ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-skin-border/20 text-skin-text-muted border border-skin-border">
                                            {t('dashboard.raffle.status.completed')}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-skin-border/20 text-skin-text-muted border border-skin-border">
                                            {raffle.status}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex gap-4 text-xs text-skin-text-muted font-mono">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={12}/>
                                        {new Date(raffle.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="w-px h-full bg-skin-border"></div>
                                    <div>
                                        {raffle.participants?.length || 0} {t('history.participants')}
                                    </div>
                                </div>
                            </div>

                            {/* Middle: Winner */}
                            <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-skin-border pt-4 md:pt-0 md:pl-6">
                                <div className="text-[10px] uppercase font-bold text-skin-text-muted mb-2 tracking-widest hidden md:block">
                                    {t('history.winner_label')}
                                </div>
                                <WinnerList winners={raffle.winners} />
                            </div>

                            {/* Right: Actions */}
                            {raffle.public_id && raffle.winners && raffle.winners.some(w => w.status === 'won') && (
                                <div className="hidden md:block">
                                     <Link 
                                        to={`/raffle-results/${raffle.public_id}`}
                                        target="_blank"
                                        title={t('history.view_postcard')}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-skin-success/20 text-skin-success hover:bg-skin-success/10 hover:border-skin-success/50 transition-all"
                                    >
                                        <Trophy size={18} />
                                    </Link>
                                </div>
                            )}
                            
                            {/* Mobile Action */}
                            {raffle.public_id && raffle.winners && raffle.winners.some(w => w.status === 'won') && (
                                <Link 
                                    to={`/raffle-results/${raffle.public_id}`}
                                    className="md:hidden w-full flex items-center justify-center gap-2 py-2 rounded border border-skin-success/20 text-skin-success hover:bg-skin-success/10 font-bold uppercase text-xs"
                                >
                                    {t('history.view_postcard')}
                                </Link>
                            )}
                            
                        </div>
                    ))}
                </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded bg-skin-panel text-skin-text-base disabled:opacity-50 hover:bg-skin-border transition-colors border border-skin-border"
                            >
                                &lt;
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded font-bold transition-colors border ${
                                        currentPage === page 
                                            ? 'bg-skin-secondary text-skin-text-base border-skin-secondary' 
                                            : 'bg-skin-panel text-skin-text-muted hover:bg-skin-border border-skin-border'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded bg-skin-panel text-skin-text-base disabled:opacity-50 hover:bg-skin-border transition-colors border border-skin-border"
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    </Layout>
  );
};

export default RaffleHistory;
