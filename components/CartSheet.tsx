
import React, { useState, useMemo } from 'react';
import { CartItem, DeliveryZone, User, Extra, Product } from '../types';
import { EXTRAS } from '../constants';
import { X, Trash2, Plus, Minus, Printer, MessageCircle, CheckCircle2, ShoppingBag, PlusCircle, MinusCircle, FileText, MapPin, ChevronDown, ChevronUp, Sparkles, Package, Info, AlertCircle, Zap, ArrowRight, Banknote, CreditCard, Bitcoin, User as UserIcon } from 'lucide-react';

type PaymentMethod = 'DINHEIRO' | 'CARTAO' | 'USDT';

interface Props {
  cart: CartItem[];
  products: Product[];
  zone: DeliveryZone | null;
  notes: string;
  onNotesChange: (notes: string) => void;
  onClose: () => void;
  onUpdateQty: (uid: string, delta: number) => void;
  onRemove: (uid: string) => void;
  onToggleExtra: (uid: string, extra: Extra) => void;
  clearCart: () => void;
  user: User | null;
  onOrderComplete?: (total: number, paymentMethod: PaymentMethod, guestData?: { name: string, phone: string }) => void;
  boxPrice?: number;
  minOrder?: number;
  onAddProduct?: (product: Product, size: string) => void;
}

