import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const RaffleHistory = () => {
  const { user } = useAuth();
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
                <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Historial Completo</h2>
                    <p className="text-slate-400">Todos los sorteos realizados.</p>
                </div>
            </div>
        </div>

        {/* Filters */}
        <div className="bg-[#0c0c1e] border border-white/5 rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar por título..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:border-[#00f3ff] outline-none transition-colors"
                />
            </div>
            <div className="relative w-full md:w-auto">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                    type="date" 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:border-[#00f3ff] outline-none transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                />
            </div>
            {(searchTerm || dateFilter) && (
                <button 
                    onClick={() => {setSearchTerm(""); setDateFilter("");}}
                    className="text-xs text-[#ff00ff] hover:underline whitespace-nowrap"
                >
                    Limpiar Filtros
                </button>
            )}
        </div>

        {/* History Grid */}
        <div className="mb-8">
            {loading ? (
                <div className="text-slate-500 animate-pulse">Cargando historial...</div>
            ) : filteredRaffles.length === 0 ? (
                <div className="text-slate-500 italic py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                    No se encontraron sorteos.
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-4">
                    {paginatedRaffles.map((raffle) => (
                        <div key={raffle.id} className="group relative bg-[#0c0c1e] border border-white/5 hover:border-[#ff00ff]/50 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#ff00ff]/10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                            
                            {/* Left: Info */}
                            <div className="flex-grow min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-white group-hover:text-[#00f3ff] transition-colors truncate" title={raffle.title}>
                                        {raffle.title}
                                    </h3>
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
                                
                                <div className="flex gap-4 text-xs text-slate-500 font-mono">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={12}/>
                                        {new Date(raffle.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="w-px h-full bg-white/10"></div>
                                    <div>
                                        {raffle.participants?.length || 0} Participantes
                                    </div>
                                </div>
                            </div>

                            {/* Middle: Winner */}
                            <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                                <div className="text-[10px] uppercase font-bold text-slate-600 mb-2 tracking-widest hidden md:block">
                                    Ganador
                                </div>
                                <WinnerList winners={raffle.winners} />
                            </div>

                            {/* Right: Actions */}
                            {raffle.public_id && raffle.winners && raffle.winners.some(w => w.status === 'won') && (
                                <div className="hidden md:block">
                                     <Link 
                                        to={`/raffle-results/${raffle.public_id}`}
                                        target="_blank"
                                        title="Ver Postal"
                                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#ccff00]/20 text-[#ccff00] hover:bg-[#ccff00]/10 hover:border-[#ccff00]/50 transition-all"
                                    >
                                        <Trophy size={18} />
                                    </Link>
                                </div>
                            )}
                            
                            {/* Mobile Action */}
                            {raffle.public_id && raffle.winners && raffle.winners.some(w => w.status === 'won') && (
                                <Link 
                                    to={`/raffle-results/${raffle.public_id}`}
                                    className="md:hidden w-full flex items-center justify-center gap-2 py-2 rounded border border-[#ccff00]/20 text-[#ccff00] hover:bg-[#ccff00]/10 font-bold uppercase text-xs"
                                >
                                    Ver Postal
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
                                className="px-3 py-1 rounded bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700 transition-colors"
                            >
                                &lt;
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded font-bold transition-colors ${
                                        currentPage === page 
                                            ? 'bg-[#ff00ff] text-white' 
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700 transition-colors"
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
