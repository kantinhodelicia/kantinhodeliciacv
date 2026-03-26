import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, Gift, Medal, Crown, Sparkles, CheckCircle2, ChevronRight, Award } from 'lucide-react';

interface Props {
  earnedPoints: number;
  totalPoints: number;
  isLevelUp: boolean;
  newLevel: string;
  onClose: () => void;
}

const OrderSuccessModal: React.FC<Props> = ({ earnedPoints, totalPoints, isLevelUp, newLevel, onClose }) => {
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    // Tocar Som de Moedas (Opcional - via Web Audio API se possível, vamos pular pra não incomodar)
    
    // Confetes básicos de sucesso
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ef4444', '#facc15', '#10b981']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ef4444', '#facc15', '#10b981']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    if (isLevelUp) {
      setTimeout(() => {
        setShowLevelUp(true);
        // Explosão Gigante
        confetti({
          particleCount: 200,
          spread: 160,
          origin: { y: 0.6 },
          colors: ['#facc15', '#a855f7', '#3b82f6', '#ec4899']
        });
      }, 1500);
    }
  }, [isLevelUp]);

  const getLevelIcon = () => {
    switch (newLevel) {
      case 'DIAMANTE': return <Crown className="w-16 h-16 text-indigo-400" />;
      case 'OURO': return <Star className="w-16 h-16 text-yellow-500" />;
      case 'PRATA': return <Medal className="w-16 h-16 text-slate-400" />;
      default: return <Award className="w-16 h-16 text-orange-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500"></div>
      
      {!showLevelUp ? (
        // TELA 1: SUCESSO BÁSICO E PONTOS
        <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/50 rounded-[48px] p-10 text-center shadow-[0_0_80px_rgba(220,38,38,0.2)] animate-in zoom-in-95 duration-500 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-orange-500"></div>
          
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full mx-auto flex items-center justify-center mb-8 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>

          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-2">
            Pedido <span className="text-emerald-500">Enviado!</span>
          </h2>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-8 leading-relaxed">
            Seu pedido já está na cozinha do Kantinho Delícia.
          </p>

          {earnedPoints > 0 && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-[32px] p-6 mb-8 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-yellow-500 rounded-[34px] blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative">
                <Gift className="w-8 h-8 text-yellow-500 mx-auto mb-3 animate-bounce" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Você Recebeu</p>
                <p className="text-4xl font-black text-white flex items-center justify-center gap-2">
                  <span className="text-yellow-500">+</span>{earnedPoints}
                  <span className="text-sm text-yellow-500">PTS</span>
                </p>
                <p className="text-[9px] text-slate-400 font-bold mt-3">Saldo Atual: {totalPoints} PTS</p>
              </div>
            </div>
          )}

          <button 
            onClick={onClose}
            className="w-full py-5 bg-slate-800 hover:bg-slate-700 rounded-[24px] text-white font-black text-[11px] uppercase tracking-widest transition-all active:scale-95"
          >
            Acompanhar no Perfil
          </button>
        </div>
      ) : (
        // TELA 2: LEVEL UP!
        <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 rounded-[56px] p-12 text-center shadow-[0_0_100px_rgba(234,179,8,0.3)] animate-in zoom-in duration-700 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
          
          <Sparkles className="absolute top-10 right-10 w-8 h-8 text-yellow-500 animate-pulse" />
          <Sparkles className="absolute bottom-32 left-10 w-6 h-6 text-indigo-400 animate-pulse delay-300" />

          <div className="relative z-10">
            <p className="text-xs font-black text-yellow-500 uppercase tracking-[0.4em] mb-4">Promoção Alcançada</p>
            
            <div className="w-32 h-32 mx-auto bg-slate-950 rounded-[40px] border-4 border-slate-800 shadow-2xl flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 bg-yellow-500/20 blur-xl animate-pulse"></div>
              {getLevelIcon()}
            </div>

            <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic mb-4">
              Level <span className="text-yellow-500">Up!</span>
            </h2>
            
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl mb-10">
              <p className="text-slate-300 text-sm font-medium leading-relaxed">
                Parabéns! Você alcançou a patente <span className="font-black text-white uppercase">{newLevel}</span>. Confira seus novos benefícios vitalícios no seu perfil!
              </p>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-6 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-[24px] text-white font-black text-[12px] uppercase tracking-widest shadow-xl shadow-orange-900/50 transition-all active:scale-95 flex flex-col items-center justify-center gap-1"
            >
              <span>Resgatar Recompensas</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSuccessModal;
