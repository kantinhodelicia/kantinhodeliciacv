
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PizzaSize, CartItem, Product, DeliveryZone, User, Extra, SaleRecord, OrderStatus } from './types';
import { PIZZAS as DEFAULT_PIZZAS, DRINKS as DEFAULT_DRINKS, ZONES as DEFAULT_ZONES } from './constants';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import MenuList from './components/MenuList';
import CartSheet from './components/CartSheet';
import ZonePicker from './components/ZonePicker';
import GameModal from './components/GameModal';
import Onboarding from './components/Onboarding';
import ProfileModal from './components/ProfileModal';
import AdminPanel from './components/AdminPanel';
import LiveModal from './components/LiveModal';
import AuthWrapper from './components/Auth/AuthWrapper';
import { ShoppingBag, Gamepad2, Sparkles, Award, Lock, ShieldAlert, X, Tv, MapPin, Pizza, Coffee } from 'lucide-react';

const App: React.FC = () => {
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(authUser);

  const [headerBg, setHeaderBg] = useState<string>(() => {
    return localStorage.getItem('kd_header_bg') || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1200';
  });

  const [streamUrl, setStreamUrl] = useState<string>(() => {
    return localStorage.getItem('kd_stream_url') || '';
  });

  const [scheduledStartTime, setScheduledStartTime] = useState<string>(() => {
    return localStorage.getItem('kd_scheduled_start') || '';
  });

  // Novos estados operacionais do Studio
  const [boxPrice, setBoxPrice] = useState<number>(() => {
    const saved = localStorage.getItem('kd_box_price');
    return saved ? parseInt(saved) : 100;
  });

  const [minOrder, setMinOrder] = useState<number>(() => {
    const saved = localStorage.getItem('kd_min_order');
    return saved ? parseInt(saved) : 500;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('kd_products_data');
    const defaults = [
      ...DEFAULT_PIZZAS.map(p => ({ ...p, isActive: true, category: 'PIZZAS' })),
      ...DEFAULT_DRINKS.map(d => ({ ...d, isActive: true, category: 'BEBIDAS' }))
    ];

    if (saved) {
      const savedProducts: Product[] = JSON.parse(saved);
      // Merge: Update existing products with new data from constants, but keep isActive state from saved
      // and add any brand new products.
      return defaults.map(d => {
        const s = savedProducts.find(item => item.id === d.id);
        if (s) {
          return { ...d, isActive: s.isActive ?? true };
        }
        return d;
      });
    }
    return defaults;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('kd_categories_data');
    return saved ? JSON.parse(saved) : ['PIZZAS', 'BEBIDAS'];
  });

  const [zones, setZones] = useState<DeliveryZone[]>(() => {
    const saved = localStorage.getItem('kd_zones_data');
    return saved ? JSON.parse(saved) : DEFAULT_ZONES;
  });

  const [sales, setSales] = useState<SaleRecord[]>(() => {
    const saved = localStorage.getItem('kd_sales_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('kd_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orderNotes, setOrderNotes] = useState<string>(() => {
    return localStorage.getItem('kd_notes') || '';
  });

  const [activeTab, setActiveTab] = useState<string>('PIZZAS');
  const [selectedSize, setSelectedSize] = useState<PizzaSize>('FAMILIAR');
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPin, setAdminPin] = useState('');

  const [halfMode, setHalfMode] = useState<boolean>(false);
  const [halfSelection, setHalfSelection] = useState<{ left?: Product; right?: Product }>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sync Supabase auth user with local state
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      localStorage.setItem('kd_user', JSON.stringify(authUser));
    }
  }, [authUser]);

  useEffect(() => {
    if (user) localStorage.setItem('kd_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('kd_header_bg', headerBg);
  }, [headerBg]);

  useEffect(() => {
    localStorage.setItem('kd_stream_url', streamUrl);
    localStorage.setItem('kd_scheduled_start', scheduledStartTime);
  }, [streamUrl, scheduledStartTime]);

  useEffect(() => {
    localStorage.setItem('kd_box_price', boxPrice.toString());
    localStorage.setItem('kd_min_order', minOrder.toString());
  }, [boxPrice, minOrder]);

  useEffect(() => {
    localStorage.setItem('kd_products_data', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('kd_categories_data', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('kd_zones_data', JSON.stringify(zones));
  }, [zones]);

  useEffect(() => {
    localStorage.setItem('kd_sales_history', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('kd_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('kd_notes', orderNotes);
  }, [orderNotes]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleAdminAccess = () => {
    if (isAdminAuthenticated) {
      setIsAdminOpen(true);
    } else {
      setShowAdminLogin(true);
    }
  };

  const verifyAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === '2024') {
      setIsAdminAuthenticated(true);
      setShowAdminLogin(false);
      setIsAdminOpen(true);
      setAdminPin('');
    } else {
      showToast('PIN Incorreto', 'error');
      setAdminPin('');
    }
  };

  const addToCart = useCallback((product: Product, size: string) => {
    if (product.isActive === false) {
      showToast('Sabor temporariamente indisponível', 'error');
      return;
    }

    const price = product.prices[size];
    const uniqueId = `${product.id}-${size}-${Date.now()}`;
    const newItem: CartItem = {
      id: product.id,
      uniqueId,
      name: product.name,
      price,
      size,
      quantity: 1,
      extras: [],
      needsBox: product.category === 'PIZZAS'
    };

    setCart(prev => [...prev, newItem]);
    showToast(`${product.name} no carrinho!`, 'success');
  }, [showToast]);

  const finalizeOrder = useCallback((orderTotal: number) => {
    if (!user) return;

    const itemsDetail = cart.map(i => `${i.quantity}x ${i.name}`).join(', ');

    const newSale: SaleRecord = {
      id: `sale-${Date.now()}`,
      timestamp: Date.now(),
      total: orderTotal,
      itemsCount: cart.length,
      itemsDetail: itemsDetail,
      items: [...cart],
      customerName: user.name,
      customerPhone: user.phone,
      zoneName: selectedZone?.name || 'Retirada',
      status: 'RECEBIDO',
      paymentMethod: 'DINHEIRO',
      notes: orderNotes
    };

    setSales(prev => [newSale, ...prev]);

    const newPoints = user.points + 25;
    const newCount = user.ordersCount + 1;
    let newLevel = user.level;

    if (newPoints >= 500) newLevel = 'DIAMANTE';
    else if (newPoints >= 250) newLevel = 'OURO';
    else if (newPoints >= 100) newLevel = 'PRATA';

    setUser(prev => prev ? { ...prev, points: newPoints, ordersCount: newCount, level: newLevel } : null);

    setCart([]);
    setOrderNotes('');
    localStorage.removeItem('kd_notes');
    setIsCartOpen(false);

    showToast('Pedido registrado com sucesso!', 'success');
  }, [user, showToast, cart, selectedZone, orderNotes]);

  const halfPrice = useMemo(() => {
    const priceLeft = halfSelection.left?.prices[selectedSize] || 0;
    const priceRight = halfSelection.right?.prices[selectedSize] || 0;
    return Math.max(priceLeft, priceRight);
  }, [halfSelection, selectedSize]);

  const addHalfAndHalf = useCallback(() => {
    if (!halfSelection.left || !halfSelection.right) {
      showToast('Selecione os dois lados primeiro', 'error');
      return;
    }

    const newItem: CartItem = {
      id: `half-${Date.now()}`,
      uniqueId: `half-${Date.now()}`,
      name: `Meio ${halfSelection.left.name} / Meio ${halfSelection.right.name}`,
      price: halfPrice,
      size: selectedSize,
      quantity: 1,
      isHalfAndHalf: true,
      leftHalf: halfSelection.left,
      rightHalf: halfSelection.right,
      extras: [],
      needsBox: true
    };

    setCart(prev => [...prev, newItem]);
    setHalfMode(false);
    setHalfSelection({});
    showToast('Customizada adicionada!', 'success');
  }, [halfSelection, selectedSize, halfPrice, showToast]);

  const updateQuantity = (uniqueId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.uniqueId === uniqueId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeItem = (uniqueId: string) => {
    setCart(prev => prev.filter(item => item.uniqueId !== uniqueId));
    showToast('Item removido', 'info');
  };

  const handleUpdateSales = (updatedSales: SaleRecord[]) => {
    setSales(updatedSales);
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block bg-gradient-to-br from-red-600 to-orange-600 p-8 rounded-[40px] mb-6 shadow-2xl shadow-red-900/40 animate-pulse">
            <div className="text-6xl font-black text-white">🍕</div>
          </div>
          <p className="text-slate-400 text-sm font-black uppercase tracking-widest">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show auth if no user
  if (!user) {
    return <AuthWrapper />;
  }

  const sizes: PizzaSize[] = ['FAMILIAR', 'MEDIO', 'PEQ'];

  return (
    <div className="min-h-screen bg-slate-950 pb-28">
      <Header
        user={user}
        cartCount={cart.length}
        onLogout={() => setUser(null)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAdmin={handleAdminAccess}
        backgroundUrl={headerBg}
        hasLive={!!streamUrl}
        onOpenLive={() => setIsLiveOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="max-w-4xl mx-auto px-4 mt-10">

        {/* Navegação de Categorias Premium */}
        <div className="flex bg-slate-900/60 backdrop-blur-xl p-2 rounded-[32px] border border-slate-800/50 mb-10 overflow-x-auto scrollbar-hide snap-x">
          {([...categories, 'ZONES']).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[140px] snap-center flex items-center justify-center gap-3 py-4 px-6 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === tab ? 'bg-red-600 text-white shadow-2xl shadow-red-900/40 translate-y-[-2px]' : 'text-slate-500 hover:text-slate-200'}`}
            >
              {tab === 'PIZZAS' ? <Pizza className="w-4 h-4" /> : tab === 'BEBIDAS' ? <Coffee className="w-4 h-4" /> : tab === 'ZONES' ? <MapPin className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {tab === 'PIZZAS' ? 'Pizzas' : tab === 'BEBIDAS' ? 'Bebidas' : tab === 'ZONES' ? 'Entregas' : tab}
            </button>
          ))}
        </div>

        {activeTab === 'PIZZAS' && !halfMode && (
          <div className="flex gap-4 mb-10 animate-in slide-in-from-left duration-500">
            {sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`flex-1 py-4 rounded-[24px] border-2 font-black text-xs uppercase tracking-widest transition-all duration-300 ${selectedSize === size ? 'border-red-500 bg-red-500/10 text-red-400 shadow-lg' : 'border-slate-800 text-slate-600 hover:border-slate-700'}`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'PIZZAS' && (
          <div className="mb-10">
            <button
              onClick={() => { setHalfMode(!halfMode); setHalfSelection({}); }}
              className={`w-full py-6 rounded-[32px] border-2 border-dashed font-black uppercase tracking-[0.3em] text-[10px] transition-all ${halfMode ? 'border-red-500/50 text-red-500 bg-red-500/5' : 'border-slate-800 text-slate-500 hover:border-slate-600 hover:bg-slate-900/40'}`}
            >
              {halfMode ? 'Sair da Customização' : 'Criar Pizza Meio a Meio'}
            </button>

            {halfMode && (
              <div className="mt-6 p-8 bg-slate-900/40 border border-slate-800 rounded-[40px] animate-in zoom-in duration-300 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-6 text-center mb-8">
                  <div className={`p-6 rounded-[32px] border-2 transition-all ${halfSelection.left ? 'border-green-500/40 bg-green-500/10' : 'border-slate-800 bg-black/20'}`}>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Lado Esquerdo</p>
                    <p className="font-black text-sm text-white truncate">{halfSelection.left?.name || 'Aguardando...'}</p>
                  </div>
                  <div className={`p-6 rounded-[32px] border-2 transition-all ${halfSelection.right ? 'border-blue-500/40 bg-blue-500/10' : 'border-slate-800 bg-black/20'}`}>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Lado Direito</p>
                    <p className="font-black text-sm text-white truncate">{halfSelection.right?.name || 'Aguardando...'}</p>
                  </div>
                </div>
                {halfSelection.left && halfSelection.right && (
                  <button onClick={addHalfAndHalf} className="w-full bg-white text-black font-black py-5 rounded-[24px] shadow-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs">
                    FINALIZAR COMBINAÇÃO - {halfPrice}$
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ZONES' ? (
          <ZonePicker zones={zones} selected={selectedZone} onSelect={setSelectedZone} />
        ) : (
          <MenuList
            products={products.filter(p => p.category === activeTab)}
            selectedSize={selectedSize}
            halfMode={activeTab === 'PIZZAS' && halfMode}
            halfSelection={halfSelection}
            onSelect={(p, size) => {
              if (halfMode) {
                if (!halfSelection.left) setHalfSelection(prev => ({ ...prev, left: p }));
                else if (!halfSelection.right) setHalfSelection(prev => ({ ...prev, right: p }));
              } else {
                addToCart(p, size);
              }
            }}
          />
        )}
      </main>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/60 backdrop-blur-2xl border-t border-white/5 p-5 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-5">
          <button onClick={() => setIsGameOpen(true)} className="p-4 bg-slate-900 border border-slate-800 rounded-[24px] text-slate-400 hover:text-white transition-all shadow-xl active:scale-95">
            <Gamepad2 className="w-7 h-7" />
          </button>
          <button onClick={() => setIsCartOpen(true)} className="flex-1 bg-red-600 hover:bg-red-500 py-5 rounded-[28px] flex items-center justify-center gap-4 shadow-2xl shadow-red-900/40 group active:scale-[0.98] transition-all">
            <ShoppingBag className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="font-black uppercase tracking-[0.2em] text-xs">Finalizar Carrinho ({cart.length})</span>
          </button>
          <button onClick={() => setIsProfileOpen(true)} className="p-4 bg-slate-900 border border-slate-800 rounded-[24px] text-slate-400 hover:text-white transition-all shadow-xl active:scale-95">
            <Award className="w-7 h-7" />
          </button>
        </div>
      </div>

      {showAdminLogin && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setShowAdminLogin(false)}></div>
          <form onSubmit={verifyAdminPin} className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[48px] p-10 shadow-2xl animate-in zoom-in">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-20 h-20 bg-red-600/20 rounded-[32px] flex items-center justify-center mb-6 border border-red-500/30">
                <Lock className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Acesso <span className="text-red-600">Restrito</span></h3>
              <p className="text-[10px] text-slate-500 mt-3 font-black uppercase tracking-widest">Painel de Controle Kantinho</p>
            </div>
            <input
              type="password"
              placeholder="PIN"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center text-4xl font-black tracking-[0.5em] text-white outline-none focus:border-red-600 mb-8 shadow-inner"
              autoFocus
              maxLength={4}
            />
            <button type="submit" className="w-full bg-white text-black font-black py-5 rounded-[24px] hover:bg-slate-200 transition-all shadow-2xl uppercase tracking-widest text-xs">
              ENTRAR NO PAINEL
            </button>
          </form>
        </div>
      )}

      {isCartOpen && (
        <CartSheet
          cart={cart}
          zone={selectedZone}
          notes={orderNotes}
          onNotesChange={setOrderNotes}
          onClose={() => setIsCartOpen(false)}
          onUpdateQty={updateQuantity}
          onRemove={removeItem}
          onToggleExtra={() => { }}
          clearCart={() => setCart([])}
          user={user}
          onOrderComplete={finalizeOrder}
          boxPrice={boxPrice}
          minOrder={minOrder}
        />
      )}

      {isGameOpen && <GameModal onClose={() => setIsGameOpen(false)} />}
      {isLiveOpen && <LiveModal streamUrl={streamUrl} scheduledStartTime={scheduledStartTime} onClose={() => setIsLiveOpen(false)} />}
      {isProfileOpen && <ProfileModal user={user} onClose={() => setIsProfileOpen(false)} onOpenAdmin={handleAdminAccess} />}
      {isAdminOpen && (
        <AdminPanel
          products={products}
          categories={categories}
          zones={zones}
          sales={sales}
          headerBg={headerBg}
          streamUrl={streamUrl}
          scheduledStartTime={scheduledStartTime}
          boxPrice={boxPrice}
          minOrder={minOrder}
          onUpdateProducts={setProducts}
          onUpdateCategories={setCategories}
          onUpdateZones={setZones}
          onUpdateSales={handleUpdateSales}
          onUpdateHeaderBg={setHeaderBg}
          onUpdateStreamUrl={setStreamUrl}
          onUpdateScheduledStartTime={setScheduledStartTime}
          onUpdateBoxPrice={setBoxPrice}
          onUpdateMinOrder={setMinOrder}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {toast && (
        <div className={`fixed top-12 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full shadow-3xl z-[400] animate-in fade-in slide-in-from-top-12 duration-500 ${toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-slate-800'
          } text-white font-black text-xs uppercase tracking-widest`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default App;
