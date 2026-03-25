
import React, { useState } from 'react';
import { User } from '../types';
import { Pizza, Phone, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  onComplete: (user: User) => void;
}

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone) {
      const user: User = { 
        name, 
        phone, 
        points: 10,
        ordersCount: 0,
        level: 'BRONZE',
        isAdmin: isAdmin || name.toLowerCase().includes('admin') // Permissão automática se o nome contiver admin para facilitar
      };
      localStorage.setItem('kd_user', JSON.stringify(user));
      onComplete(user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[40px] p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-900/40 rotate-12 mb-6">
            <Pizza className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold font-crimson text-white mb-2">Seja Bem-vindo!</h1>
          <p className="text-slate-400">Identifique-se para começar a pedir as melhores pizzas.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Seu Nome</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <input 
                required
                type="text"
                placeholder="Ex: João Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-red-500 transition-all font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Seu WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <input 
                required
                type="tel"
                placeholder="Ex: 599 92 04"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-red-500 transition-all font-bold"
              />
            </div>
          </div>

          <div 
            onClick={() => setIsAdmin(!isAdmin)}
            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${isAdmin ? 'bg-red-600/10 border-red-500/50 text-red-500' : 'bg-slate-950/50 border-slate-800 text-slate-600'}`}
          >
            <ShieldCheck className={`w-5 h-5 ${isAdmin ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">Acesso Administrativo</span>
          </div>

          <button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-3xl mt-6 flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-900/30 group active:scale-95"
          >
            COMEÇAR AGORA
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-8">
          📍 Praia, Cabo Verde
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
