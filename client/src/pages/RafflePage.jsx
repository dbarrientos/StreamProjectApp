import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import tmi from "tmi.js";
import confetti from "canvas-confetti";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { 
    Twitch, Type, Settings, Timer, Lock, 
    MessageSquare, Star, Play, Loader2, 
    Trash2, ChevronDown 
} from 'lucide-react';
import {
  createRaffle,
  updateRaffle,
  registerWinner,
  getChatters,
  getSubscribers,
  getFollowers,
  getModeratedChannels,
} from "../services/api";

const RafflePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [channel, setChannel] = useState(user?.username || "");
  const [moderatedChannels, setModeratedChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(user?.username || "");
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState([]); // Array of strings (usernames)
  const [subscribers, setSubscribers] = useState(new Set()); // Set of lowercased subscriber usernames
  const [followers, setFollowers] = useState(new Set()); // Set of lowercased follower usernames
  const [status, setStatus] = useState("IDLE");
  const statusRef = useRef(status);
  const [winner, setWinner] = useState(null);
  const winnerRef = useRef(winner);
  const [raffleTitle, setRaffleTitle] = useState("");
  const [keyword, setKeyword] = useState("participo"); // Added keyword state for flexibility
  const [timeLeft, setTimeLeft] = useState(60);
  const [manualInput, setManualInput] = useState("");
  const [subMultiplier, setSubMultiplier] = useState(1);
  const [subscribersOnly, setSubscribersOnly] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [useCountdown, setUseCountdown] = useState(false);
  const [countdownDuration, setCountdownDuration] = useState(60);

  const clientRef = useRef(null);
  const channelRef = useRef(null);

  const [currentRaffleId, setCurrentRaffleId] = useState(null);
  const [currentPublicId, setCurrentPublicId] = useState(null);
  const currentRaffleIdRef = useRef(null);
  const currentPublicIdRef = useRef(null);

  // Sync refs
  useEffect(() => {
    currentRaffleIdRef.current = currentRaffleId;
    currentPublicIdRef.current = currentPublicId;
  }, [currentRaffleId, currentPublicId]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    winnerRef.current = winner;
  }, [winner]);

  // Broadcast Channel Setup
  useEffect(() => {
    if (currentPublicId) {
        const chan = new BroadcastChannel(`raffle_channel_${currentPublicId}`);
        chan.onmessage = (event) => {
             if (event.data && event.data.type === 'SPIN_FINISHED') {
                 setStatus("REVIEW");
             }
        };
        channelRef.current = chan;
    }
    return () => {
        if (channelRef.current) {
            channelRef.current.close();
            channelRef.current = null;
        }
    };
  }, [currentPublicId]);

  // Fetch moderated channels
  useEffect(() => {
    const fetchModChannels = async () => {
        try {
            const data = await getModeratedChannels();
            setModeratedChannels(data.channels || []);
        } catch (e) {
            console.error("Failed to fetch moderated channels", e);
        }
    };
    if (user) fetchModChannels();
  }, [user]);

  // Sync selected channel
  useEffect(() => {
      setChannel(selectedChannel);
  }, [selectedChannel]);

  // Sync state to remote view
  useEffect(() => {
      if (channelRef.current) {
          channelRef.current.postMessage({
              type: 'SYNC_STATE',
              payload: {
                  participants: participants,
                  title: raffleTitle
              }
          });
      }
  }, [participants, raffleTitle]);

  // Confetti
  const launchConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Timer Logic
  useEffect(() => {
    let interval;
    if (status === "WAITING") {
        if (timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else {
            handleLoss();
        }
    }
    return () => clearInterval(interval);
  }, [status, timeLeft]);

  // TMI Client Logic
  const connectToChat = async () => {
    if (clientRef.current) return;

    try {
      const client = new tmi.Client({
        menu: { warning: false },
        channels: [channel],
      });

      client.on("message", (target, context, msg, self) => {
        if (self) return;

        const username = context["display-name"] || context.username;

        // Capture sub status
        if (context.subscriber) {
          setSubscribers((prev) => new Set(prev).add(username.toLowerCase()));
        }

        console.log(`[Twitch] ${username}: ${msg} | Status: ${statusRef.current}`);

        // Participation Logic
        if (statusRef.current === "OPEN") {
             const cleanMsg = msg.trim().toLowerCase();
             const cleanKeyword = `!${keyword.toLowerCase()}`;
             
             if (cleanMsg === cleanKeyword) {
                 // Check subscriber only rule
                 if (subscribersOnly && !context.subscriber && !subscribers.has(username.toLowerCase())) {
                     return; 
                 }

                 setParticipants((prev) => {
                   if (!prev.includes(username)) return [...prev, username];
                   return prev;
                 });
             }
        }

        // Winner Verification Logic
        if (statusRef.current === "WAITING" && winnerRef.current) {
          if (username.toLowerCase() === winnerRef.current.toLowerCase()) {
            handleWin();
          }
        }
      });

      await client.connect();
      setConnected(true);
      clientRef.current = client;
    } catch (e) {
      console.error("Chat connection failed", e);
      alert("No se pudo conectar al chat. Verifica tu conexión.");
    }
  };

  const disconnectChat = async () => {
      if (clientRef.current) {
          await clientRef.current.disconnect();
          clientRef.current = null;
          setConnected(false);
      }
  };

  // Start Raffle (Create in DB)
  const handleStartRaffle = async () => {
    if (!raffleTitle.trim()) return alert("¡Debes ponerle un nombre al sorteo!");
    
    try {
        const newRaffle = await createRaffle({
            title: raffleTitle,
            participants: [],
            status: "created"
        });
        if (newRaffle && newRaffle.id) {
            setCurrentRaffleId(newRaffle.id);
            setCurrentPublicId(newRaffle.public_id);
            setStatus("OPEN");
        }
    } catch (e) {
        console.error("Error creating raffle", e);
        alert("Error al iniciar sorteo.");
    }
  };

  // Close and Spin
  const closeEntriesAndSpin = async () => {
    if (participants.length === 0) return alert("¡No hay participantes!");

    setStatus("SPINNING");

    // Open Separate Window
    if (currentRaffleId && currentPublicId) {
        window.open(`/raffle-view/${currentPublicId}`, 'raffle_window', 'width=1000,height=800');
    }

    // Weighted Pool Construction
    let pool = [];
    participants.forEach((p) => {
      pool.push(p); // 1st entry
      if (subscribers.has(p.toLowerCase()) && subMultiplier > 1) {
        // Add extra entries
        for (let i = 1; i < subMultiplier; i++) {
          pool.push(p);
        }
      }
    });

    const randomWinner = pool[Math.floor(Math.random() * pool.length)];
    setWinner(randomWinner);

    // Broadcast Start Spin
    setTimeout(() => {
        channelRef.current?.postMessage({
            type: 'START_SPIN',
            payload: {
                participants: participants,
                winner: randomWinner,
                title: raffleTitle
            }
        });
    }, 1500); // Delay for window load

    // Update Raffle in DB
    if (currentRaffleId) {
      try {
        await updateRaffle(currentRaffleId, {
          participants: participants,
          status: "active",
        });
      } catch (e) {
        console.error("Error updating raffle", e);
      }
    }
  };

  const onWheelFinish = () => {
    setStatus("REVIEW");
  };

  const confirmWinner = () => {
    if (useCountdown) {
        setStatus("WAITING");
        setTimeLeft(countdownDuration);
        channelRef.current?.postMessage({ 
            type: 'WAIT_FOR_WINNER',
            payload: { timeLeft: countdownDuration }
        });
    } else {
        handleWin();
    }
  };

  const handleWin = async () => {
    setStatus("WIN");
    launchConfetti();
    channelRef.current?.postMessage({ type: 'WINNER_CONFIRMED' });

    if (currentRaffleIdRef.current) {
      try {
        await registerWinner(currentRaffleIdRef.current, {
          username: winnerRef.current,
          status: "won",
          claimed_at: new Date(),
        });
      } catch (e) {
        console.error("Failed to register winner", e);
      }
    }
  };

  const handleLoss = async () => {
    setStatus("LOSS");
    channelRef.current?.postMessage({ 
        type: 'TIMEOUT',
        payload: { loser: winner }
    });
    
    if (currentRaffleIdRef.current) {
      try {
        await registerWinner(currentRaffleIdRef.current, {
          username: winnerRef.current,
          status: "lost",
          claimed_at: null,
        });
      } catch (e) {
        console.error("Failed to register loss", e);
      }
    }
  };

  const handleAlAgua = async (username) => {
    if (currentRaffleIdRef.current) {
      try {
        await registerWinner(currentRaffleIdRef.current, {
          username: username,
          status: "al_agua",
          claimed_at: null,
        });
      } catch (e) {
        console.error("Failed to register Al Agua", e);
      }
    }
    
    channelRef.current?.postMessage({
         type: 'SHOW_AL_AGUA',
         payload: { loser: username }
    });

    setWinner(null);
    setStatus("OPEN");
    winnerRef.current = null;
  };

  const handleFinishRaffle = async () => {
      if (currentRaffleIdRef.current) {
          try {
              await updateRaffle(currentRaffleIdRef.current, { status: 'completed' });
          } catch (e) {
              console.error("Error completing raffle", e);
          }
      }
      
      setStatus("IDLE");
      setWinner(null);
      setParticipants([]);
      setCurrentRaffleId(null);
      setCurrentPublicId(null);
      setRaffleTitle("");
      channelRef.current?.postMessage({ type: 'RESET' });
      if (channelRef.current) {
          channelRef.current.close();
          channelRef.current = null;
      }
      navigate('/dashboard');
  };

  const getParticipantBadge = (name) => {
    const lowerName = name.toLowerCase();
    if (subscribers.has(lowerName)) return <Star size={12} className="text-[#ff00ff]" />;
    return <div className="w-2 h-2 rounded-full bg-[#00f3ff]"></div>;
  };

  // Derived state for display
  const displayedParticipants = participants.map(name => ({
      username: name,
      isSubscriber: subscribers.has(name.toLowerCase())
  }));


  return (
    <Layout>
            {/* Top Bar / Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="text-center md:text-left">
                    <h1 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter glitch-text mb-2" data-text="NUEVO SORTEO">
                        NUEVO SORTEO
                    </h1>
                    <p className="text-slate-400 font-medium tracking-wide">
                        Configura las reglas. <span className="text-[#00f3ff]">Domina el azar.</span>
                    </p>
                </div>

                {status !== "IDLE" && (
                    <div className="flex gap-4">
                         <button
                            onClick={handleFinishRaffle}
                            className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg font-bold uppercase tracking-wider text-xs transition-all"
                        >
                            Cancelar / Salir
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Panel: Configuration */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Channel Selector */}
                     <div className="bg-[#0c0c1e] p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f3ff]/5 rounded-full blur-3xl group-hover:bg-[#00f3ff]/10 transition-colors"></div>
                        
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="p-2 bg-[#00f3ff]/10 rounded-lg text-[#00f3ff]">
                                <Twitch size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Canal a conectar</h2>
                        </div>
                        
                        <div className="relative">
                            <select 
                                value={selectedChannel}
                                onChange={(e) => setSelectedChannel(e.target.value)}
                                disabled={connected || status !== "IDLE"}
                                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 appearance-none focus:border-[#00f3ff] focus:ring-1 focus:ring-[#00f3ff] transition-all outline-none font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value={user?.username}>{user?.username} (Mi Canal)</option>
                                {moderatedChannels.map(channel => (
                                    <option key={channel.id} value={channel.login}>
                                        {channel.username} (Mod)
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronDown size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Basic Info Card */}
                    <div className="bg-[#0c0c1e] p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff00ff]/5 rounded-full blur-3xl group-hover:bg-[#ff00ff]/10 transition-colors"></div>
                        
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="p-2 bg-[#ff00ff]/10 rounded-lg text-[#ff00ff]">
                                <Type size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Información Básica</h2>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Título del Sorteo</label>
                                <input
                                    type="text"
                                    value={raffleTitle}
                                    onChange={(e) => setRaffleTitle(e.target.value)}
                                    disabled={status !== "IDLE"}
                                    placeholder="Ej: Sorteo Especial 1K..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-[#ff00ff] focus:ring-1 focus:ring-[#ff00ff] transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Keyword (Comando)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">!</span>
                                    <input
                                        type="text"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        disabled={status !== "IDLE"}
                                        placeholder="participo"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder-slate-600 focus:border-[#ff00ff] focus:ring-1 focus:ring-[#ff00ff] transition-all outline-none font-mono"
                                    />
                                </div>
                            </div>
                            
                            {/* Manual Entry Removed per redesign */}
                        </div>
                    </div>

                    {/* Advanced Options */}
                     <div className="bg-[#0c0c1e] p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00]/5 rounded-full blur-3xl group-hover:bg-[#ccff00]/10 transition-colors"></div>
                        
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-2 bg-[#ccff00]/10 rounded-lg text-[#ccff00]">
                                <Settings size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Opciones Avanzadas</h2>
                        </div>
                        
                        <div className="space-y-6 relative z-10">
                             {/* Countdown Config */}
                             <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${useCountdown ? 'bg-[#00f3ff]/20 text-[#00f3ff]' : 'bg-slate-800 text-slate-500'}`}>
                                        <Timer size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Cuenta Regresiva</div>
                                        <div className="text-xs text-slate-500">Tiempo límite para unirse</div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={useCountdown} onChange={(e) => setUseCountdown(e.target.checked)} disabled={status !== "IDLE"} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00f3ff]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f3ff]"></div>
                                </label>
                            </div>

                            {useCountdown && (
                                <div className="ml-2 pl-4 border-l-2 border-[#00f3ff]/20">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duración (segundos)</label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="300"
                                        value={countdownDuration}
                                        onChange={(e) => setCountdownDuration(parseInt(e.target.value))}
                                        disabled={status !== "IDLE"}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#00f3ff] outline-none font-mono text-center"
                                    />
                                </div>
                            )}

                            {/* Subscriber Luck */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suerte de Suscriptor</label>
                                    <span className="text-xs font-mono text-[#ccff00] bg-[#ccff00]/10 px-2 py-1 rounded">x{subMultiplier}</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    step="1"
                                    value={subMultiplier}
                                    onChange={(e) => setSubMultiplier(parseInt(e.target.value))}
                                    disabled={status !== "IDLE"}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#ccff00]"
                                />
                            </div>

                            {/* Subscriber Only Toggle */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${subscribersOnly ? 'bg-[#ff00ff]/20 text-[#ff00ff]' : 'bg-slate-800 text-slate-500'}`}>
                                        <Lock size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Solo Suscriptores</div>
                                        <div className="text-xs text-slate-500">Exclusivo para subs</div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={subscribersOnly} onChange={(e) => setSubscribersOnly(e.target.checked)} disabled={status !== "IDLE"} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#ff00ff]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff00ff]"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Chat & Participants */}
                <div className="lg:col-span-8 flex flex-col h-[calc(100vh-200px)]">
                    
                    {/* Status Bar */}
                    <div className="bg-[#0c0c1e] p-4 rounded-t-2xl border-x border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${connected ? 'bg-[#00f3ff]/10 text-[#00f3ff] border-[#00f3ff]/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-[#00f3ff] animate-pulse' : 'bg-red-500'}`}></div>
                                {connected ? 'Conectado al Chat' : 'Desconectado'}
                            </div>
                            <div className="h-4 w-px bg-white/10"></div>
                             <div className="text-slate-400 text-sm">
                                Canal: <span className="text-white font-bold">{selectedChannel || user?.username}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-500">Participantes:</span>
                            <span className="text-xl font-mono font-bold text-white">{displayedParticipants.length}</span>
                        </div>
                    </div>

                    {/* Chat Area / Participants Grid */}
                    <div className="flex-1 bg-black/40 border-x border-white/10 relative overflow-hidden group">
                        {/* Background particles or grid could go here */}
                         
                        <div className="absolute inset-0 p-4">
                            {displayedParticipants.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                                    <MessageSquare size={48} className="mb-4" />
                                    <p className="text-lg font-medium">Esperando participantes...</p>
                                    <p className="text-xs uppercase tracking-widest mt-2">{connected ? `Escribe !${keyword} en el chat` : 'Conecta el chat para comenzar'}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 content-start h-full overflow-y-auto pr-2 custom-scrollbar">
                                    {displayedParticipants.map((p, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-[#0c0c1e] p-2 rounded-lg border border-white/5 animate-in zoom-in-50 duration-300 hover:border-white/20 transition-colors">
                                            {p.isSubscriber ? <Star size={12} className="text-[#ff00ff]" fill="currentColor" /> : <div className="w-2 h-2 rounded-full bg-[#00f3ff]"></div>}
                                            <span className={`truncate text-sm font-medium ${p.isSubscriber ? 'text-white' : 'text-slate-300'}`}>
                                                {p.username}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-[#0c0c1e] p-6 rounded-b-2xl border-x border-b border-white/10 shadow-2xl relative z-20">
                         <div className="flex gap-4">
                            {!connected ? (
                                <button
                                    onClick={connectToChat}
                                    className="flex-1 py-4 bg-[#00f3ff] hover:bg-[#00e0eb] text-black font-black uppercase text-xl tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transform hover:-translate-y-1 active:translate-y-0"
                                >
                                    Conectar Chat
                                </button>
                            ) : (
                                <>
                                    {status === "IDLE" ? (
                                        <>
                                            <button
                                                onClick={disconnectChat}
                                                className="px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold uppercase tracking-wider rounded-xl border border-red-500/20 hover:border-red-500/50 transition-all"
                                            >
                                                Desconectar
                                            </button>
                                            <button
                                                onClick={handleStartRaffle}
                                                className="flex-1 py-4 bg-[#ccff00] hover:bg-[#b3e600] text-black font-black uppercase text-xl tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none items-center justify-center gap-2 flex"
                                            >
                                                <Play size={24} fill="black" />
                                                Iniciar Sorteo
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={closeEntriesAndSpin}
                                            disabled={participants.length === 0}
                                            className="flex-1 py-4 bg-[#ff00ff] hover:bg-[#d900d9] text-white font-black uppercase text-xl tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(255,0,255,0.3)] hover:shadow-[0_0_30px_rgba(255,0,255,0.5)] transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center gap-2 flex animate-pulse"
                                        >
                                            <Play size={24} fill="white" />
                                            {status === "OPEN" ? "¡GIRAR RULETA!" : "Sorteo en Progreso..."}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Status Overlays */}
            {status === "REVIEW" && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                     <div className="bg-[#0c0c1e] p-8 rounded-2xl border border-white/10 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-[#00f3ff] via-[#ff00ff] to-[#ccff00]"></div>
                        
                        <h3 className="text-2xl font-bold text-white mb-2">🎉 ¡Tenemos Ganador!</h3>
                        <div className="text-4xl font-black text-[#ccff00] my-6 font-mono tracking-wider">
                            {winner}
                        </div>
                        
                        <div className="flex gap-4 justify-center">
                             <button
                               onClick={confirmWinner}
                               className="flex-1 bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-xl transition-all"
                             >
                               Confirmar
                             </button>
                             <button
                               onClick={() => handleAlAgua(winner)}
                               className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-all"
                             >
                               Al Agua
                             </button>
                        </div>
                     </div>
                </div>
            )}

            {/* Winner Confirmed Overlay */}
            {status === "WIN" && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                     <div className="bg-[#0c0c1e] p-8 rounded-2xl border border-[#ccff00]/30 max-w-md w-full text-center shadow-[0_0_50px_rgba(204,255,0,0.2)]">
                        <Star size={48} className="mx-auto text-[#ccff00] mb-4 animate-bounce" fill="currentColor" />
                        <h3 className="text-3xl font-black text-white mb-2 uppercase italic">¡Felicidades!</h3>
                        <div className="text-xl text-slate-300 mb-8">
                            <span className="text-[#ccff00] font-bold text-2xl">@{winner}</span> ha ganado el sorteo.
                        </div>
                        
                        <button
                           onClick={handleFinishRaffle}
                           className="w-full bg-[#ccff00] hover:bg-[#b3e600] text-black font-bold py-4 rounded-xl transition-all uppercase tracking-widest"
                         >
                           Finalizar y Volver
                         </button>
                     </div>
                </div>
            )}

    </Layout>
  );
};

export default RafflePage;
