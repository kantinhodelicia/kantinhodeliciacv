
import React, { useState } from 'react';
import { 
  X, Award, History, Gift, ShieldCheck, ChevronRight, 
  Star, Zap, Crown, Target, Medal, Heart, Coffee, UtensilsCrossed,
  ShieldAlert
} from 'lucide-react';

interface Props {
  user: any;
  onClose: () => void;
  onOpenAdmin: () => void;
}

type TabType = 'RESUMO' | 'BENEFICIOS' | 'CONQUISTAS';

const ProfileModal: React.FC<Props> = ({ user, onClose, onOpenAdmin }) => {
  const [activeTab, setActiveTab] = useState<TabType>('RESUMO');
  
  const pointsToNextLevel = 100 - (user.points % 100);
  const progress = (user.points % 100);

  const getLevelStyles = () => {
    switch (user.level) {
      case 'DIAMANTE': return {
        bg: 'from-indigo-600 via-purple-600 to-pink-600',
        text: 'text-indigo-400',
        shadow: 'shadow-indigo-500/20',
        border: 'border-indigo-500/30',
        icon: <Crown className="w-5 h-5 text-indigo-300" />
      };
      case 'OURO': return {
        bg: 'from-yellow-400 via-orange-500 to-yellow-600',
        text: 'text-yellow-500',
        shadow: 'shadow-yellow-500/20',
        border: 'border-yellow-500/30',
        icon: <Star className="w-5 h-5 text-yellow-300" />
      };
      case 'PRATA': return {
        bg: 'from-slate-300 via-slate-400 to-slate-500',
        text: 'text-slate-400',
        shadow: 'shadow-slate-500/20',
        border: 'border-slate-500/30',
        icon: <Medal className="w-5 h-5 text-slate-300" />
      };
      default: return {
        bg: 'from-orange-500 via-red-600 to-red-700',
        text: 'text-red-500',
        shadow: 'shadow-red-500/20',
        border: 'border-red-500/30',
        icon: <Award className="w-5 h-5 text-red-300" />
      };
    }
  };

  const styles = getLevelStyles();

  const benefitsByLevel = {
    BRONZE: ['10% de cashback em pontos', 'Acesso ao Arcade', 'Ofertas semanais'],
    PRATA: ['15% de cashback em pontos', 'Entrega prioritária', 'Brinde no mês de aniversário'],
    OURO: ['20% de cashback em pontos', 'Taxa de entrega grátis (até 5km)', 'Acesso a sabores exclusivos'],
    DIAMANTE: ['25% de cashback em pontos', 'Atendimento VIP via WhatsApp', 'Pizza grátis a cada 10 pedidos', 'Convite para eventos de degustação']
  };

  const achievements = [
    { icon: <Heart className="w-4 h-4" />, name: 'Fã de Carteirinha', desc: 'Fez mais de 5 pedidos', active: user.ordersCount >= 5 },
    { icon: <Zap className="w-4 h-4" />, name: 'Veloz e Faminto', desc: 'Pediu em menos de 2 min', active: true },
    { icon: <Coffee className="w-4 h-4" />, name: 'Madrugador', desc: 'Pedido após as 22h', active: user.ordersCount >= 2 },
    { icon: <UtensilsCrossed className="w-4 h-4" />, name: 'Crítico Gourmet', desc: 'Personalizou 3 pizzas', active: false },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-[48px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        
        {/* Banner Superior Dinâmico */}
        <div className={`h-40 bg-gradient-to-br ${styles.bg} relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),transparent_70%)] animate-pulse" />
          </div>
          
          <button onClick={onClose} className="absolute top-6 right-6 p-2.5 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-md transition-all z-20">
            <X className="w-5 h-5" />
          </button>

          <div className="absolute -bottom-12 left-8 z-10">
            <div className="w-24 h-24 rounded-[32px] bg-slate-950 border-4 border-slate-950 shadow-2xl flex items-center justify-center relative group">
              <span className="text-4xl group-hover:scale-110 transition-transform duration-500">🍕</span>
              <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 ${styles.shadow}`}>
                {styles.icon}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-16 p-8">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl font-black text-white tracking-tighter">{user.name}</h2>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${styles.border} ${styles.text} bg-white/5`}>
                  MEMBRO {user.level}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-bold tracking-tight">{user.phone}</p>
            </div>
            {/* Botão Admin (Simplesmente disponível para fins de demonstração) */}
            <button 
              onClick={onOpenAdmin}
              className="p-3 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all border border-red-500/20 group"
              title="Acesso Administrador"
            >
              <ShieldAlert className="w-5 h-5 group-hover:animate-bounce" />
            </button>
          </div>

          {/* Navegação por Abas */}
          <div className="flex bg-slate-900/50 p-1.5 rounded-[24px] border border-slate-800 mb-8">
            {(['RESUMO', 'BENEFICIOS', 'CONQUISTAS'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab === 'RESUMO' ? 'Resumo' : tab === 'BENEFICIOS' ? 'Níveis' : 'Badges'}
              </button>
            ))}
          </div>

          <div className="min-h-[300px] animate-in fade-in duration-500">
            {activeTab === 'RESUMO' && (
              <div className="space-y-6">
                {/* Card de Pontos */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Saldo Sabor Coins</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white">{user.points}</span>
                        <span className="text-xs font-black text-slate-500">PTS</span>
                      </div>
                    </div>
                    <Gift className={`w-8 h-8 ${styles.text} opacity-50`} />
                  </div>

                  <div className="space-y-3">
                    <div className="h-3 w-full bg-slate-800/50 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                      <div 
                        className={`h-full bg-gradient-to-r ${styles.bg} rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(239,68,68,0.3)]`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/20 border border-slate-800/50 p-5 rounded-3xl group transition-colors">
                    <History className="w-5 h-5 text-blue-500 mb-3" />
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Pedidos</p>
                    <p className="text-2xl font-black text-white">{user.ordersCount}</p>
                  </div>
                  <div className="bg-slate-900/20 border border-slate-800/50 p-5 rounded-3xl group transition-colors">
                    <Zap className="w-5 h-5 text-purple-500 mb-3" />
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nível Atual</p>
                    <p className="text-2xl font-black text-white capitalize">{user.level.toLowerCase()}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'BENEFICIOS' && (
              <div className="space-y-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Vantagens do Nível {user.level}</p>
                <div className="space-y-3">
                  {benefitsByLevel[user.level as keyof typeof benefitsByLevel].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-900/30 border border-slate-800/50 rounded-2xl group hover:bg-slate-800/40 transition-all">
                      <div className={`p-2 rounded-xl bg-white/5 border ${styles.border}`}>
                        <ShieldCheck className={`w-4 h-4 ${styles.text}`} />
                      </div>
                      <span className="text-xs font-bold text-slate-200">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'CONQUISTAS' && (
              <div className="grid grid-cols-2 gap-4">
                {achievements.map((ach, i) => (
                  <div key={i} className={`p-5 rounded-[32px] border transition-all duration-500 ${
                    ach.active 
                      ? 'bg-slate-900/60 border-slate-700 shadow-xl' 
                      : 'bg-slate-950 border-slate-900 opacity-40 grayscale'
                  }`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${
                      ach.active ? 'bg-red-600/20 text-red-500' : 'bg-slate-800 text-slate-600'
                    }`}>
                      {ach.icon}
                    </div>
                    <p className="text-xs font-black text-white mb-1 uppercase tracking-tighter">{ach.name}</p>
                    <p className="text-[9px] font-bold text-slate-500 leading-tight">{ach.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
