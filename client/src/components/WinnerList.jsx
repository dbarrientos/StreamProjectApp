import React, { useState } from 'react';

const WinnerList = ({ winners }) => {
    const [expanded, setExpanded] = useState(false);
    
    // Sort: Won first, then others
    const sortedWinners = [...winners].sort((a, b) => (a.status === 'won' ? -1 : b.status === 'won' ? 1 : 0));
    
    if (!winners || winners.length === 0) return <span className="text-slate-600">-</span>;

    const mainWinner = sortedWinners[0];
    const otherWinners = sortedWinners.slice(1);
    const hasMore = otherWinners.length > 0;

    return (
        <div className="w-full">
            {/* Main Winner (Always Visible) */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-black/40 border border-white/5">
                <div className="text-xl">
                    {mainWinner.status === 'won' && '🏆'}
                    {mainWinner.status === 'al_agua' && '💧'}
                    {mainWinner.status === 'lost' && '❌'}
                </div>
                
                <span className={`font-rajdhani font-bold text-lg tracking-wide truncate ${
                    mainWinner.status === 'won' ? 'text-[#ccff00]' : 
                    mainWinner.status === 'al_agua' ? 'text-[#00f3ff] opacity-70' :
                    'text-[#ff00ff]'
                }`}>
                    {mainWinner.username}
                </span>
            </div>

            {/* Collapsible Section */}
            {hasMore && (
                <div className="w-full mt-2">
                    <button 
                        onClick={() => setExpanded(!expanded)}
                        className="w-full text-xs text-slate-500 hover:text-[#00f3ff] flex items-center justify-center gap-1 transition-colors py-1 hover:bg-white/5 rounded"
                    >
                        {expanded ? 'Ocultar historial' : `+${otherWinners.length} intentos previos`}
                    </button>

                    {expanded && (
                        <div className="mt-2 flex flex-col gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                            {otherWinners.map((winner, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs px-2 py-1 rounded bg-white/5 text-slate-400">
                                    {winner.status === 'won' && <span>🏆</span>}
                                    {winner.status === 'al_agua' && <span>💧</span>}
                                    {winner.status === 'lost' && <span>❌</span>}
                                    
                                    <span className={
                                        winner.status === 'won' ? 'text-[#ccff00]' : 
                                        winner.status === 'al_agua' ? 'text-[#00f3ff]' :
                                        'text-[#ff00ff]'
                                    }>
                                        {winner.username}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WinnerList;
