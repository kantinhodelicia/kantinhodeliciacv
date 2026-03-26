
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, SaleRecord, DeliveryZone, OrderStatus } from '../types';
import { 
  X, TrendingUp, Package, Search, Activity, 
  Receipt, Pizza, Tv, LogOut, ShieldAlert, Volume2, 
  Bell, BellDot, DollarSign, CheckCircle2, VolumeX,
  BarChart3, LineChart, PieChart as PieIcon, Layers, Info,
  Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon,
  Save, AlertCircle, Sparkles, Clock, Globe, Settings2,
  MonitorPlay, Camera, Palette, Radio, Sliders, Layout,
  Smartphone, ShieldX, HardDrive, History, Video,
  Gamepad2, Wrench, CreditCard
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export interface IPTVChannel {
  name: string;
  logo: string;
  group: string;
  url: string;
}

interface Props {
  products: Product[];
  categories: string[];
  zones: DeliveryZone[];
  sales: SaleRecord[];
  headerBg?: string;
  streamUrl?: string;
  scheduledStartTime?: string;
  boxPrice?: number;
  minOrder?: number;
  onUpdateProducts: (p: Product[]) => void;
  onUpdateCategories: (c: string[]) => void;
  onUpdateZones: (z: DeliveryZone[]) => void;
  onUpdateSales: (s: SaleRecord[]) => void;
  onUpdateHeaderBg: (url: string) => void;
  onUpdateStreamUrl: (url: string) => void;
  onUpdateScheduledStartTime: (time: string) => void;
  onUpdateBoxPrice: (price: number) => void;
  onUpdateMinOrder: (min: number) => void;
  onClose: () => void;
}

type AdminView = 'DASHBOARD' | 'PEDIDOS' | 'CARDÁPIO' | 'STUDIO' | 'OPERACOES';

const AdminPanel: React.FC<Props> = ({ 
  products, categories, zones, sales, headerBg, streamUrl, scheduledStartTime, boxPrice = 100, minOrder = 500,
  onUpdateProducts, onUpdateCategories, onUpdateZones, onUpdateSales, 
  onUpdateHeaderBg, onUpdateStreamUrl, onUpdateScheduledStartTime, onUpdateBoxPrice, onUpdateMinOrder, onClose 
}) => {
  const [activeView, setActiveView] = useState<AdminView>('DASHBOARD');
  const [adminToast, setAdminToast] = useState<{ message: string, type: 'success' | 'error' | 'info' | 'alert' } | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  
  // States Temporários
  const [tempHeaderBg, setTempHeaderBg] = useState(headerBg || '');
  const [tempStreamUrl, setTempStreamUrl] = useState(streamUrl || '');
  const [tempStartTime, setTempStartTime] = useState(scheduledStartTime || '');
  const [tempBoxPrice, setTempBoxPrice] = useState(boxPrice);
  const [tempMinOrder, setTempMinOrder] = useState(minOrder);

  // States para Menu
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [formCategory, setFormCategory] = useState<string>('PIZZAS');
  const [orderFilter, setOrderFilter] = useState<'ATIVOS' | 'HISTORICO'>('ATIVOS');

  const [iptvChannels, setIptvChannels] = useState<IPTVChannel[]>(() => {
    const saved = localStorage.getItem('kd_iptv_playlist');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('kd_iptv_playlist', JSON.stringify(iptvChannels));
  }, [iptvChannels]);

  const showAdminToast = (message: string, type: 'success' | 'error' | 'info' | 'alert' = 'info') => {
    setAdminToast({ message, type });
    setTimeout(() => setAdminToast(null), 4000);
  };

  const handleSaveStudio = async () => {
    onUpdateHeaderBg(tempHeaderBg);
    onUpdateStreamUrl(tempStreamUrl);
    onUpdateScheduledStartTime(tempStartTime);
    try {
      await supabase.from('store_settings').update({
        header_bg: tempHeaderBg,
        stream_url: tempStreamUrl,
        scheduled_start: tempStartTime
      }).eq('id', 1);
      showAdminToast("Direção do Studio atualizada!", "success");
    } catch (e) {
      showAdminToast("Erro ao salvar no servidor", "error");
    }
  };

  const handleSaveOperations = async () => {
    onUpdateBoxPrice(tempBoxPrice);
    onUpdateMinOrder(tempMinOrder);
    try {
      await supabase.from('store_settings').update({
        box_price: tempBoxPrice,
        min_order: tempMinOrder
      }).eq('id', 1);
      showAdminToast("Parâmetros de venda salvos!", "success");
    } catch (e) {
      showAdminToast("Erro ao salvar no servidor", "error");
    }
  };

  const stats = useMemo(() => {
    const total = sales.reduce((acc, s) => acc + s.total, 0);
    const pending = sales.filter(s => ['RECEBIDO', 'PREPARO'].includes(s.status)).length;
    return { total, pending };
  }, [sales]);

  return (
    <div className="fixed inset-0 z-[500] flex flex-col md:flex-row bg-gray-950 text-white overflow-hidden font-sans">
      
      {/* Mobile Top Header */}
      <div className="md:hidden w-full bg-gray-900 border-b border-gray-800 flex items-center justify-between p-5 z-20">
         <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-950/50">
             <ShieldAlert className="w-4 h-4 text-white" />
           </div>
           <h2 className="text-sm font-black italic tracking-tighter">KANTINHO <span className="text-red-600 text-[9px] not-italic font-bold">PRO</span></h2>
         </div>
         <button onClick={onClose} className="p-2.5 bg-slate-800 hover:bg-red-600 rounded-xl transition-all">
           <LogOut className="w-4 h-4 text-slate-300" />
         </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden w-72 bg-gray-900 border-r border-gray-800 md:flex flex-col z-20">
        <div className="p-10 border-b border-gray-800 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-950/50">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black italic tracking-tighter">KANTINHO <span className="text-red-600 text-xs not-italic font-bold">PRO</span></h2>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          {[
            { id: 'DASHBOARD', label: 'Dashboard', icon: <TrendingUp className="w-5" /> },
            { id: 'PEDIDOS', label: 'Pedidos', icon: <Receipt className="w-5" />, badge: stats.pending },
            { id: 'CARDÁPIO', label: 'Cardápio', icon: <Pizza className="w-5" /> },
            { id: 'STUDIO', label: 'Studio (Live)', icon: <Video className="w-5" /> },
            { id: 'OPERACOES', label: 'Operações', icon: <Settings2 className="w-5" /> },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveView(item.id as AdminView)}
              className={`w-full px-6 py-5 rounded-[24px] flex items-center justify-between font-bold text-xs uppercase tracking-widest transition-all ${
                activeView === item.id ? 'bg-red-600 text-white shadow-xl' : 'text-gray-500 hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-4">{item.icon} {item.label}</div>
              {item.badge ? <span className="px-2 py-0.5 rounded-lg text-[9px] bg-white text-red-600">{item.badge}</span> : null}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-gray-800">
          <button onClick={onClose} className="w-full py-5 bg-slate-800/50 hover:bg-red-600 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase transition-all">
            <LogOut className="w-4 h-4" /> Finalizar Sessão
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 flex items-center justify-around py-4 px-2 z-[600] pb-safe">
        {[
          { id: 'DASHBOARD', icon: <TrendingUp className="w-6 h-6" /> },
          { id: 'PEDIDOS', icon: <Receipt className="w-6 h-6" />, badge: stats.pending },
          { id: 'CARDÁPIO', icon: <Pizza className="w-6 h-6" /> },
          { id: 'STUDIO', icon: <Video className="w-6 h-6" /> },
          { id: 'OPERACOES', icon: <Settings2 className="w-6 h-6" /> },
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveView(item.id as AdminView)}
            className={`relative p-3 rounded-2xl transition-all ${
              activeView === item.id ? 'bg-red-600 text-white shadow-lg shadow-red-900/50 -translate-y-2' : 'text-slate-500'
            }`}
          >
            {item.icon}
            {item.badge ? <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-gray-900 flex items-center justify-center text-[8px] font-black text-white">{item.badge}</span> : null}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto bg-gray-950 p-6 pb-32 md:p-12 scrollbar-hide">
        
        {/* VIEW: STUDIO (FOCADA EM LIVE E BRANDING) */}
        {activeView === 'STUDIO' && (
          <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">Film <span className="text-red-600">Studio</span></h2>
                <p className="text-slate-500 text-xs md:text-sm mt-2 font-medium">Controle de cena e transmissão ao vivo para os clientes.</p>
              </div>
              <button 
                onClick={handleSaveStudio}
                className="w-full md:w-auto bg-red-600 hover:bg-red-500 text-white px-8 md:px-10 py-4 md:py-5 rounded-[20px] md:rounded-[24px] font-black text-[11px] uppercase tracking-widest flex justify-center items-center gap-3 shadow-2xl transition-all"
              >
                <MonitorPlay className="w-4 h-4" /> Atualizar Live
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-10">
               {/* Scene Branding */}
               <div className="xl:col-span-2 bg-slate-900/40 border border-slate-800 rounded-[32px] md:rounded-[48px] p-6 md:p-10 space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <Palette className="w-6 h-6 text-red-500" />
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white italic">Cenário <span className="text-red-600">Site</span></h3>
                  </div>

                  <div className="space-y-6">
                     <div 
                        className="aspect-[21/9] rounded-[40px] overflow-hidden border-4 border-slate-800 relative shadow-2xl group"
                        style={{ backgroundImage: `url(${tempHeaderBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      >
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-8 text-center backdrop-blur-[1px]">
                           <h4 className="text-4xl font-bold font-crimson text-white mb-2 italic drop-shadow-lg">Kantinho Delícia</h4>
                           <div className="px-4 py-1.5 bg-red-600 text-[10px] font-black uppercase tracking-widest rounded-full">Preview Ativo</div>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">URL da Imagem de Fundo</label>
                        <div className="flex gap-4">
                           <input 
                              type="text" 
                              value={tempHeaderBg}
                              onChange={(e) => setTempHeaderBg(e.target.value)}
                              className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 md:p-5 text-xs text-slate-400 outline-none focus:border-red-600"
                              placeholder="URL da imagem principal..."
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {[
                          { n: 'Tradicional', u: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1200' },
                          { n: 'Ingredientes', u: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&q=80&w=1200' },
                          { n: 'Nata', u: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&q=80&w=1200' },
                          { n: 'Premium', u: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=1200' }
                        ].map(s => (
                          <button 
                            key={s.n} 
                            onClick={() => setTempHeaderBg(s.u)}
                            className={`p-4 rounded-2xl border transition-all ${tempHeaderBg === s.u ? 'bg-red-600/10 border-red-500' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
                          >
                             <p className={`text-[9px] font-black uppercase ${tempHeaderBg === s.u ? 'text-red-500' : 'text-slate-600'}`}>{s.n}</p>
                          </button>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Live Broadcast Monitor */}
               <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] md:rounded-[48px] p-6 md:p-10 space-y-6 md:space-y-8 flex flex-col">
                  <div className="flex items-center gap-4 mb-2">
                    <Radio className="w-6 h-6 text-red-500" />
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white italic">Live <span className="text-red-600">Direct</span></h3>
                  </div>

                  <div className="space-y-6 flex-1">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stream URL (YouTube / Cole Lista IPTV / .mp4)</label>
                        <div className="relative">
                           <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                           <input 
                              type="text" 
                              value={tempStreamUrl}
                              onChange={(e) => setTempStreamUrl(e.target.value)}
                              onPaste={(e) => {
                                 const pastedText = e.clipboardData.getData('text');
                                 if (pastedText.includes('#EXTM3U')) {
                                    e.preventDefault();
                                    try {
                                      const lines = pastedText.split(/\r?\n/);
                                      const channels: IPTVChannel[] = [];
                                      let currentChannel: Partial<IPTVChannel> = {};
                                      
                                      lines.forEach(line => {
                                         const l = line.trim();
                                         if (l.startsWith('#EXTINF:')) {
                                            const nameMatch = l.match(/tvg-name="([^"]+)"/);
                                            const logoMatch = l.match(/tvg-logo="([^"]+)"/);
                                            const groupMatch = l.match(/group-title="([^"]+)"/);
                                            const fallbackName = l.split(',').pop();
                                            
                                            currentChannel = {
                                               name: nameMatch ? nameMatch[1] : (fallbackName || 'Canal Desconhecido'),
                                               logo: logoMatch ? logoMatch[1] : '',
                                               group: groupMatch ? groupMatch[1] : 'Outros',
                                            };
                                         } else if (l.startsWith('http')) {
                                            if (currentChannel.name || lines.length <= 3) {
                                               channels.push({
                                                  name: currentChannel.name || l.split('/').pop() || 'Stream',
                                                  logo: currentChannel.logo || '',
                                                  group: currentChannel.group || 'Outros',
                                                  url: l
                                               });
                                               currentChannel = {};
                                            }
                                         }
                                      });
                                      
                                      if (channels.length > 0) {
                                         setIptvChannels(channels);
                                         
                                         if (channels.length <= 100 && window.confirm("Deseja transmitir todos estes vídeos em sequência como uma Maratona (Auto-Avançar)?\n\nOK = Maratona Sequencial (Ex: Episódio 1 ao último)\nCancelar = Substituir apenas a grelha de canais abaixo")) {
                                            const urls = channels.map(c => c.url).reverse(); // M3U geralmente põe os EPS mais novos no topo
                                            setTempStreamUrl(JSON.stringify(urls));
                                            showAdminToast(`${channels.length} episódios configurados para Maratona Seqüencial!`, "success");
                                         } else {
                                            setTempStreamUrl(channels[0].url);
                                            showAdminToast(`${channels.length} canais carregados da lista!`, "success");
                                         }
                                      } else {
                                         setTempStreamUrl(pastedText);
                                         showAdminToast("Nenhum link encontrado na lista.", "error");
                                      }
                                    } catch(err) {
                                       setTempStreamUrl(pastedText);
                                    }
                                 }
                              }}
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-12 pr-6 text-xs text-white outline-none focus:border-red-600"
                              placeholder="Cole o arquivo #EXTM3U ou link direto aqui..."
                           />
                        </div>
                     </div>

                     {iptvChannels.length > 0 && (
                        <div className="space-y-3 animate-in fade-in">
                           <div className="flex justify-between items-center px-2 pt-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lista Reconhecida ({iptvChannels.length} canais)</label>
                              <button onClick={() => setIptvChannels([])} className="text-[9px] font-black text-red-500 uppercase hover:underline">Apagar</button>
                           </div>
                           <div className="max-h-60 overflow-y-auto bg-slate-950 border border-slate-800 rounded-3xl p-3 scrollbar-hide space-y-2 relative">
                              {iptvChannels.map((ch, idx) => (
                                <button 
                                  key={idx}
                                  onClick={() => setTempStreamUrl(ch.url)}
                                  className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left group ${tempStreamUrl === ch.url ? 'bg-red-600 border border-red-500 shadow-lg' : 'hover:bg-slate-900 border border-transparent'}`}
                                >
                                  {ch.logo ? (
                                    <img src={ch.logo} className="w-10 h-10 rounded-xl object-contain bg-black/50 p-1 flex-shrink-0" alt={ch.name}/>
                                  ) : (
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${tempStreamUrl === ch.url ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}>
                                       <Tv className="w-4 h-4" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0 pr-2">
                                     <p className={`text-xs font-black truncate transition-colors ${tempStreamUrl === ch.url ? 'text-white' : 'text-slate-300'}`}>{ch.name}</p>
                                     <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 truncate transition-colors ${tempStreamUrl === ch.url ? 'text-white/70' : 'text-slate-500'}`}>{ch.group}</p>
                                  </div>
                                </button>
                              ))}
                           </div>
                        </div>
                     )}

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Master Clock (Sync)</label>
                        <div className="relative">
                           <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                           <input 
                              type="datetime-local" 
                              value={tempStartTime}
                              onChange={(e) => setTempStartTime(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-12 pr-6 text-xs text-white outline-none focus:border-red-600"
                           />
                        </div>
                     </div>

                     <div className={`p-8 rounded-[32px] border text-center transition-all ${tempStreamUrl ? 'bg-red-600/10 border-red-500/20' : 'bg-slate-950/40 border-slate-800'}`}>
                        {tempStreamUrl.includes('youtube.com') || tempStreamUrl.includes('youtu.be') ? (
                          <MonitorPlay className={`w-12 h-12 mx-auto mb-4 ${tempStreamUrl ? 'text-red-500 animate-pulse' : 'text-slate-800'}`} />
                        ) : (
                          <Radio className={`w-12 h-12 mx-auto mb-4 ${tempStreamUrl ? 'text-red-500 animate-pulse' : 'text-slate-800'}`} />
                        )}
                        <h4 className="text-sm font-black uppercase text-white">
                           {tempStreamUrl 
                             ? (tempStreamUrl.includes('youtube') || tempStreamUrl.includes('youtu.be') ? 'Transmissão do YouTube' : 'Playout de Mídia Ativo')
                             : 'Sinal Desconectado'}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-widest">{tempStreamUrl ? 'Canais ativos' : 'Aguardando configuração'}</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* VIEW: OPERAÇÕES (VENDA E SISTEMA) */}
        {activeView === 'OPERACOES' && (
          <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">Definições <span className="text-red-600">Sistema</span></h2>
                  <p className="text-slate-500 text-xs md:text-sm mt-2 font-medium">Controle de taxas, pagamentos e parâmetros operacionais.</p>
                </div>
                <button 
                  onClick={handleSaveOperations}
                  className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-8 md:px-10 py-4 md:py-5 rounded-[20px] md:rounded-[24px] font-black text-[11px] uppercase tracking-widest flex justify-center items-center gap-3 shadow-2xl transition-all"
                >
                  <Save className="w-4 h-4" /> Salvar Operações
                </button>
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-10">
                {/* Venda e Taxas */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] md:rounded-[48px] p-6 md:p-10 space-y-6 md:space-y-10">
                   <div className="flex items-center gap-4">
                      <DollarSign className="w-6 h-6 text-emerald-500" />
                      <h3 className="text-2xl font-black uppercase tracking-tight text-white italic">Parâmetros <span className="text-emerald-500">Financeiros</span></h3>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                      <div className="bg-slate-950 border border-slate-800 rounded-[32px] p-8 space-y-4">
                         <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Preço Caixa</label>
                            <Package className="w-4 h-4 text-slate-700" />
                         </div>
                         <div className="flex items-center gap-2">
                            <input 
                               type="number" 
                               value={tempBoxPrice}
                               onChange={(e) => setTempBoxPrice(parseInt(e.target.value) || 0)}
                               className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-2xl font-black text-white outline-none focus:border-emerald-600"
                            />
                            <span className="text-emerald-500 font-black text-2xl">$</span>
                         </div>
                         <p className="text-[9px] font-bold text-slate-600 italic">Aplicado a cada pizza individual.</p>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-[32px] p-8 space-y-4">
                         <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pedido Mínimo</label>
                            <AlertCircle className="w-4 h-4 text-slate-700" />
                         </div>
                         <div className="flex items-center gap-2">
                            <input 
                               type="number" 
                               value={tempMinOrder}
                               onChange={(e) => setTempMinOrder(parseInt(e.target.value) || 0)}
                               className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-2xl font-black text-white outline-none focus:border-emerald-600"
                            />
                            <span className="text-emerald-500 font-black text-2xl">$</span>
                         </div>
                         <p className="text-[9px] font-bold text-slate-600 italic">Impede checkout abaixo deste valor.</p>
                      </div>
                   </div>

                   <div className="bg-slate-950/50 border border-slate-800 rounded-[32px] p-6 md:p-8 flex items-center justify-between">
                      <div className="flex items-center gap-4 md:gap-5">
                         <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-blue-500 flex-shrink-0" />
                         <div>
                            <p className="text-xs font-black text-white uppercase tracking-widest">Pagamentos USDT (Crypto)</p>
                            <p className="text-[9px] font-bold text-slate-600">Aceitar stablecoins no checkout digital</p>
                         </div>
                      </div>
                      <div className="w-14 h-7 bg-emerald-600 rounded-full relative cursor-pointer">
                         <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full"></div>
                      </div>
                   </div>
                </div>

                {/* Sistema e Status */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] md:rounded-[48px] p-6 md:p-10 space-y-6 md:space-y-10">
                   <div className="flex items-center gap-4">
                      <Wrench className="w-6 h-6 text-red-500" />
                      <h3 className="text-2xl font-black uppercase tracking-tight text-white italic">Config <span className="text-red-600">Global</span></h3>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center justify-between p-6 bg-slate-950/40 rounded-[32px] border border-slate-800 group hover:border-red-600/30 transition-all">
                        <div className="flex items-center gap-4">
                           <ShieldX className="w-6 h-6 text-slate-500" />
                           <div>
                              <p className="text-xs font-black text-white uppercase tracking-widest">Modo Manutenção</p>
                              <p className="text-[9px] font-bold text-slate-600">Clientes não poderão ver o cardápio</p>
                           </div>
                        </div>
                        <div className="w-14 h-7 bg-slate-800 rounded-full relative cursor-not-allowed">
                           <div className="absolute left-1 top-1 w-5 h-5 bg-slate-600 rounded-full"></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-6 bg-slate-950/40 rounded-[32px] border border-slate-800 group hover:border-red-600/30 transition-all">
                        <div className="flex items-center gap-4">
                           <Volume2 className="w-6 h-6 text-slate-500" />
                           <div>
                              <p className="text-xs font-black text-white uppercase tracking-widest">Notificações Sonoras</p>
                              <p className="text-[9px] font-bold text-slate-600">Alertar equipe sobre novos pedidos</p>
                           </div>
                        </div>
                        <div 
                          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                          className={`w-14 h-7 rounded-full relative cursor-pointer transition-all ${isSoundEnabled ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-slate-800'}`}
                        >
                           <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${isSoundEnabled ? 'right-1' : 'left-1'}`}></div>
                        </div>
                      </div>
                   </div>

                   <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[40px] p-10 text-center">
                      <Sparkles className="w-12 h-12 text-yellow-500/20 mb-4" />
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Operações Blindadas</p>
                      <p className="text-[9px] text-slate-600 font-bold mt-2 max-w-[200px]">As alterações financeiras refletem instantaneamente no carrinho do cliente.</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeView === 'CARDÁPIO' && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 w-full overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="w-full">
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic whitespace-normal">Cardápio <span className="text-red-600">Digital</span></h2>
                <p className="text-slate-500 text-xs md:text-sm mt-2 font-medium break-words">Gerencie pizzas, bebidas e disponibilidade em tempo real.</p>
              </div>
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setFormCategory(categories[0] || 'PIZZAS');
                  setIsAddingProduct(true);
                }}
                className="w-full md:w-auto bg-red-600 hover:bg-red-500 text-white px-8 py-4 md:py-5 rounded-[20px] md:rounded-[24px] font-black text-[11px] uppercase tracking-widest flex justify-center items-center gap-3 shadow-2xl transition-all"
              >
                <Plus className="w-4 h-4" /> Novo Produto
              </button>
            </div>

            {/* Abas de Categorias */}
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide flex-nowrap -mx-6 px-6 md:mx-0 md:px-0">
               {categories.map(cat => (
                 <button 
                   key={cat}
                   onClick={() => setSelectedCategory(cat)}
                   className={`px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${
                     (selectedCategory === cat || (!selectedCategory && cat === categories[0])) 
                        ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                        : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-white'
                   }`}
                 >
                   {cat}
                 </button>
               ))}
            </div>

            {/* Grade de Produtos */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {products
                 .filter(p => p.category === (selectedCategory || categories[0]))
                 .map(product => (
                 <div key={product.id} className={`bg-slate-900/60 backdrop-blur-xl border rounded-[32px] p-6 transition-all ${product.isActive ? 'border-slate-800 hover:border-slate-600' : 'border-red-500/30 opacity-60'}`}>
                    <div className="flex gap-4 items-start mb-4">
                       {product.image && <img src={product.image} alt={product.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-800 flex-shrink-0" />}
                       <div className="flex-1 flex justify-between items-start">
                          <h3 className="text-xl font-black text-white pr-4 leading-tight">{product.name}</h3>
                          <button 
                            onClick={async () => {
                              const updated = products.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p);
                              onUpdateProducts(updated);
                              try {
                                await supabase.from('products').update({ is_active: !product.isActive }).eq('id', product.id);
                                showAdminToast(product.isActive ? 'Produto indisponível' : 'Produto ativado', product.isActive ? 'alert' : 'success');
                              } catch(e) {}
                            }}
                            className={`w-12 h-6 flex-shrink-0 rounded-full relative transition-all ${product.isActive ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-800'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${product.isActive ? 'right-1' : 'left-1'}`}></div>
                          </button>
                       </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-6 line-clamp-2 h-8 leading-relaxed">{product.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6 min-h-[30px]">
                      {Object.entries(product.prices).map(([size, price]) => (
                        <div key={size} className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center">
                           <span className="text-[9px] font-black text-slate-500 uppercase mr-2">{size}</span>
                           <span className="text-xs font-bold text-white">${price}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                       <button 
                         onClick={() => { 
                           setEditingProduct(product); 
                           setFormCategory(product.category);
                           setIsAddingProduct(true); 
                         }}
                         className="flex-1 py-3 bg-slate-950 border border-slate-800 hover:border-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2"
                       >
                         <Edit2 className="w-3 h-3" /> Editar
                       </button>
                       <button 
                         onClick={async () => {
                           if(window.confirm("Deseja realmente excluir este produto permanentemente?")) {
                             onUpdateProducts(products.filter(p => p.id !== product.id));
                             try {
                               await supabase.from('products').delete().eq('id', product.id);
                               showAdminToast("Produto apagado", "info");
                             } catch(e) {}
                           }
                         }}
                         className="px-4 py-3 bg-red-900/10 hover:bg-red-600 rounded-2xl text-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/20"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* VIEW: PEDIDOS (GESTÃO DE VENDAS) */}
        {activeView === 'PEDIDOS' && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 w-full overflow-hidden">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="w-full">
                   <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic whitespace-normal">Gestão de <span className="text-red-600">Pedidos</span></h2>
                   <p className="text-slate-500 text-xs md:text-sm mt-2 font-medium break-words">Controle o andamento e status de cada venda em tempo real.</p>
                </div>
                <div className="flex bg-slate-900 border border-slate-800 rounded-[20px] md:rounded-full p-1 w-full md:w-auto overflow-x-auto scrollbar-hide">
                   <button 
                     onClick={() => setOrderFilter('ATIVOS')}
                     className={`flex-1 md:flex-none whitespace-nowrap px-6 md:px-8 py-3 rounded-[16px] md:rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${orderFilter === 'ATIVOS' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                   >
                     Em Andamento
                   </button>
                   <button 
                     onClick={() => setOrderFilter('HISTORICO')}
                     className={`flex-1 md:flex-none whitespace-nowrap px-6 md:px-8 py-3 rounded-[16px] md:rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${orderFilter === 'HISTORICO' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                   >
                     Finalizados
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {sales
                  .filter(s => orderFilter === 'ATIVOS' ? ['RECEBIDO', 'PREPARO', 'PRONTO', 'ENTREGUE'].includes(s.status) : ['CONCLUIDO', 'CANCELADO'].includes(s.status))
                  .sort((a,b) => b.timestamp - a.timestamp)
                  .map(sale => (
                  <div key={sale.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[32px] p-8 flex flex-col hover:border-slate-600 transition-colors">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h3 className="text-xl font-black text-white leading-tight">{sale.customerName}</h3>
                           <p className="text-xs text-slate-500 font-bold mt-1">{sale.customerPhone || 'Sem telefone'}</p>
                           <p className="text-[9px] text-slate-600 font-black mt-2">{new Date(sale.timestamp).toLocaleTimeString()}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-black text-emerald-500">{sale.total}$</p>
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{sale.paymentMethod || 'DINHEIRO'}</p>
                        </div>
                     </div>
                     
                     <div className="bg-slate-950/70 rounded-[20px] p-5 mb-6 flex-1 border border-slate-800/50">
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">{sale.itemsDetail}</p>
                        {sale.notes && (
                           <div className="mt-4 pt-4 border-t border-slate-800/50">
                              <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <AlertCircle className="w-3 h-3" /> Observação do Cliente:
                              </p>
                              <p className="text-xs text-yellow-500/80 italic">"{sale.notes}"</p>
                           </div>
                        )}
                        <div className="mt-5 flex items-center gap-2">
                           <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                              Destino: {sale.zoneName || 'Retirada Local'}
                           </span>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center mb-2">Alterar Status</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-2 gap-2">
                           {['RECEBIDO', 'PREPARO', 'PRONTO', 'ENTREGUE', 'CONCLUIDO'].map((status) => {
                              const isCurrent = sale.status === status;
                              const colors: Record<string, string> = {
                                'RECEBIDO': 'bg-slate-700 text-white',
                                'PREPARO': 'bg-yellow-600 text-white',
                                'PRONTO': 'bg-orange-500 text-white',
                                'ENTREGUE': 'bg-blue-500 text-white',
                                'CONCLUIDO': 'bg-emerald-600 text-white',
                              };
                              return (
                                <button
                                   key={status}
                                   onClick={async () => {
                                      const updated = sales.map(s => s.id === sale.id ? { ...s, status: status as OrderStatus } : s);
                                      onUpdateSales(updated);
                                      
                                      try {
                                        await supabase.from('orders').update({ status }).eq('id', sale.id);
                                        
                                        if (status === 'CONCLUIDO' && sale.customerPhone && !isCurrent) {
                                           const { data: profile } = await supabase.from('profiles').select('*').eq('phone', sale.customerPhone).single();
                                           if (profile) {
                                              const earnedPoints = Math.floor((sale.total || 0) * 0.1) || 25;
                                              const newPoints = profile.points + earnedPoints;
                                              const newCount = profile.orders_count + 1;
                                              let newLevel = profile.level;
                                              if (newPoints >= 500) newLevel = 'DIAMANTE';
                                              else if (newPoints >= 250) newLevel = 'OURO';
                                              else if (newPoints >= 100) newLevel = 'PRATA';
                                              
                                              await supabase.from('profiles').update({
                                                 points: newPoints,
                                                 orders_count: newCount,
                                                 level: newLevel
                                              }).eq('phone', sale.customerPhone);
                                              
                                              showAdminToast(`Pedido CONCLUÍDO. O cliente ganhou +${earnedPoints} Sabor Coins!`, "success");
                                              return;
                                           }
                                        }
                                        showAdminToast(`Pedido atualizado para ${status}`, "success");
                                      } catch(e) {
                                        console.error('Falha ao atualizar status', e);
                                        showAdminToast("Erro ao conectar no sistema", "error");
                                      }
                                   }}
                                   className={`py-3 rounded-[14px] text-[9px] font-black uppercase tracking-widest transition-all ${
                                      isCurrent ? `${colors[status]} shadow-[0_4px_20px_rgba(0,0,0,0.3)] ring-2 ring-white/10 scale-105` : 'bg-slate-950 border border-slate-800 text-slate-500 hover:bg-slate-800'
                                   }`}
                                >
                                   {status}
                                </button>
                              );
                           })}
                           <button
                              onClick={async () => {
                                 if(window.confirm(`Tem certeza que deseja cancelar o pedido de ${sale.customerName}?`)) {
                                    const updated = sales.map(s => s.id === sale.id ? { ...s, status: 'CANCELADO' as OrderStatus } : s);
                                    onUpdateSales(updated);
                                    try {
                                      await supabase.from('orders').update({ status: 'CANCELADO' }).eq('id', sale.id);
                                      showAdminToast("Pedido cancelado", "alert");
                                    } catch(e) {}
                                 }
                              }}
                              className={`py-3 rounded-[14px] text-[9px] font-black uppercase tracking-widest transition-all ${sale.status === 'CANCELADO' ? 'bg-red-600 text-white' : 'bg-slate-950 text-red-500 border border-red-900/30 hover:bg-red-900/20'}`}
                           >
                              Cancelar
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
                
                {sales.filter(s => orderFilter === 'ATIVOS' ? ['RECEBIDO', 'PREPARO', 'PRONTO', 'ENTREGUE'].includes(s.status) : ['CONCLUIDO', 'CANCELADO'].includes(s.status)).length === 0 && (
                   <div className="col-span-full py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[40px]">
                      <Receipt className="w-16 h-16 text-slate-700 mb-6" />
                      <p className="text-slate-500 font-black text-sm uppercase tracking-widest">A fila está vazia</p>
                      <p className="text-[10px] text-slate-600 mt-2 font-bold">Nenhum pedido {orderFilter === 'ATIVOS' ? 'em andamento' : 'no histórico'} para consultar.</p>
                   </div>
                )}
             </div>
          </div>
        )}

        {/* Dashboards e Pedidos Omitidos mas funcionais ... */}
        {activeView === 'DASHBOARD' && (
           <div className="space-y-8 md:space-y-12 animate-in fade-in">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic w-full">Visão <span className="text-red-600">Geral</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                 <div className="bg-gray-900 border border-gray-800 p-8 md:p-10 rounded-[32px] md:rounded-[40px]">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Faturamento 30d</p>
                    <h3 className="text-4xl md:text-5xl font-black text-white">{stats.total}$</h3>
                 </div>
                 <div className="bg-gray-900 border border-gray-800 p-8 md:p-10 rounded-[32px] md:rounded-[40px]">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Pedidos na Fila</p>
                    <h3 className="text-4xl md:text-5xl font-black text-white">{stats.pending}</h3>
                 </div>
              </div>
           </div>
        )}

      </main>

      {isAddingProduct && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsAddingProduct(false)}></div>
          <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-[48px] p-10 shadow-3xl max-h-[90vh] overflow-y-auto scrollbar-hide animate-in zoom-in-95 duration-300">
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-8">
              {editingProduct ? 'Editar ' : 'Novo '}<span className="text-red-600">Produto</span>
            </h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const description = formData.get('description') as string;
              const image = formData.get('image') as string;
              const category = formCategory;
              
              const prices: Record<string, number> = {};
              if (category === 'PIZZAS') {
                if (formData.get('price_FAMILIAR')) prices['FAMILIAR'] = Number(formData.get('price_FAMILIAR'));
                if (formData.get('price_MEDIO')) prices['MEDIO'] = Number(formData.get('price_MEDIO'));
                if (formData.get('price_PEQ')) prices['PEQ'] = Number(formData.get('price_PEQ'));
              } else {
                if (formData.get('price_UN')) prices['UN'] = Number(formData.get('price_UN'));
              }

              if (Object.keys(prices).length === 0) {
                showAdminToast("Adicione pelo menos um preço!", "alert");
                return;
              }

              const newProduct: Product = {
                id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
                name,
                description,
                category,
                prices,
                image,
                isActive: editingProduct ? editingProduct.isActive : true
              };

              if (editingProduct) {
                onUpdateProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
              } else {
                onUpdateProducts([...products, newProduct]);
              }

              try {
                await supabase.from('products').upsert({
                  id: newProduct.id,
                  name: newProduct.name,
                  description: newProduct.description,
                  prices: newProduct.prices,
                  category: newProduct.category,
                  is_active: newProduct.isActive,
                  image: newProduct.image
                });
                showAdminToast(editingProduct ? "Produto atualizado!" : "Produto criado!", "success");
              } catch(e) {
                showAdminToast("Erro ao salvar no banco", "error");
              }
              
              setIsAddingProduct(false);
              setEditingProduct(null);
            }} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Produto</label>
                  <input name="name" defaultValue={editingProduct?.name} required className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-red-600 outline-none transition-all placeholder:text-slate-700 hover:border-slate-700" placeholder="Ex: Pizza Margherita" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoria</label>
                  <select 
                     value={formCategory} 
                     onChange={(e) => setFormCategory(e.target.value)}
                     className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-red-600 outline-none appearance-none hover:border-slate-700 transition-all cursor-pointer"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descrição Comercial</label>
                <textarea name="description" defaultValue={editingProduct?.description} required rows={3} className="w-full bg-slate-900 border border-slate-800 rounded-[24px] p-5 text-sm font-medium text-slate-300 focus:border-red-600 outline-none resize-none hover:border-slate-700 transition-all placeholder:text-slate-700" placeholder="Ingredientes detalhados separados por vírgula..." />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">URL da Imagem (Opcional)</label>
                <div className="flex gap-4 items-center">
                  <input name="image" defaultValue={editingProduct?.image} className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-sm font-medium text-white focus:border-red-600 outline-none hover:border-slate-700 transition-all placeholder:text-slate-700" placeholder="https://..." />
                  {editingProduct?.image && <img src={editingProduct.image} alt="Preview" className="w-16 h-16 rounded-2xl object-cover border border-slate-800 flex-shrink-0" />}
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-8">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tabela de Preços</label>
                </div>
                
                {formCategory === 'BEBIDAS' ? (
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-black text-white uppercase tracking-widest w-16">ÚNICO</span>
                    <input name="price_UN" type="number" defaultValue={editingProduct?.prices['UN']} className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-base font-black text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-800" placeholder="0.00" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['FAMILIAR', 'MEDIO', 'PEQ'].map((size) => (
                      <div key={size} className="space-y-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{size}</span>
                        <input name={`price_${size}`} type="number" defaultValue={editingProduct?.prices[size]} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-black text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-800" placeholder="Ex: 1500" />
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[9px] font-bold text-slate-500 mt-6 italic">* Deixe em branco caso o tamanho não esteja disponível.</p>
              </div>

              <div className="flex gap-4 pt-4 mt-8">
                <button type="button" onClick={() => setIsAddingProduct(false)} className="px-8 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-5 bg-red-600 hover:bg-red-500 rounded-[24px] font-black text-[11px] uppercase tracking-widest text-white shadow-2xl shadow-red-900/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                  <Save className="w-4 h-4" /> {editingProduct ? 'Salvar Alterações' : 'Criar Produto no Cardápio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {adminToast && (
        <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] px-12 py-6 rounded-[32px] shadow-3xl font-black text-[11px] uppercase tracking-widest animate-in slide-in-from-bottom-10 flex items-center gap-4 ${
          adminToast.type === 'alert' ? 'bg-red-600 text-white animate-bounce' : 'bg-emerald-600 text-white'
        }`}>
          {adminToast.type === 'alert' ? <Bell className="w-5 h-5 fill-current" /> : <CheckCircle2 className="w-5 h-5" />}
          {adminToast.message}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
