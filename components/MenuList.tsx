
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Extra } from '../types';
import { EXTRAS } from '../constants';
import { Target, Sparkles, Pizza, X, Link, MessageCircle, CheckCircle2, Search, Heart, PlusCircle, ShoppingCart, EyeOff, Flame, Utensils, Star } from 'lucide-react';

interface ExtendedProduct extends Product {
  isPopular?: boolean;
  isChefChoice?: boolean;
  image?: string;
}

interface Props {
  products: ExtendedProduct[];
  selectedSize: string;
  onSelect: (p: Product, s: string) => void;
  halfMode?: boolean;
  halfSelection?: { left?: Product; right?: Product };
}

interface FlyParticle {
  id: number;
  x: number;
  y: number;
  image?: string;
}

const MenuList: React.FC<Props> = ({ products, selectedSize, onSelect, halfMode, halfSelection }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('kd_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [flyParticles, setFlyParticles] = useState<FlyParticle[]>([]);
  const [pressedId, setPressedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('kd_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const isPickingLeft = halfMode && !halfSelection?.left;
  const isPickingRight = halfMode && halfSelection?.left && !halfSelection?.right;

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFavorite = showFavoritesOnly ? favorites.includes(p.id) : true;
      return matchesSearch && matchesFavorite;
    });
  }, [products, searchTerm, showFavoritesOnly, favorites]);

  const highlights = useMemo(() => {
    return products.filter(p => p.isPopular || p.isChefChoice).slice(0, 4);
  }, [products]);

  const handleProductSelect = (e: React.MouseEvent, p: ExtendedProduct) => {
    if (p.isActive === false) return;
    
    const availableSizes = Object.keys(p.prices);
    const sizeToUse = p.prices[selectedSize] ? selectedSize : availableSizes[0];

    if (halfMode) {
      setPressedId(p.id);
      setTimeout(() => setPressedId(null), 300);
      onSelect(p, sizeToUse);
    } else {
      triggerFlyAnimation(e.clientX, e.clientY, p.image);
      onSelect(p, sizeToUse);
    }
  };

  const triggerFlyAnimation = (x: number, y: number, image?: string) => {
    const newParticle = { id: Date.now(), x, y, image };
    setFlyParticles(prev => [...prev, newParticle]);
    setTimeout(() => {
      setFlyParticles(prev => prev.filter(pt => pt.id !== newParticle.id));
    }, 950);
  };

  return (
    <div className="space-y-12 relative">
      {/* Barra de Pesquisa */}
      <div className="flex gap-4 animate-in slide-in-from-top-4 duration-700">
        <div className="relative flex-1">
          <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-500">
            <Search className="w-5 h-5 group-focus-within:text-red-500 transition-colors" />
          </div>
          <input 
            type="text"
            placeholder="O que você vai saborear hoje?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass rounded-[36px] py-7 pl-16 pr-8 text-white focus:outline-none focus:border-red-500/50 transition-all font-medium shadow-2xl placeholder:text-slate-600"
          />
        </div>
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`px-8 rounded-[36px] border transition-all duration-500 ${
            showFavoritesOnly ? 'bg-red-600 border-red-500 text-white' : 'glass border-white/5 text-slate-500 hover:text-red-500'
          }`}
        >
          <Heart className={`w-6 h-6 ${showFavoritesOnly ? 'fill-current' : ''}`} />
        </button>
      </div>

      {!searchTerm && !showFavoritesOnly && highlights.length > 0 && (
        <div className="space-y-6">
           <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] ml-4 flex items-center gap-3">
              <Star className="w-4 h-4 text-yellow-500 fill-current" /> Sugestões do Chef
           </h4>
           <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x px-2">
              {highlights.map(p => (
                <div key={`h-${p.id}`} onClick={(e) => handleProductSelect(e, p)} className="min-w-[300px] snap-center relative aspect-[16/10] rounded-[40px] overflow-hidden group cursor-pointer shadow-2xl transition-transform active:scale-95">
                   <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                   <div className="absolute bottom-6 left-8 right-8">
                      <h5 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1">{p.name}</h5>
                      <p className="text-xs font-black text-red-500">
                        {p.prices[selectedSize] || Object.values(p.prices)[0]}$
                      </p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {halfMode && (isPickingLeft || isPickingRight) && (
        <div className="bg-red-600 p-8 rounded-[40px] flex items-center justify-between animate-in zoom-in shadow-2xl">
          <div className="flex items-center gap-5">
            <Target className="w-8 h-8 text-white animate-pulse" />
            <div>
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Passo da Customização</p>
              <h4 className="text-xl font-black text-white uppercase">Selecione o {isPickingLeft ? 'Lado Esquerdo' : 'Lado Direito'}</h4>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
        {filteredProducts.map((p) => {
          const hasSelectedSize = !!p.prices[selectedSize];
          const price = hasSelectedSize ? p.prices[selectedSize] : Object.values(p.prices)[0];
          const priceLabel = hasSelectedSize ? selectedSize : Object.keys(p.prices)[0];
          
          const isAvailable = p.isActive !== false;
          const isFav = favorites.includes(p.id);
          const isSelected = (halfMode && (halfSelection?.left?.id === p.id || halfSelection?.right?.id === p.id));

          const availableSizesList = ['PEQ', 'MEDIO', 'FAMILIAR', 'UN'].filter(s => !!p.prices[s]);

          return (
            <div key={p.id} onClick={(e) => isAvailable && handleProductSelect(e, p)} className={`group relative flex flex-col rounded-[52px] border transition-all duration-700 overflow-hidden ${!isAvailable ? 'opacity-40 grayscale pointer-events-none' : 'hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] shadow-2xl'} ${isSelected ? 'border-red-600 bg-red-600/10' : 'border-white/5 glass'}`}>
              <div className="relative aspect-[16/9] overflow-hidden">
                 <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                 <button onClick={(e) => toggleFavorite(e, p.id)} className="absolute top-6 right-6 p-4 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 text-white hover:text-red-500 transition-all z-10">
                    <Heart className={`w-5 h-5 ${isFav ? 'fill-current text-red-500' : ''}`} />
                 </button>
                 <div className="absolute bottom-6 left-8 flex gap-3">
                    {p.isPopular && <div className="bg-red-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase text-white shadow-lg"><Flame className="w-3.5 h-3.5 inline mr-1" /> Hot</div>}
                    {p.isChefChoice && <div className="bg-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase text-white shadow-lg"><Star className="w-3.5 h-3.5 inline mr-1" /> Elite</div>}
                 </div>
              </div>

              <div className="p-10 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none group-hover:text-red-600 transition-colors">{p.name}</h3>
                  <div className="text-right">
                     <p className="text-3xl font-black text-white tracking-tighter">{price}<span className="text-red-600">$</span></p>
                     {!hasSelectedSize && (
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Ref: {priceLabel}</p>
                     )}
                  </div>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-10 flex-1">{p.description}</p>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                   <div className="flex gap-2">
                      {availableSizesList.map(s => (
                        <div 
                          key={s} 
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black border transition-all ${
                            selectedSize === s || (!hasSelectedSize && priceLabel === s)
                            ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20' 
                            : 'bg-slate-800 border-slate-700 text-slate-500'
                          }`}
                        >
                          {s[0]}
                        </div>
                      ))}
                   </div>
                   {!halfMode && <PlusCircle className="w-9 h-9 text-slate-700 group-hover:text-red-600 transition-colors" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {flyParticles.map(pt => (
        <div key={pt.id} className="fixed pointer-events-none z-[1000] animate-fly-to-cart" style={{ left: pt.x, top: pt.y }}>
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-900">
            <img 
              src={pt.image || "https://cdn-icons-png.flaticon.com/512/3132/3132693.png"} 
              className="w-full h-full object-cover" 
              alt="Animação de pedido"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(MenuList);
