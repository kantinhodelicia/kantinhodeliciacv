
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, ChevronDown } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// The OpenRouter key is now injected at build time by Vite from .env.local
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

const SYSTEM_PROMPT = `Você é o "Pizza Bot", o assistente virtual do Kantinho Delícia Premium, a melhor pizzaria artesanal de Praia, Cabo Verde. Responda SEMPRE em Português de Cabo Verde (simples, amigável e com calor humano).

## SOBRE O KANTINHO DELÍCIA
- Localização: Praia, Cabo Verde
- Especialidade: Pizzas artesanais premium feitas com ingredientes frescos
- Contato WhatsApp: +238 599 9204

## CARDÁPIO COMPLETO

### 🍕 PIZZAS
| Nome | Familiar | Médio | Pequena |
|---|---|---|---|
| MARGUERITA | 800$ | 750$ | 500$ |
| 4 QUEIJOS | 950$ | 850$ | 650$ |
| LINGUIÇA E QUEIJO DE TERRA | 900$ | 850$ | 600$ |
| ESPECIAL DA CASA (Bacon, Cogumelo, Nata, Queijo) | 900$ | 850$ | 650$ |
| MARISCO | 1200$ | 1000$ | - |
| CAMARÃO | 1200$ | 1000$ | - |
| MADÁ (Queijo, Chouriço, Bacon, Camarão, Ananás) | 1500$ | - | - |
| CALZONE (Frango ou Chouriço/Presunto, Cogumelo, Atum) | 850$ | - | - |
| FIAMBRE | 850$ | 800$ | 600$ |
| FRANGO | 850$ | 850$ | 600$ |
| CHOURIÇO | 850$ | 800$ | 550$ |
| BACON | 850$ | 800$ | 550$ |
| PRESUNTO | 850$ | 800$ | 550$ |
| CARNE MOÍDA | 900$ | 850$ | 600$ |
| ATUM | 900$ | 850$ | 650$ |
| VEGETARIANO | 900$ | 850$ | 600$ |
| QUATRO ESTAÇÕES | 1000$ | 850$ | - |
| TROPICAL | 900$ | 850$ | 600$ |

### 🥤 BEBIDAS
- ÁGUA (500ml): 100$
- COCA-COLA (330ml): 300$
- SUMO NATURAL: 200$

### ➕ EXTRAS
- Queijo Extra: +100$
- Bacon Extra: +150$
- Ananás: +100$
- Cogumelo: +100$
- Camarão: +300$

## 🚗 ZONAS DE ENTREGA
- Terra Branca: 50$ (15-25 min)
- Tira Chapéu: 100$ (15-25 min)
- Bela Vista: 150$ (20-30 min)
- Plateau: 200$ (25-35 min)
- Palmarejo: 250$ (30-40 min)
- Retirada no balcão: GRÁTIS

## 🎮 PROGRAMA DE FIDELIDADE (SABOR COINS)
- BRONZE: 10% cashback, Acesso ao Arcade
- PRATA: 15% cashback, Entrega prioritária
- OURO: 20% cashback, Entrega grátis até 5km
- DIAMANTE: 25% cashback, Pizza grátis a cada 10 pedidos

## INSTRUÇÕES
- Seja sempre simpático, animado e use emojis 🍕
- Quando o cliente perguntar o preço, confirme o tamanho que eles querem
- Se o cliente perguntar como pedir, diga para usar o botão do carrinho no site ou WhatsApp
- Se perguntar sobre horário, diga para contatar pelo WhatsApp
- Nunca invente informações que não estão neste manual
- Para questões sobre o pedido em andamento, peça para o cliente verificar com a cozinha via WhatsApp`;

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o Pizza Bot do Kantinho Delícia 🍕 Posso ajudar com o nosso cardápio, preços, zonas de entrega ou qualquer dúvida! Como posso ajudar?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    const currentInput = input;
    setInput('');
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Kantinho Delícia Premium'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-lite-preview-02-05:free',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: currentInput }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.error("OpenRouter API Error:", data.error);
        throw new Error(data.error.message || 'Erro na API');
      }

      const assistantText = data.choices?.[0]?.message?.content || 'Desculpa, não entendi. 🍕';
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: assistantText
      }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Ops! Problema de conexão: ${err.message || 'Tente novamente em instantes'}. 🍕`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-[110px] right-4 md:right-6 w-[calc(100vw-2rem)] max-w-sm z-[400] flex flex-col h-[480px] bg-slate-950 border border-slate-800 rounded-[32px] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.7)] animate-in slide-in-from-bottom-8 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center gap-3 p-5 bg-slate-900 border-b border-slate-800 flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/50">
                <span className="text-xl">🍕</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-white">Pizza Bot</p>
              <p className="text-[10px] font-bold text-emerald-500">Online • Kantinho Delícia</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-500 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-red-600/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 border border-red-500/20">
                    <span className="text-sm">🍕</span>
                  </div>
                )}
                <div className={`max-w-[80%] px-4 py-3 rounded-[20px] text-sm font-medium leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-red-600 text-white rounded-tr-sm'
                    : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 bg-red-600/20 rounded-xl flex items-center justify-center border border-red-500/20">
                  <span className="text-sm">🍕</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-[20px] rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:0s]"></div>
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex-shrink-0">
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 focus-within:border-red-600 transition-colors">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Qual é a vossa pizza mais…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 outline-none font-medium"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 bg-red-600 hover:bg-red-500 disabled:opacity-30 rounded-xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[9px] text-slate-600 text-center mt-2 font-bold uppercase tracking-widest">Powered by OpenRouter AI</p>
          </div>
        </div>
      )}

      {/* Bubble Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-[110px] right-4 md:right-6 z-[390] w-14 h-14 bg-red-600 hover:bg-red-500 rounded-[20px] flex items-center justify-center shadow-2xl shadow-red-900/60 transition-all hover:scale-110 active:scale-95"
        style={{ bottom: isOpen ? undefined : '110px' }}
      >
        {isOpen ? (
          <ChevronDown className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                <span className="text-[8px] font-black text-black">1</span>
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
};

export default ChatBot;
