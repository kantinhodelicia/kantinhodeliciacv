
import React from 'react';
import { User } from '../types';
import { User as UserIcon, LogOut, Award, ShieldAlert, Tv, ShoppingBag } from 'lucide-react';

interface Props {
  user: User | null;
  cartCount: number;
  onLogin: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onOpenLive: () => void;
  onOpenCart: () => void;
  backgroundUrl?: string;
  hasLive?: boolean;
}

const Header: React.FC<Props> = ({ user, cartCount, onLogin, onLogout, onOpenProfile, onOpenAdmin, onOpenLive, onOpenCart, backgroundUrl, hasLive }) => {
  return (
    <header className="relative py-16 px-4 overflow-hidden min-h-[400px] flex items-center justify-center">
      {/* ... existing dynamic background and overlays ... */}
      <div 
        className="absolute inset-0 z-[-2] transition-all duration-1000 ease-in-out scale-105"
        style={{
          backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-[-1]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950 z-[-1]"></div>
      
      {!backgroundUrl && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/10 blur-[100px] -z-10 rounded-full animate-pulse"></div>
      )}
      
      <div className="max-w-4xl mx-auto flex flex-col items-center relative">
        {hasLive && (
          <button 
            onClick={onOpenLive}
            className="mb-8 flex items-center gap-3 bg-red-600/20 border border-red-500/30 px-5 py-2.5 rounded-2xl shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:scale-105 transition-all"
          >
            <div className="relative">
              <Tv className="w-5 h-5 text-red-500" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            </div>
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Kantinho Live On</span>
          </button>
        )}

        <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <h1 className="text-6xl md:text-8xl font-bold font-crimson tracking-tight text-white mb-2 text-center drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
            KANTINHO <span className="text-red-600">DELÍCIA</span>
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-8 bg-red-600/50"></div>
            <p className="text-slate-200 font-black tracking-[0.3em] text-[10px] uppercase drop-shadow-md">Artesanal & Premium</p>
            <div className="h-px w-8 bg-red-600/50"></div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 glass border-white/10 px-6 py-2.5 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {user ? (
            <>
              <button 
                onClick={onOpenProfile}
                className="flex items-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-2 border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform relative overflow-hidden">
                  <UserIcon className="w-5 h-5 text-white" />
                  {user.points > 0 && (
                    <div className="absolute -bottom-1 right-0 bg-yellow-500 p-0.5 rounded-full ring-2 ring-slate-900">
                      <Award className="w-2 h-2 text-slate-900" />
                    </div>
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-black text-slate-100 block leading-tight">{user.name.split(' ')[0]}</span>
                  <span className="text-[9px] font-black text-yellow-500 uppercase tracking-tighter">{user.points} Pontos</span>
                </div>
              </button>
              
              <div className="w-px h-6 bg-white/10"></div>
            </>
          ) : (
            <>
              <button 
                onClick={onLogin}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-full transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Entrar</span>
              </button>
              <div className="w-px h-6 bg-white/10"></div>
            </>
          )}

          <button 
            onClick={onOpenCart}
            className="relative p-2 text-slate-400 hover:text-white transition-all group"
          >
            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-slate-900 animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </button>

          <div className="w-px h-6 bg-white/10"></div>

          {user?.isAdmin && (
            <>
              <button 
                onClick={onOpenAdmin}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-all flex items-center justify-center"
                title="Painel Admin"
              >
                <ShieldAlert className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-white/10"></div>
            </>
          )}
          
          {user && (
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
