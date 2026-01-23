import React, { useState, useEffect, useRef } from 'react';
import './RaffleWheel.css';

const RaffleWheel = ({ participants, spinning, winner, onAnimationFinish }) => {
  const [strip, setStrip] = useState([]);
  const [offset, setOffset] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0);
  const lastWinnerRef = useRef(null);
  const itemHeight = 60; // Height of each name item in pixels

  useEffect(() => {
    if (spinning && winner && participants.length > 0) {
      // 1. Generate a long strip of names
      const revolutions = 5; // How many times to loop through the list?
      const minItems = 50;   // Minimum items to scroll through
      let tempStrip = [];
      
      // Fill with random participants to create length
      while (tempStrip.length < minItems) {
        tempStrip = [...tempStrip, ...participants];
      }
      
      // Ensure specific random slice to make it look organic, but end with winner
      // Let's just make sure the VERY LAST item is the winner for simplicity of landing
      // Or 2nd to last to have padding
      tempStrip.push(winner);
      
      // Add padding items after the winner so it doesn't look like the end of the list
      for(let i=0; i<3; i++) {
          tempStrip.push(participants[Math.floor(Math.random() * participants.length)]);
      }
      
      setStrip(tempStrip);
      
      // 2. Reset position (instant)
      setTransitionDuration(0);
      setOffset(0);

      // 3. Trigger animation (next tick)
      setTimeout(() => {
        // Calculate total height to scroll: (total items - 1) * itemHeight
        // We want to land on the winner item.
        // It is at index: Length - 1 - 3 (padding)
        
        const landingIndex = tempStrip.length - 1 - 3;
        
        // Center calculation needs to be consistent
        const targetOffset = (landingIndex * itemHeight) - 34;
        
        setTransitionDuration(6); // 6 seconds slow down
        setOffset(targetOffset);
        
        // Update last winner
        lastWinnerRef.current = winner;
      }, 50);

    } else if (!spinning) {
        // Only reset to static strip if we don't have a strip yet (fresh mount)
        // OR if the winner has changed (e.g. Al Agua -> New Winner/Loser name)
        // This prevents the visual "disappearance" glitch when spin ends
        
        if (winner && (strip.length === 0 || lastWinnerRef.current !== winner)) {
            setStrip([winner]);
            setOffset(-34); // Keep it centered: 0 (top) - 34 (shift)
            setTransitionDuration(0);
            lastWinnerRef.current = winner;
        }
    }
  }, [spinning, winner, participants]);

  const handleTransitionEnd = () => {
      if (spinning) {
          onAnimationFinish();
      }
  };

  return (
    <div className="wheel-container border-4 border-purple-500 rounded-xl bg-slate-900 overflow-hidden h-32 relative shadow-[0_0_30px_rgba(168,85,247,0.4)] w-full max-w-md mx-auto">
       {/* Selector Arrows / Highlight */}
       <div className="absolute top-1/2 left-4 -translate-y-1/2 text-yellow-400 text-2xl z-20">▶</div>
       <div className="absolute top-1/2 right-4 -translate-y-1/2 text-yellow-400 text-2xl z-20">◀</div>
       <div className="absolute top-1/2 left-0 w-full h-16 -translate-y-1/2 bg-skin-border/5 pointer-events-none z-10 border-y border-skin-border/30"></div>

      <div 
        className="wheel-strip flex flex-col items-center"
        style={{
            transform: `translateY(-${offset}px)`,
            transition: `transform ${transitionDuration}s cubic-bezier(0.1, 0.7, 0.1, 1)` // Custom ease-out for reel effect
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {strip.length > 0 ? (
            strip.map((name, i) => (
                <div key={i} className="flex items-center justify-center font-bold text-2xl text-slate-300" style={{ height: `${itemHeight}px`, flexShrink: 0 }}>
                    {name.toUpperCase()}
                </div>
            ))
        ) : (
             <div className="flex items-center justify-center font-bold text-2xl text-slate-500" style={{ height: '128px' }}>
                ESPERANDO...
            </div>
        )}
      </div>
      
      {/* Gradient Masks */}
      <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-slate-900 to-transparent z-10"></div>
      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
    </div>
  );
};

export default RaffleWheel;