const CartSheet: React.FC<Props> = ({ cart, products, zone, notes, onNotesChange, onClose, onUpdateQty, onRemove, onToggleExtra, clearCart, user, onOrderComplete, boxPrice = 100, minOrder = 0, onAddProduct }) => {
  const [expandedExtras, setExpandedExtras] = useState<Set<string>>(new Set());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DINHEIRO');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [showGuestError, setShowGuestError] = useState(false);

  const hasPizza = cart.some(i => i.needsBox);
  const hasDrink = cart.some(i => !i.needsBox);

  const upsellItems = useMemo(() => {
    const cartIds = new Set(cart.map(i => i.id));
    // If cart has pizza but no drinks, suggest drinks
    if (hasPizza && !hasDrink) {
      return products.filter(p => p.category === 'BEBIDAS' && p.isActive && !cartIds.has(p.id)).slice(0, 3);
    }
    // If cart has drinks but no pizza, suggest pizzas
    if (hasDrink && !hasPizza) {
      return products.filter(p => p.category === 'PIZZAS' && p.isActive && !cartIds.has(p.id)).slice(0, 3);
    }
    return [];
  }, [cart, products, hasPizza, hasDrink]);

  const toggleExtrasVisibility = (uid: string) => {
    setExpandedExtras(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const subtotal = cart.reduce((acc, item) => {
    const extrasPrice = item.extras.reduce((sum, e) => sum + e.price, 0);
    return acc + ((item.price + extrasPrice) * item.quantity);
  }, 0);
  
  const boxesPrice = cart.reduce((acc, item) => item.needsBox ? acc + (boxPrice * item.quantity) : acc, 0);
  const deliveryPrice = zone?.price || 0;
  const total = subtotal + boxesPrice + deliveryPrice;
  
  const isBelowMin = total < minOrder;

  const handlePrint = () => {
    const printArea = document.getElementById('print-area');
    if (!printArea) return;

    const date = new Date().toLocaleDateString('pt-PT');
    const time = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

    const itemsHtml = cart.map(item => `
      <div style="margin-bottom: 6px; border-bottom: 1px dotted #000; padding-bottom: 3px;">
        <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold;">
          <span>${item.quantity}x ${item.name} (${item.size})</span>
          <span>${(item.price + item.extras.reduce((s, e) => s + e.price, 0)) * item.quantity}$</span>
        </div>
        ${item.extras.length > 0 ? `
          <div style="font-size: 11px; margin-left: 10px;">
            ${item.extras.map(e => `+ ${e.name}`).join(', ')}
          </div>
        ` : ''}
      </div>
    `).join('');

    printArea.innerHTML = `
      <div style="font-family: 'Courier New', Courier, monospace; color: black; line-height: 1.2; width: 100%; max-width: 80mm;">
        <div style="text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 10px;">
          <h2 style="margin: 0; font-size: 18px;">KANTINHO DELÍCIA</h2>
          <p style="font-size: 11px; margin: 3px 0;">RECIBO DE CONFERÊNCIA</p>
          <p style="font-size: 10px; margin: 0;">${date} | ${time}</p>
        </div>
        
        <div style="font-size: 12px; margin-bottom: 10px;">
          <b>CLIENTE:</b> ${user?.name || guestName || 'CONVIDADO'}<br>
          <b>ZONA:</b> ${zone?.name || 'RETIRADA'}<br>
          <b>TEL:</b> ${user?.phone || guestPhone || ''}
        </div>

        <div style="border-bottom: 1px dashed black; padding-bottom: 10px; margin-bottom: 10px;">
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 5px;">RESUMO DO PEDIDO:</div>
          ${itemsHtml}
        </div>

        ${notes ? `
        <div style="font-size: 11px; border: 1px solid black; padding: 5px; margin-bottom: 10px;">
          <b>OBSERVAÇÕES:</b><br>${notes}
        </div>` : ''}

        <div style="font-size: 13px;">
          <div style="display: flex; justify-content: space-between;"><span>SUBTOTAL:</span> <span>${subtotal}$</span></div>
          ${boxesPrice > 0 ? `<div style="display: flex; justify-content: space-between;"><span>EMBALAGENS:</span> <span>${boxesPrice}$</span></div>` : ''}
          <div style="display: flex; justify-content: space-between;"><span>ENTREGA:</span> <span>${deliveryPrice}$</span></div>
          
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 2px solid black; padding-top: 5px; margin-top: 8px;">
            <span>TOTAL:</span>
            <span>${total}$</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; font-size: 11px; border-top: 1px solid #000; padding-top: 10px;">
          OBRIGADO PELA PREFERÊNCIA!<br>
          Siga-nos: @kantinhodelicia
        </div>
      </div>
    `;

    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleWhatsApp = () => {
    if (isBelowMin) return;

    const paymentLabels: Record<PaymentMethod, string> = {
      'DINHEIRO': '💵 Dinheiro',
      'CARTAO': '💳 Cartão',
      'USDT': '₿ USDT (Crypto)'
    };

    let msg = `*🍔 NOVO PEDIDO - KANTINHO DELÍCIA*\n`;
    msg += `--------------------------------\n`;
    msg += `👤 *Cliente:* ${user?.name || guestName || 'Convidado'}\n`;
    msg += `📞 *WhatsApp:* ${user?.phone || guestPhone || ''}\n`;
    msg += `📍 *Zona:* ${zone ? zone.name : 'Retirada no Balcão'}\n`;
    msg += `💳 *Pagamento:* ${paymentLabels[paymentMethod]}\n`;
    msg += `--------------------------------\n\n`;
    
    cart.forEach(item => {
      msg += `✅ *${item.quantity}x ${item.name}* (${item.size})\n`;
      if (item.extras.length > 0) {
        msg += `  └ _Extras: ${item.extras.map(e => e.name).join(', ')}_\n`;
      }
      msg += `  💰 Valor: ${(item.price + item.extras.reduce((s,e) => s+e.price, 0)) * item.quantity}$\n\n`;
    });

    if (notes.trim()) {
      msg += `--------------------------------\n`;
      msg += `📝 *Observações:* ${notes}\n`;
    }

    msg += `--------------------------------\n`;
    if (boxesPrice > 0) msg += `📦 *Caixas:* ${boxesPrice}$\n`;
    if (zone) msg += `🚚 *Entrega:* ${deliveryPrice}$\n`;
    msg += `\n🔥 *TOTAL A PAGAR: ${total}$*\n`;
    msg += `--------------------------------`;

    const url = `https://wa.me/2385999204?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    
    if (onOrderComplete) {
      onOrderComplete(total, paymentMethod, !user ? { name: guestName, phone: guestPhone } : undefined);
    }
  };

  const handleFinalOrder = () => {
    if (!user && (!guestName || !guestPhone)) {
      setShowGuestError(true);
      return;
    }
    handleWhatsApp();
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end no-print">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg glass h-full flex flex-col border-l border-white/10 shadow-2xl animate-in slide-in-from-right duration-500">
        <div className="flex items-center justify-between p-7 border-b border-white/5 bg-white/5 backdrop-blur-sm">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-red-500" />
              CARRINHO
            </h2>
            <p className="text-slate-400 text-sm">{cart.length} itens selecionados</p>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button 
                onClick={clearCart}
                className="p-3 bg-slate-800/50 text-slate-400 hover:text-red-500 rounded-full transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4"
              >
                <Trash2 className="w-4 h-4" /> Limpar
              </button>
            )}
            <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center px-10">
              <div className="w-24 h-24 bg-slate-900/40 rounded-full flex items-center justify-center mb-6 border border-slate-800">
                <ShoppingBag className="w-10 h-10 opacity-10" />
              </div>
              <p className="font-black text-xl text-slate-100 mb-2 uppercase tracking-tighter">Nada por aqui...</p>
              <p className="text-sm text-slate-400">Escolha seus sabores favoritos para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {isBelowMin && (
                <div className="bg-amber-600/10 border border-amber-500/30 p-4 rounded-3xl flex items-center gap-4 mb-4 animate-pulse">
                  <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-relaxed">
                    Pedido mínimo para entrega: {minOrder}$. Falta {(minOrder - total)}$ para completar.
                  </p>
                </div>
              )}

              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Itens do Pedido</p>
              {cart.map((item) => {
                const itemExtrasTotal = item.extras.reduce((sum, e) => sum + e.price, 0);
                const unitPrice = item.price + itemExtrasTotal;
                const isExpanded = expandedExtras.has(item.uniqueId);
                
                return (
                  <div key={item.uniqueId} className="glass border border-white/5 rounded-[36px] p-6 hover:bg-white/5 transition-all duration-500 group/item">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-black text-lg text-slate-100 leading-tight">{item.name}</h3>
                          <span className="bg-red-600/10 text-red-500 text-[9px] font-black px-2 py-0.5 rounded-lg border border-red-500/10 uppercase">{item.size}</span>
                          {item.needsBox && (
                            <span className="text-slate-500 flex items-center gap-1" title={`Requer Caixa (+${boxPrice}$)`}>
                              <Package className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        {item.extras.length > 0 && (
                          <button 
                            onClick={() => toggleExtrasVisibility(item.uniqueId)}
                            className="flex items-center gap-1.5 text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1"
                          >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {item.extras.length} extras adicionados
                          </button>
                        )}
                      </div>
                      <button 
                        onClick={() => onRemove(item.uniqueId)} 
                        className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {isExpanded && item.extras.length > 0 && (
                      <div className="mb-4 space-y-2 p-3 bg-black/20 rounded-2xl border border-white/5 animate-in slide-in-from-top-1">
                        {item.extras.map((extra, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                            <span>+ {extra.name}</span>
                            <span>{extra.price}$</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-slate-950/40 rounded-2xl p-1 border border-slate-800/50">
                        <button onClick={() => onUpdateQty(item.uniqueId, -1)} className="p-2 text-slate-500"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="w-10 text-center font-black text-slate-200">{item.quantity}</span>
                        <button onClick={() => onUpdateQty(item.uniqueId, 1)} className="p-2 text-slate-500"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-xl text-slate-100">{(unitPrice * item.quantity)}$</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Upsell Inteligente */}
              {upsellItems.length > 0 && onAddProduct && (
                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-4 ml-2">
                    <Zap className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                    <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em]">
                      {hasPizza && !hasDrink ? 'Adicionar Bebida?' : 'Que tal uma pizza?'}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {upsellItems.map(item => {
                      const defaultSize = Object.keys(item.prices)[0];
                      const price = item.prices[defaultSize];
                      return (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-900/30 border border-yellow-500/10 rounded-[24px] hover:border-yellow-500/30 transition-all group animate-in fade-in duration-300">
                          <div className="w-11 h-11 bg-slate-800 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
                            {item.category === 'BEBIDAS' ? '🥤' : '🍕'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-white truncate">{item.name}</p>
                            <p className="text-[10px] text-yellow-500 font-bold mt-0.5">{price}$</p>
                          </div>
                          <button
                            onClick={() => onAddProduct(item, defaultSize)}
                            className="p-2.5 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-black rounded-xl transition-all border border-yellow-500/20 hover:border-yellow-500 active:scale-95 flex-shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-6">
                <div className="flex items-center justify-between ml-2">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Instruções Especiais</p>
                  <Info className="w-3 h-3 text-slate-700" />
                </div>
                <textarea 
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  placeholder="Ex: Tirar cebola, trocar ingrediente, ponto da massa..."
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-slate-300 text-sm h-24 resize-none outline-none focus:border-red-600 transition-colors placeholder:text-slate-600 font-medium"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-8 glass border-t border-white/10 space-y-6 rounded-t-[52px] shadow-2xl">
          <div className="space-y-2">
            <div className="flex justify-between text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <span>Subtotal</span>
              <span>{subtotal}$</span>
            </div>
            {boxesPrice > 0 && (
              <div className="flex justify-between text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <span>Embalagens ({cart.filter(i => i.needsBox).reduce((a,b) => a+b.quantity, 0)} Caixas)</span>
                <span>{boxesPrice}$</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <span>Taxa de Entrega</span>
              <span>{zone ? `${deliveryPrice}$` : '--'}</span>
            </div>
            <div className="flex justify-between items-end pt-5 mt-2 border-t border-slate-800">
              <span className="text-4xl font-black text-white tracking-tighter">{total}<span className="text-red-600">$</span></span>
              <button 
                onClick={handlePrint} 
                disabled={cart.length === 0}
                className="p-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-2xl text-slate-400 hover:text-white transition-all"
                title="Imprimir Cupom"
              >
                <Printer className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Forma de Pagamento</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('DINHEIRO')}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border ${
                  paymentMethod === 'DINHEIRO' 
                    ? 'bg-green-600/20 border-green-500 text-green-400' 
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Banknote className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-wider">Dinheiro</span>
              </button>
              <button
                onClick={() => setPaymentMethod('CARTAO')}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border ${
                  paymentMethod === 'CARTAO' 
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-wider">Cartão</span>
              </button>
              <button
                onClick={() => setPaymentMethod('USDT')}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border ${
                  paymentMethod === 'USDT' 
                    ? 'bg-yellow-600/20 border-yellow-500 text-yellow-400' 
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Bitcoin className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-wider">USDT</span>
              </button>
            </div>
          </div>

          {!user && (
            <div className="space-y-4 p-5 bg-slate-950/40 border border-slate-800 rounded-3xl mb-2">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <UserIcon className="w-3 h-3" /> Dados para Entrega
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="Seu Nome"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className={`bg-slate-900 border ${showGuestError && !guestName ? 'border-red-600' : 'border-slate-800'} rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-red-600`}
                />
                <input 
                  type="tel" 
                  placeholder="WhatsApp"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className={`bg-slate-900 border ${showGuestError && !guestPhone ? 'border-red-600' : 'border-slate-800'} rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-red-600`}
                />
              </div>
              {showGuestError && (!guestName || !guestPhone) && (
                <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest ml-1 italic">
                  * Por favor preencha seu nome e telefone
                </p>
              )}
            </div>
          )}

          <button 
            onClick={handleFinalOrder}
            disabled={cart.length === 0 || isBelowMin}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-green-900/20"
          >
            <MessageCircle className="w-6 h-6" /> {isBelowMin ? 'VALOR MÍNIMO NÃO ATINGIDO' : 'ENVIAR PEDIDO AGORA'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartSheet;
