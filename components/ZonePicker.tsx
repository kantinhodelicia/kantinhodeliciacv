
import React, { useState } from 'react';
import { DeliveryZone } from '../types';
import { Search, MapPin, Clock, Zap, Filter } from 'lucide-react';

interface Props {
  zones: DeliveryZone[];
  selected: DeliveryZone | null;
  onSelect: (z: DeliveryZone) => void;
}

const ZonePicker: React.FC<Props> = ({ zones, selected, onSelect }) => {
  const [query, setQuery] = useState('');
  const [onlyFast, setOnlyFast] = useState(false);

  const filtered = zones.filter(z => {
    const matchesQuery = z.name.toLowerCase().includes(query.toLowerCase());
    if (!onlyFast) return matchesQuery;

    const timeParts = z.time.split('-');
    if (timeParts.length < 2) return matchesQuery;
    
    const maxTimeStr = timeParts[1].trim().split(' ')[0];
    const maxTime = parseInt(maxTimeStr);
    const isFast = !isNaN(maxTime) && maxTime <= 30;

    return matchesQuery && isFast;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text"
            placeholder="Pesquisar zona de entrega..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-slate-200 focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setOnlyFast(!onlyFast)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
              onlyFast 
                ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/20' 
                : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${onlyFast ? 'fill-current' : ''}`} />
            Entrega Rápida (&lt; 30 min)
          </button>
          
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest ml-auto">
            <Filter className="w-3 h-3" />
            {filtered.length} Resultados
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-900 rounded-[32px]">
            <MapPin className="w-12 h-12 opacity-10 mb-4" />
            <p className="font-bold">Nenhuma zona encontrada</p>
            <p className="text-xs uppercase tracking-widest mt-1">Tente ajustar seus filtros</p>
          </div>
        ) : (
          filtered.map((z) => {
            const isSelected = selected?.id === z.id;
            const timeParts = z.time.split('-');
            const maxTimeStr = timeParts[1]?.trim().split(' ')[0];
            const maxTime = parseInt(maxTimeStr);
            const isVeryFast = !isNaN(maxTime) && maxTime <= 25;

            return (
              <div 
                key={z.id}
                onClick={() => onSelect(z)}
                className={`group relative p-6 rounded-[32px] border cursor-pointer transition-all duration-300 active:scale-95 ${
                  isSelected 
                    ? 'bg-red-600 border-red-500 text-white shadow-2xl shadow-red-900/40 translate-y-[-2px]' 
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {isVeryFast && !isSelected && (
                  <div className="absolute top-4 right-4 animate-pulse">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`font-black text-xl tracking-tight mb-1 transition-colors ${isSelected ? 'text-white' : 'text-slate-100 group-hover:text-red-500'}`}>
                      {z.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white/60' : 'text-slate-600'}`} />
                      <span className={`text-xs font-bold ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                        {z.time}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className={`text-lg font-black ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {z.price}$
                  </span>
                  <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'
                  }`}>
                    Taxa Fixa
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ZonePicker;
