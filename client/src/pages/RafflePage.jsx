import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import tmi from "tmi.js";
import confetti from "canvas-confetti";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { 
    Twitch, Type, Settings, Timer, Lock, 
    MessageSquare, Star, Play, Loader2, 
    Trash2, ChevronDown, Users, Monitor, Copy,
    Clock, RefreshCw
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
  const [pastWinners, setPastWinners] = useState(new Set());

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

    // 1. Open Separate Window (Sync for popup blockers)
    if (currentPublicId) {
        window.open(`/raffle/${currentPublicId}`, 'raffle_window', 'width=1000,height=800');
    }

    // 2. Determine winner from ELIGIBLE participants only
    const eligibleParticipants = participants.filter(p => !pastWinners.has(p));
    
    if (eligibleParticipants.length === 0) return alert("¡No hay participantes elegibles!");

    const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
    const selectedWinner = eligibleParticipants[randomIndex];
    winnerRef.current = selectedWinner;
    
    // 2. Sync to Backend (Critical for OBS/Remote View)
    if (currentRaffleIdRef.current) {
        try {
             // Register pending winner so OBS knows who to spin to
             await registerWinner(currentRaffleIdRef.current, {
                username: selectedWinner,
                status: "pending_reveal",
                claimed_at: null
             });
             // Set status to SPINNING and Sync Participants (SEND FULL LIST for history)
             await updateRaffle(currentRaffleIdRef.current, { 
                status: 'spinning',
                participants: participants 
             });
        } catch (e) {
             console.error("Failed to sync spin state", e);
        }
    }

    // 3. Update Local State
    setWinner(selectedWinner);
    setStatus("SPINNING"); // UI switches to wheel
    
    // 4. Notify Local Broadcast (Legacy support)
    channelRef.current?.postMessage({
        type: 'START_SPIN',
        payload: {
            participants: eligibleParticipants, // Send only eligible to legacy view if used
            winner: selectedWinner,
            title: raffleTitle
        }
    });

    // 5. Wheel spin triggered by status change to SPINNING
  };

  const onWheelFinish = () => {
    setStatus("REVIEW");
  };

  const confirmWinner = async () => {
    if (useCountdown) {
        setStatus("WAITING");
        setTimeLeft(countdownDuration);
        channelRef.current?.postMessage({ 
            type: 'WAIT_FOR_WINNER',
            payload: { timeLeft: countdownDuration }
        });

        // Sync to backend for polling view
        // We use 'claimed_at' to store the EXPIRATION time during the waiting phase
        const expirationTime = new Date(Date.now() + countdownDuration * 1000);
        
        if (currentRaffleIdRef.current) {
            try {
                await registerWinner(currentRaffleIdRef.current, {
                    username: winnerRef.current,
                    status: "waiting_claim",
                    claimed_at: expirationTime.toISOString()
                });
            } catch (e) {
                console.error("Failed to sync waiting state", e);
            }
        }
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
      setPastWinners(new Set());
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

  const handleContinueRaffle = () => {
      // Add current winner to pastWinners (only if they WON, keep them if TIMEOUT/LOSS/AL_AGUA)
      if (winner && status === 'WIN') {
          setPastWinners(prev => new Set(prev).add(winner));
      }
      
      // Reset state for next spin
      setWinner(null);
      winnerRef.current = null;
      setStatus("OPEN");
      
      // Notify remote view to reset
      channelRef.current?.postMessage({ type: 'RESET_ROUND' });
  };

  const handleImportFollowers = async () => {
    setIsImporting(true);
    try {
        const data = await getFollowers(user?.uid);
        if (data && data.followers) {
            const newNames = data.followers.map(f => f.username);
            setFollowers(prev => {
                const newSet = new Set(prev);
                newNames.forEach(n => newSet.add(n.toLowerCase()));
                return newSet;
            });
            setParticipants(prev => {
                const unique = new Set([...prev, ...newNames]);
                return Array.from(unique);
            });
            alert(`Importados ${newNames.length} seguidores.`);
        }
    } catch (e) {
        console.error("Error importing followers", e);
        alert("Error al importar seguidores.");
    } finally {
        setIsImporting(false);
    }
  };

  const handleImportSubscribers = async () => {
    setIsImporting(true);
    try {
        const data = await getSubscribers(user?.uid);
        if (data && data.subscribers) {
            const newNames = data.subscribers.map(s => s.username);
            setSubscribers(prev => {
                const newSet = new Set(prev);
                newNames.forEach(n => newSet.add(n.toLowerCase()));
                return newSet;
            });
            // Optionally add them to participants too if you want them to automatically join
             setParticipants(prev => {
                const unique = new Set([...prev, ...newNames]);
                return Array.from(unique);
            });
            alert(`Importados ${newNames.length} suscriptores.`);
        }
    } catch (e) {
        console.error("Error importing subscribers", e);
        alert("Error al importar suscriptores. (Requiere ser el broadcaster)");
    } finally {
        setIsImporting(false);
    }
  };

  const handleImportChatters = async () => {
    if (!channel) return alert("Error: No hay canal definido");
    setIsImporting(true);
    try {
        const data = await getChatters();
        if (data && data.chatters) {
            const newNames = data.chatters.map(c => c.username);
            setParticipants(prev => {
                const unique = new Set([...prev, ...newNames]);
                return Array.from(unique);
            });
            alert(`Importados ${newNames.length} viewers.`);
        }
    } catch (e) {
        console.error("Error importing chatters", e);
        alert("Error al importar viewers. (Asegúrate de estar en vivo o tener el chat conectado)");
    } finally {
        setIsImporting(false);
    }
  };

  const handleManualAdd = () => {
      if (!manualInput.trim()) return;
      const names = manualInput.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
      setParticipants(prev => {
          const unique = new Set([...prev, ...names]);
          return Array.from(unique);
      });
      setManualInput("");
      // alert(`Agregados ${names.length} participantes.`);
  };

  const handleRemoveParticipant = (username) => {
      setParticipants(prev => prev.filter(p => p !== username));
  };

  const handleClearParticipants = () => {
      if (window.confirm("¿Estás seguro de que quieres eliminar a TODOS los participantes?")) {
          setParticipants([]);
          setWinner(null);
          setStatus("IDLE");
      }
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
                    <h1 className="text-5xl md:text-6xl text-skin-text-base theme-title glitch-text mb-2" data-text="NUEVO SORTEO">
                        NUEVO SORTEO
                    </h1>
                    <p className="text-skin-text-muted font-medium tracking-wide">
                        Configura las reglas. <span className="text-skin-accent">Domina el azar.</span>
                    </p>
                </div>

                {status !== "IDLE" && (
                    <div className="flex gap-4">
                         <button
                            onClick={handleFinishRaffle}
                            className="px-6 py-2 bg-skin-danger/10 hover:bg-skin-danger/20 text-skin-danger border border-skin-danger/20 rounded-lg font-bold uppercase tracking-wider text-xs transition-all"
                        >
                            Cancelar / Salir
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Panel: Configuration */}
                <div className="lg:col-span-4 space-y-6">
                                       {/* Import Participants */}
                    <div className="bg-skin-base-secondary p-6 rounded-2xl border border-skin-border shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-skin-secondary/5 rounded-full blur-3xl group-hover:bg-skin-primary/10 transition-colors"></div>
                        
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="p-2 bg-skin-secondary/10 rounded-lg text-skin-secondary">
                                <Users size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-skin-text-base tracking-tight">Importar</h2>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <button
                                onClick={handleImportChatters}
                                disabled={isImporting || status !== "IDLE" || !connected}
                                className="w-full py-3 bg-skin-panel hover:bg-skin-border border border-skin-border rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                                title={!connected ? "Conecta el chat primero" : ""}
                            >
                                {isImporting ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} className="text-skin-text-muted" />}
                                <span className="font-bold text-skin-text-base">Importar Viewers (Chat)</span>
                            </button>
                            <button
                                onClick={handleImportFollowers}
                                disabled={isImporting || status !== "IDLE" || !connected}
                                className="w-full py-3 bg-skin-panel hover:bg-skin-border border border-skin-border rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                                title={!connected ? "Conecta el chat primero" : ""}
                            >
                                {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Users size={18} className="text-skin-text-muted" />}
                                <span className="font-bold text-skin-text-base">Importar Followers</span>
                            </button>
                            <button
                                onClick={handleImportSubscribers}
                                disabled={isImporting || status !== "IDLE" || !connected}
                                className="w-full py-3 bg-skin-panel hover:bg-skin-border border border-skin-border rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                                title={!connected ? "Conecta el chat primero" : ""}
                            >
                               {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Star size={18} className="text-skin-text-muted" />}
                                <span className="font-bold text-skin-text-base">Importar Subs</span>
                            </button>
                        </div>
                    </div>

                    {/* Basic Info Card */}
                    <div className="bg-skin-base-secondary p-6 rounded-2xl border border-skin-border shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-skin-secondary/5 rounded-full blur-3xl group-hover:bg-skin-secondary/10 transition-colors"></div>
                        
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="p-2 bg-skin-secondary/10 rounded-lg text-skin-secondary">
                                <Type size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-skin-text-base tracking-tight">Información Básica</h2>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <label className="block text-xs font-bold text-skin-text-muted uppercase tracking-wider mb-2">Título del Sorteo</label>
                                <input
                                    type="text"
                                    value={raffleTitle}
                                    onChange={(e) => setRaffleTitle(e.target.value)}
                                    disabled={status !== "IDLE"}
                                    placeholder="Ej: Sorteo Especial 1K..."
                                    className="w-full bg-skin-panel border border-skin-border rounded-xl px-4 py-3 text-skin-text-base placeholder-skin-text-muted focus:border-skin-secondary focus:ring-1 focus:ring-skin-secondary transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-skin-text-muted uppercase tracking-wider mb-2">Keyword (Comando)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-skin-text-muted font-bold">!</span>
                                    <input
                                        type="text"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        disabled={status !== "IDLE"}
                                        placeholder="participo"
                                        className="w-full bg-skin-panel border border-skin-border rounded-xl pl-8 pr-4 py-3 text-skin-text-base placeholder-skin-text-muted focus:border-skin-secondary focus:ring-1 focus:ring-skin-secondary transition-all outline-none font-mono"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-skin-text-muted uppercase tracking-wider mb-2">Agregar Manualmente</label>
                                <div className="flex flex-col gap-2">
                                    <textarea
                                        value={manualInput}
                                        onChange={(e) => setManualInput(e.target.value)}
                                        disabled={status !== "IDLE" && status !== "OPEN"}
                                        placeholder="Nombres separados por coma o enter..."
                                        className="w-full bg-skin-panel border border-skin-border rounded-xl px-4 py-3 text-skin-text-base placeholder-skin-text-muted focus:border-skin-secondary focus:ring-1 focus:ring-skin-secondary transition-all outline-none min-h-[80px]"
                                    />
                                    <button
                                        onClick={handleManualAdd}
                                        disabled={!manualInput.trim() || (status !== "IDLE" && status !== "OPEN")}
                                        className="px-4 py-2 bg-skin-base-secondary hover:bg-skin-border border border-skin-border rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                                    >
                                        Agregar Lista
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Options */}
                     <div className="bg-skin-base-secondary p-6 rounded-2xl border border-skin-border shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-skin-success/5 rounded-full blur-3xl group-hover:bg-skin-success/10 transition-colors"></div>
                        
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-2 bg-skin-success/10 rounded-lg text-skin-success">
                                <Settings size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-skin-text-base tracking-tight">Opciones Avanzadas</h2>
                        </div>
                        
                        <div className="space-y-6 relative z-10">
                             {/* Countdown Config */}
                             <div className="flex items-center justify-between p-3 rounded-xl bg-skin-panel border border-skin-border hover:border-skin-text-muted/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${useCountdown ? 'bg-skin-accent/20 text-skin-accent' : 'bg-skin-panel text-skin-text-muted'}`}>
                                        <Timer size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-skin-text-base">Cuenta Regresiva</div>
                                        <div className="text-xs text-skin-text-muted">Tiempo límite para unirse</div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={useCountdown} onChange={(e) => setUseCountdown(e.target.checked)} disabled={status !== "IDLE"} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-skin-panel peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-skin-accent/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-skin-base after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-skin-text-base after:border-skin-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-skin-accent"></div>
                                </label>
                            </div>

                            {useCountdown && (
                                <div className="ml-2 pl-4 border-l-2 border-skin-accent/20">
                                    <label className="block text-xs font-bold text-skin-text-muted uppercase tracking-wider mb-2">Duración (segundos)</label>
                                    <select
                                        value={isNaN(countdownDuration) ? 60 : countdownDuration}
                                        onChange={(e) => setCountdownDuration(parseInt(e.target.value))}
                                        disabled={status !== "IDLE"}
                                        className="w-full bg-skin-panel border border-skin-border rounded-xl px-4 py-2 text-skin-text-base focus:border-skin-accent outline-none font-mono text-center appearance-none cursor-pointer hover:bg-skin-panel/80 transition-colors"
                                    >
                                        {[10, 20, 30, 40, 50, 60].map(val => (
                                            <option key={val} value={val}>{val} segundos</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Subscriber Luck */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-skin-text-muted uppercase tracking-wider">Suerte de Suscriptor</label>
                                    <span className="text-xs font-mono text-skin-success bg-skin-success/10 px-2 py-1 rounded">x{subMultiplier}</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    step="1"
                                    value={isNaN(subMultiplier) ? 1 : subMultiplier}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setSubMultiplier(isNaN(val) ? 1 : val);
                                    }}
                                    disabled={status !== "IDLE"}
                                    className="w-full h-1 bg-skin-panel rounded-lg appearance-none cursor-pointer accent-skin-success"
                                />
                            </div>

                            {/* Subscriber Only Toggle */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-skin-panel border border-skin-border hover:border-skin-text-muted/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${subscribersOnly ? 'bg-skin-secondary/20 text-skin-secondary' : 'bg-skin-panel text-skin-text-muted'}`}>
                                        <Lock size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-skin-text-base">Solo Suscriptores</div>
                                        <div className="text-xs text-skin-text-muted">Exclusivo para subs</div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={subscribersOnly} onChange={(e) => setSubscribersOnly(e.target.checked)} disabled={status !== "IDLE"} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-skin-panel peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-skin-secondary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-skin-base after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-skin-text-base after:border-skin-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-skin-secondary"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Chat & Participants */}
                <div className="lg:col-span-8 flex flex-col h-[calc(100vh-200px)]">
                    
                    {/* Status Bar */}
                    <div className="bg-skin-base-secondary p-4 rounded-t-2xl border-x border-t border-skin-border flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${connected ? 'bg-skin-accent/10 text-skin-accent border-skin-accent/20' : 'bg-skin-danger/10 text-skin-danger border-skin-danger/20'}`}>
                                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-skin-accent animate-pulse' : 'bg-skin-danger'}`}></div>
                                {connected ? 'Conectado al Chat' : 'Desconectado'}
                            </div>
                            <div className="h-4 w-px bg-skin-border"></div>
                             <div className="text-skin-text-muted text-sm">
                                Canal: <span className="text-skin-text-base font-bold">{user?.username}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-skin-text-muted">Participantes:</span>
                                <span className="text-xl font-mono font-bold text-skin-text-base">{displayedParticipants.length}</span>
                            </div>
                            {participants.length > 0 && (status === "IDLE" || status === "OPEN") && (
                                <button 
                                    onClick={handleClearParticipants}
                                    className="px-3 py-2 bg-skin-danger hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-red-900/20"
                                    title="Eliminar todos los participantes"
                                >
                                    <Trash2 size={16} />
                                    <span className="text-xs font-bold uppercase">Borrar Todos</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Chat Area / Participants Grid */}
                    <div className="flex-1 bg-skin-panel border-x border-skin-border relative overflow-hidden group">
                        {/* Background particles or grid could go here */}
                         
                        <div className="absolute inset-0 p-4">
                            {displayedParticipants.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-skin-text-muted opacity-50">
                                    <MessageSquare size={48} className="mb-4" />
                                    <p className="text-lg font-medium">Esperando participantes...</p>
                                    <p className="text-xs uppercase tracking-widest mt-2">{connected ? `Escribe !${keyword} en el chat` : 'Conecta el chat para comenzar'}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 content-start h-full overflow-y-auto pr-2 custom-scrollbar">
                                    {displayedParticipants.map((p, idx) => (
                                        <div key={idx} className="group/item flex items-center justify-between bg-skin-base-secondary p-2 rounded-lg border border-skin-border animate-in zoom-in-50 duration-300 hover:border-skin-border/50 transition-colors">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {p.isSubscriber ? <Star size={12} className="text-skin-secondary shrink-0" fill="currentColor" /> : <div className="w-2 h-2 rounded-full bg-skin-accent shrink-0"></div>}
                                                <span className={`truncate text-sm font-medium ${p.isSubscriber ? 'text-skin-text-base' : 'text-skin-text-muted'}`}>
                                                    {p.username}
                                                </span>
                                            </div>
                                            {(status === "IDLE" || status === "OPEN") && (
                                                <button
                                                    onClick={() => handleRemoveParticipant(p.username)}
                                                    className="p-1.5 bg-skin-danger/10 text-skin-danger hover:bg-skin-danger hover:text-white rounded-md transition-all"
                                                    title="Eliminar participante"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-skin-base-secondary p-6 rounded-b-2xl border-x border-b border-skin-border shadow-2xl relative z-20 space-y-4">
                         
                         {/* OBS Link Section */}
                         {connected && currentPublicId && (
                            <div className="flex items-center gap-2 bg-skin-panel p-2 rounded-lg border border-skin-border/50">
                                <div className="p-1.5 bg-skin-accent/10 rounded text-skin-accent">
                                    <Monitor size={16} />
                                </div>
                                <div className="flex-1 truncate text-xs font-mono text-skin-text-muted">
                                    {`${window.location.origin}/raffle/${currentPublicId}`}
                                </div>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/raffle/${currentPublicId}`);
                                        alert("Link copiado al portapapeles! Úsalo como 'Browser Source' en OBS.");
                                    }}
                                    className="p-1.5 text-skin-text-base hover:text-skin-accent hover:bg-skin-accent/10 rounded transition-colors"
                                    title="Copiar Link para OBS"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                         )}

                         <div className="flex gap-4">
                            {!connected ? (
                                <button
                                    onClick={connectToChat}
                                    className="flex-1 py-4 bg-skin-accent hover:bg-skin-accent-hover text-black font-black uppercase text-xl tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(var(--color-accent),0.3)] hover:shadow-[0_0_30px_rgba(var(--color-accent),0.5)] transform hover:-translate-y-1 active:translate-y-0"
                                >
                                    Conectar Chat
                                </button>
                            ) : (
                                <>
                                    {status === "IDLE" ? (
                                        <>
                                            <button
                                                onClick={disconnectChat}
                                                className="px-6 py-4 bg-skin-danger/10 hover:bg-skin-danger/20 text-skin-danger font-bold uppercase tracking-wider rounded-xl border border-skin-danger/20 hover:border-skin-danger/50 transition-all"
                                            >
                                                Desconectar
                                            </button>
                                            <button
                                                onClick={handleStartRaffle}
                                                className="flex-1 py-4 bg-skin-success hover:bg-skin-success/80 text-black font-black uppercase text-xl tracking-widest rounded-xl transition-all shadow-lg shadow-skin-success/20 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none items-center justify-center gap-2 flex"
                                            >
                                                <Play size={24} fill="black" />
                                                Iniciar Sorteo
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={closeEntriesAndSpin}
                                            disabled={participants.filter(p => !pastWinners.has(p)).length === 0}
                                            className="flex-1 py-4 bg-skin-secondary hover:bg-skin-secondary/80 text-skin-text-base font-black uppercase text-xl tracking-widest rounded-xl transition-all shadow-lg shadow-skin-secondary/20 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center gap-2 flex animate-pulse"
                                        >
                                            <Play size={24} className="text-skin-base" fill="currentColor" />
                                            {status === "OPEN" 
                                                ? `¡GIRAR RULETA! (${participants.filter(p => !pastWinners.has(p)).length})` 
                                                : "Sorteo en Progreso..."}
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
                     <div className="bg-skin-base-secondary p-8 rounded-2xl border border-skin-border max-w-md w-full text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-skin-accent via-skin-secondary to-skin-success"></div>
                        
                        <h3 className="text-2xl font-bold text-skin-text-base mb-2">🎉 ¡Tenemos Ganador!</h3>
                        <div className="text-4xl font-black text-skin-success my-6 font-mono tracking-wider">
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
                     <div className="bg-skin-base-secondary p-8 rounded-2xl border border-skin-success/30 max-w-md w-full text-center shadow-2xl shadow-skin-success/10">
                        <Star size={48} className="mx-auto text-skin-success mb-4 animate-bounce" fill="currentColor" />
                        <h3 className="text-3xl font-black text-skin-text-base mb-2 uppercase italic">¡Felicidades!</h3>
                        <div className="text-xl text-skin-text-muted mb-8">
                            <span className="text-skin-success font-bold text-2xl">@{winner}</span> ha ganado el sorteo.
                        </div>
                        
                        <div className="flex gap-4">
                            <button
                               onClick={handleContinueRaffle}
                               className="flex-1 bg-skin-secondary hover:bg-skin-secondary/80 text-skin-base font-bold py-4 rounded-xl transition-all uppercase tracking-widest"
                             >
                               Sortear Otro
                             </button>
                            <button
                               onClick={handleFinishRaffle}
                               className="flex-1 bg-skin-success hover:bg-skin-success/80 text-black font-bold py-4 rounded-xl transition-all uppercase tracking-widest"
                             >
                               Finalizar
                             </button>
                        </div>
                     </div>
                </div>
            )}

            {/* Loss / Timeout Overlay */}
            {status === "LOSS" && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                     <div className="bg-skin-base-secondary p-8 rounded-2xl border border-skin-danger/30 max-w-md w-full text-center shadow-2xl shadow-skin-danger/10">
                        <Clock size={48} className="mx-auto text-skin-danger mb-4 animate-pulse" />
                        <h3 className="text-3xl font-black text-skin-text-base mb-2 uppercase italic">¡Tiempo Agotado!</h3>
                        <div className="text-xl text-skin-text-muted mb-8">
                            <span className="text-skin-danger font-bold text-2xl">@{winner}</span> perdió su oportunidad.
                        </div>
                        
                        <div className="flex gap-4">
                            <button
                               onClick={handleContinueRaffle}
                               className="flex-1 bg-skin-secondary hover:bg-skin-secondary/80 text-skin-base font-bold py-4 rounded-xl transition-all uppercase tracking-widest"
                            >
                                <RefreshCw size={20} className="inline mr-2 mb-1" />
                                Sortear Otro
                            </button>
                            <button
                               onClick={handleFinishRaffle}
                               className="px-6 bg-skin-base hover:bg-skin-panel text-skin-text-muted font-bold rounded-xl transition-all border border-skin-border"
                            >
                                Finalizar
                            </button>
                        </div>
                     </div>
                </div>
            )}

    </Layout>
  );
};

export default RafflePage;
