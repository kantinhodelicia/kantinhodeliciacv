
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Gamepad2, Play, Trophy, RotateCcw, Zap, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Pizza, Flame, Beer, Star, Maximize } from 'lucide-react';

interface Props {
  onClose: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  life: number;
}

type FoodType = 'NORMAL' | 'CHILI' | 'DRINK' | 'GOLDEN';

interface FoodItem {
  x: number;
  y: number;
  type: FoodType;
}

const GameModal: React.FC<Props> = ({ onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('kd_snake_highscore');
    return saved ? parseInt(saved) : 0;
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);
  const [speed, setSpeed] = useState(130);
  const [isCaliente, setIsCaliente] = useState(false);
  const [shake, setShake] = useState(0);
  
  const touchStartRef = useRef<{x: number, y: number} | null>(null);

  const gridSize = 20;
  const initialSnake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
  const snakeRef = useRef(initialSnake);
  const foodRef = useRef<FoodItem>({ x: 5, y: 5, type: 'NORMAL' });
  const directionRef = useRef({ x: 0, y: -1 });
  
  // Buffer de input para evitar suicídio por giro rápido
  const inputQueueRef = useRef<{x: number, y: number}[]>([]);
  
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = (type: 'eat' | 'powerup' | 'death') => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'eat') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'powerup') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(660, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        osc.start(); osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  };

  const createParticles = (x: number, y: number, color: string, count = 8) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        id: Math.random(),
        x: x * gridSize + gridSize / 2,
        y: y * gridSize + gridSize / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.0,
        color
      });
    }
  };

  const addFloatingText = (x: number, y: number, text: string) => {
    floatingTextsRef.current.push({
      id: Math.random(),
      x: x * gridSize,
      y: y * gridSize,
      text,
      life: 1.0
    });
  };

  const spawnFood = useCallback((currentSnake: {x: number, y: number}[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 5, y: 5, type: 'NORMAL' as FoodType };
    const count = canvas.width / gridSize;
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * count),
        y: Math.floor(Math.random() * count)
      };
      if (!currentSnake.some(p => p.x === newFood.x && p.y === newFood.y)) break;
    }

    const rand = Math.random();
    let type: FoodType = 'NORMAL';
    if (rand > 0.95) type = 'GOLDEN';
    else if (rand > 0.88) type = 'CHILI';
    else if (rand > 0.82) type = 'DRINK';

    return { ...newFood, type };
  }, []);

  const startGame = () => {
    snakeRef.current = [...initialSnake];
    directionRef.current = { x: 0, y: -1 };
    inputQueueRef.current = [];
    foodRef.current = spawnFood(initialSnake);
    setScore(0);
    setSpeed(130);
    setIsCaliente(false);
    setIsGameOver(false);
    setIsPlaying(true);
    particlesRef.current = [];
    floatingTextsRef.current = [];
  };

  const toggleFullScreen = () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  const handleGameOver = useCallback(() => {
    setShake(25);
    playSound('death');
    setIsPlaying(false);
    setIsGameOver(true);
    setIsCaliente(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('kd_snake_highscore', score.toString());
    }
  }, [score, highScore]);

  // Handler de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      let nextDir = null;
      switch (e.key) {
        case 'ArrowUp': nextDir = { x: 0, y: -1 }; break;
        case 'ArrowDown': nextDir = { x: 0, y: 1 }; break;
        case 'ArrowLeft': nextDir = { x: -1, y: 0 }; break;
        case 'ArrowRight': nextDir = { x: 1, y: 0 }; break;
      }
      
      if (nextDir) {
        // Evita duplicatas na fila e giros 180 imediatos baseados no último item da fila ou direção atual
        const lastInQueue = inputQueueRef.current[inputQueueRef.current.length - 1] || directionRef.current;
        if (nextDir.x !== -lastInQueue.x || nextDir.y !== -lastInQueue.y) {
          if (inputQueueRef.current.length < 3) { // Limita buffer para evitar "lag" de comando
            inputQueueRef.current.push(nextDir);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const count = canvas.width / gridSize;

    const update = () => {
      // Processa o próximo comando da fila
      if (inputQueueRef.current.length > 0) {
        directionRef.current = inputQueueRef.current.shift()!;
      }

      const head = { 
        x: snakeRef.current[0].x + directionRef.current.x, 
        y: snakeRef.current[0].y + directionRef.current.y 
      };

      // Colisão com paredes ou corpo
      if (head.x < 0 || head.x >= count || head.y < 0 || head.y >= count || 
          snakeRef.current.some(p => p.x === head.x && p.y === head.y)) {
        handleGameOver();
        return;
      }

      const newSnake = [head, ...snakeRef.current];

      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        const foodType = foodRef.current.type;
        let points = 10;
        let color = '#ef4444';

        if (foodType === 'GOLDEN') {
          points = 100;
          color = '#fbbf24';
          playSound('powerup');
          setShake(15);
          addFloatingText(head.x, head.y, "LUXO! +100");
        } else if (foodType === 'CHILI') {
          points = 20;
          color = '#f97316';
          setIsCaliente(true);
          setSpeed(70);
          playSound('powerup');
          addFloatingText(head.x, head.y, "CALIENTE! 🌶️");
          setTimeout(() => {
            setIsCaliente(false);
            setSpeed(prev => Math.min(130, prev + 30));
          }, 6000);
        } else if (foodType === 'DRINK') {
          points = 5;
          color = '#3b82f6';
          setSpeed(prev => Math.min(180, prev + 25));
          addFloatingText(head.x, head.y, "RELAX... 🥤");
          playSound('eat');
        } else {
          playSound('eat');
          addFloatingText(head.x, head.y, "+10");
        }

        setScore(s => s + (isCaliente ? points * 2 : points));
        createParticles(head.x, head.y, color, 12);
        foodRef.current = spawnFood(newSnake);
      } else {
        newSnake.pop();
      }

      snakeRef.current = newSnake;
    };

    const draw = () => {
      ctx.save();
      
      // Screen Shake
      if (shake > 0) {
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        setShake(s => Math.max(0, s - 1.5));
      }

      // Background
      ctx.fillStyle = isCaliente ? '#1a0505' : '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Grid Decorativa
      ctx.strokeStyle = isCaliente ? '#3b0a0a' : '#0f172a';
      ctx.lineWidth = 1;
      for (let i = 0; i <= canvas.width; i += gridSize) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Comida
      const fx = foodRef.current.x * gridSize;
      const fy = foodRef.current.y * gridSize;
      const fType = foodRef.current.type;
      
      ctx.shadowBlur = 15;
      ctx.shadowColor = fType === 'GOLDEN' ? '#fbbf24' : fType === 'CHILI' ? '#f97316' : fType === 'DRINK' ? '#3b82f6' : '#ef4444';
      ctx.fillStyle = ctx.shadowColor;
      
      ctx.beginPath();
      ctx.arc(fx + gridSize/2, fy + gridSize/2, gridSize/2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Cobra
      snakeRef.current.forEach((part, i) => {
        const px = part.x * gridSize;
        const py = part.y * gridSize;
        
        ctx.fillStyle = isCaliente 
          ? (i % 2 === 0 ? '#ef4444' : '#b91c1c') 
          : (i === 0 ? '#4ade80' : '#166534');

        if (i === 0) {
           ctx.shadowBlur = 20;
           ctx.shadowColor = isCaliente ? '#ef4444' : '#4ade80';
        }
        
        // Desenho arredondado compatível
        const r = 6;
        const x = px + 1;
        const y = py + 1;
        const w = gridSize - 2;
        const h = gridSize - 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Partículas
      particlesRef.current.forEach((p, idx) => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravidade leve
        p.life -= 0.03;
        if (p.life <= 0) particlesRef.current.splice(idx, 1);
      });
      ctx.globalAlpha = 1.0;

      // Textos Flutuantes
      floatingTextsRef.current.forEach((t, idx) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${t.life})`;
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x + gridSize/2, t.y);
        t.y -= 1.2;
        t.life -= 0.02;
        if (t.life <= 0) floatingTextsRef.current.splice(idx, 1);
      });

      // Efeito Scanline Arcade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      for (let i = 0; i < canvas.height; i += 4) {
        ctx.fillRect(0, i, canvas.width, 1);
      }

      ctx.restore();
    };

    const loop = (timestamp: number) => {
      if (timestamp - lastTimeRef.current > speed) {
        update();
        draw();
        lastTimeRef.current = timestamp;
      }
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [isPlaying, speed, isCaliente, shake, spawnFood, handleGameOver]);

  const setDirection = (x: number, y: number) => {
    if (!isPlaying) return;
    const lastInQueue = inputQueueRef.current[inputQueueRef.current.length - 1] || directionRef.current;
    if (x !== -lastInQueue.x || y !== -lastInQueue.y) {
      if (inputQueueRef.current.length < 3) {
        inputQueueRef.current.push({ x, y });
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const diffX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const diffY = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.abs(diffX) < 30 && Math.abs(diffY) < 30) return;
    if (Math.abs(diffX) > Math.abs(diffY)) setDirection(diffX > 0 ? 1 : -1, 0);
    else setDirection(0, diffY > 0 ? 1 : -1);
    touchStartRef.current = null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>
      <div className={`relative w-full max-w-2xl bg-slate-900 border rounded-[48px] overflow-hidden transition-all duration-300 ${isCaliente ? 'border-red-600 shadow-[0_0_80px_rgba(220,38,38,0.4)]' : 'border-slate-800 shadow-2xl'}`}>
        
        <div className="flex items-center justify-between p-6 bg-slate-800/30 border-b border-slate-800">
          <div className="flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${isCaliente ? 'bg-red-600 animate-pulse' : 'bg-red-600'}`}>
              <Gamepad2 className="text-white w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-black text-2xl tracking-tighter text-white uppercase italic">Pizza Snake <span className="text-red-600">Arcade</span></h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[11px] font-black text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-2 py-0.5 rounded-lg border border-yellow-500/20">
                  <Trophy className="w-3.5 h-3.5" /> Best: {highScore}
                </div>
                {isCaliente && (
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20 animate-bounce">
                    <Flame className="w-3.5 h-3.5" /> MODO CALIENTE!
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleFullScreen} className="p-3 bg-slate-800/50 hover:bg-blue-600 hover:text-white rounded-2xl transition-all text-slate-400 md:hidden group" title="Tela Cheia">
              <Maximize className="w-6 h-6 group-active:scale-95 transition-transform" />
            </button>
            <button onClick={onClose} className="p-3 bg-slate-800/50 hover:bg-red-600 hover:text-white rounded-2xl transition-all text-slate-400">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8 flex flex-col items-center gap-4 md:gap-8 overflow-y-auto max-h-[80vh] md:max-h-none no-scrollbar">
          <div 
            className="relative w-full max-w-[400px] aspect-square mx-auto touch-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'none' }}
          >
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={400} 
              className={`w-full h-full bg-slate-950 rounded-2xl md:rounded-[32px] border-4 md:border-8 shadow-2xl transition-colors duration-500 block ${isCaliente ? 'border-red-900' : 'border-slate-800'}`}
              style={{ paddingBottom: '0.1px' }}
            />

            {!isPlaying && !isGameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md rounded-[24px] z-10 p-8 text-center space-y-6">
                <div className="grid grid-cols-2 gap-4 mb-2">
                   <div className="flex flex-col items-center gap-1 bg-slate-900 p-3 rounded-2xl border border-slate-800">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="text-[8px] font-black text-slate-400 uppercase">Velocidade e Pontos 2x</span>
                   </div>
                   <div className="flex flex-col items-center gap-1 bg-slate-900 p-3 rounded-2xl border border-slate-800">
                      <Beer className="w-5 h-5 text-blue-500" />
                      <span className="text-[8px] font-black text-slate-400 uppercase">Diminui Velocidade</span>
                   </div>
                </div>
                <button 
                  onClick={startGame}
                  className="group bg-red-600 hover:bg-red-500 text-white font-black px-12 py-5 rounded-3xl transition-all shadow-2xl shadow-red-900/40 flex items-center gap-4 uppercase tracking-[0.2em] text-sm active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" /> JOGAR AGORA
                </button>
              </div>
            )}

            {isGameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-600/90 backdrop-blur-lg rounded-[24px] z-20 p-8 text-center animate-in zoom-in">
                <h3 className="text-6xl font-black text-white mb-4 uppercase tracking-tighter italic drop-shadow-lg">CABO!</h3>
                <div className="bg-black/30 backdrop-blur-md px-10 py-6 rounded-3xl mb-8 border border-white/10">
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Pontuação Final</p>
                  <p className="text-6xl font-black text-white leading-none">{score}</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={startGame}
                    className="bg-white text-red-600 font-black px-8 py-5 rounded-2xl transition-all shadow-2xl flex items-center gap-2 uppercase tracking-widest text-xs hover:scale-105 active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" /> RECOMEÇAR
                  </button>
                  <button onClick={onClose} className="bg-black/20 text-white border border-white/20 font-black px-8 py-5 rounded-2xl transition-all flex items-center gap-2 uppercase tracking-widest text-xs hover:bg-black/40">
                    SAIR
                  </button>
                </div>
              </div>
            )}
          </div>

          {isPlaying && (
            <div className="flex items-center gap-10 bg-slate-800/40 px-10 py-5 rounded-[32px] border border-slate-700/50 shadow-xl backdrop-blur-sm">
               <div className="text-center group">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-red-500 transition-colors">Pontos</p>
                  <p className={`text-4xl font-black transition-colors ${isCaliente ? 'text-red-500 scale-110' : 'text-white'}`}>{score}</p>
               </div>
               <div className="w-px h-12 bg-slate-700/50" />
               <div className="text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {isCaliente ? (
                      <span className="text-sm font-black text-orange-500 animate-pulse">PEGANDO FOGO!</span>
                    ) : (
                      <span className="text-sm font-black text-emerald-500">ESTÁVEL</span>
                    )}
                  </div>
               </div>
            </div>
          )}

          <div className="md:hidden text-center mt-2 animate-pulse mt-8">
             <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest leading-tight">Deslize o dedo na tela da pizza para controlar!</span>
          </div>

          <p className="hidden md:block text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] opacity-50 animate-pulse">Use as setas para dominar a cozinha</p>
        </div>
      </div>
    </div>
  );
};

export default GameModal;
