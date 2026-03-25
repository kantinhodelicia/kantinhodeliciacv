
import React, { useState, useRef, useEffect } from 'react';
import { X, Tv, Maximize, Play, Volume2, VolumeX, Volume1, Info, AlertTriangle, MessageCircle, Send, Heart, Users, Activity, Radio, ChefHat, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Hls from 'hls.js';

interface Props {
  streamUrl: string;
  scheduledStartTime?: string;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'chef';
  text: string;
  timestamp: string;
}

interface FloatingReaction {
  id: number;
  emoji: string;
  left: number;
}

const LiveModal: React.FC<Props> = ({ streamUrl, scheduledStartTime, onClose }) => {
  const [loadError, setLoadError] = useState(!streamUrl);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'chef', text: 'Bem-vindo ao Kantinho Live! O que vamos preparar hoje?', timestamp: 'Agora' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [viewers, setViewers] = useState(Math.floor(Math.random() * 40) + 12);
  
  // Audio states
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isYouTube = React.useMemo(() => {
    return streamUrl.includes('youtube.com') || streamUrl.includes('youtu.be');
  }, [streamUrl]);

  useEffect(() => {
    let hls: Hls | null = null;
    const video = videoRef.current;

    if (!isYouTube && video && streamUrl) {
      setLoadError(false);
      const isHlsUrl = streamUrl.toLowerCase().includes('.m3u8') || streamUrl.toLowerCase().includes('.m3u');

      if (Hls.isSupported() && isHlsUrl) {
        hls = new Hls({ startLevel: -1 });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsVideoReady(true);
          setIsBuffering(false);
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (e, data) => {
          if (data.fatal) {
            console.error('HLS error:', data);
            setLoadError(true);
          }
        });
      } else {
        video.src = streamUrl;
        video.load();
        video.onloadeddata = () => setIsVideoReady(true);
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [streamUrl, isYouTube]);

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&loop=1&playlist=${videoId}`;
  };

  // Sincronia de Master Clock (Otimizada)
  useEffect(() => {
    if (!scheduledStartTime || !isVideoReady || !videoRef.current) return;

    const syncWithClock = () => {
      const video = videoRef.current;
      if (!video || !video.duration || video.duration === Infinity || isBuffering) return;

      const startTime = new Date(scheduledStartTime).getTime();
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;

      if (elapsed > 0) {
        const targetTime = elapsed % video.duration;
        // Tolerância aumentada para 3s para evitar stuttering (travamentos de seek)
        if (Math.abs(video.currentTime - targetTime) > 3.0) {
          video.currentTime = targetTime;
          if (video.paused) video.play().catch(() => {});
        }
      }
    };

    const interval = setInterval(syncWithClock, 5000);
    return () => clearInterval(interval);
  }, [scheduledStartTime, isVideoReady, isBuffering]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const handleCanPlay = () => {
    if (videoRef.current && scheduledStartTime) {
      const startTime = new Date(scheduledStartTime).getTime();
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed > 0 && videoRef.current.duration) {
         videoRef.current.currentTime = elapsed % videoRef.current.duration;
      }
    }
    setIsVideoReady(true);
    setIsBuffering(false);
    videoRef.current?.play().catch(() => {});
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMsg = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { 
      role: 'user', 
      text: userMsg, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);

    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `O usuário disse: "${userMsg}". Responda como o Chef de Cozinha da Kantinho Delícia. Mantenha a resposta curta.`,
        config: {
            systemInstruction: "Você é o Chef da Kantinho Delícia. Carismático e amigável."
        }
      });

      setMessages(prev => [...prev, { 
        role: 'chef', 
        text: response.text || "Mamma mia!", 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } catch (error) {
      console.error("Gemini Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const triggerReaction = (emoji: string) => {
    const id = Date.now();
    setReactions(prev => [...prev, { id, emoji, left: Math.random() * 80 + 10 }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 3000);
  };

  const toggleFullScreen = () => {
    if (containerRef.current) {
      const elem = containerRef.current;
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if ((elem as any).webkitRequestFullscreen) (elem as any).webkitRequestFullscreen();
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-10">
      <div className="absolute inset-0 bg-black/98 backdrop-blur-2xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-7xl h-[85vh] bg-slate-950 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl flex flex-col lg:flex-row animate-in zoom-in duration-500">
        
        <div ref={containerRef} className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
          
          {/* Unmute Overlay (Solução para Falta de Som) */}
          {isMuted && isVideoReady && (
            <div className="absolute inset-0 z-[55] flex items-center justify-center pointer-events-none">
               <button 
                 onClick={() => setIsMuted(false)}
                 className="pointer-events-auto group bg-red-600 px-8 py-4 rounded-[32px] shadow-2xl animate-bounce hover:scale-105 transition-all flex items-center gap-3"
               >
                  <Volume2 className="w-8 h-8 text-white" />
                  <span className="text-xs font-black text-white uppercase tracking-widest">Ativar Som da Live</span>
               </button>
            </div>
          )}

          {/* Buffering Indicator */}
          {isBuffering && (
            <div className="absolute inset-0 z-[54] flex items-center justify-center bg-black/40 backdrop-blur-sm">
               <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
            </div>
          )}
          
          <div className="absolute inset-0 z-20 pointer-events-none p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="bg-red-600 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">AO VIVO</span>
                </div>
                <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-black text-white">{viewers}</span>
                </div>
              </div>

              <div className="flex flex-col items-end opacity-80">
                <h1 className="text-2xl md:text-3xl font-bold font-crimson text-white leading-none">
                  KANTINHO <span className="text-red-600">DELÍCIA</span>
                </h1>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-3 h-3 animate-pulse" /> SINAL ESTÁVEL
                </p>
                <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">Kitchen <span className="text-red-600">Master Feed</span></h4>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
            {reactions.map(r => (
              <div key={r.id} className="absolute bottom-0 text-4xl" style={{ left: `${r.left}%`, animation: 'float-up 3s ease-out forwards' }}>
                {r.emoji}
              </div>
            ))}
          </div>

          {!loadError ? (
            isYouTube ? (
              <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                 <iframe
                   src={getYouTubeEmbedUrl(streamUrl)}
                   title="YouTube"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   className="absolute w-[150%] h-[150%] object-cover pointer-events-none scale-110"
                   style={{ border: 'none' }}
                   onLoad={() => setIsVideoReady(true)}
                 />
              </div>
            ) : (
              <video 
                ref={videoRef}
                autoPlay 
                muted={isMuted}
                loop
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
                onCanPlay={handleCanPlay}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onError={() => {
                   if (!streamUrl.toLowerCase().includes('.m3u8') && !streamUrl.toLowerCase().includes('.m3u')) {
                       setLoadError(true);
                   }
                }}
              />
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-slate-950">
                <Radio className="w-20 h-20 text-slate-800 mb-4" />
                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Sem Sinal</h3>
            </div>
          )}

          <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-3 group pointer-events-auto">
            <div className="flex flex-col items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-2 py-4">
               <div className="h-24 w-10 relative flex items-center justify-center">
                  <input 
                    type="range" min="0" max="1" step="0.01" value={volume} 
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    className="absolute -rotate-90 w-20 appearance-none bg-slate-800 h-1.5 rounded-full"
                  />
               </div>
               <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-red-500">
                  {isMuted || volume === 0 ? <VolumeX /> : <Volume2 />}
               </button>
            </div>
            <button onClick={() => triggerReaction('🍕')} className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full text-xl hover:scale-110 transition-all">🍕</button>
            <button onClick={() => triggerReaction('❤️')} className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full text-xl hover:scale-110 transition-all">❤️</button>
          </div>
        </div>

        <div className="w-full lg:w-[400px] border-l border-white/5 bg-slate-900/30 backdrop-blur-3xl flex flex-col">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="w-7 h-7 text-red-500" />
              <h4 className="text-sm font-black text-white uppercase">Cozinha Digital</h4>
            </div>
            <div className="flex gap-2">
                <button onClick={toggleFullScreen} className="p-2.5 text-slate-500 hover:text-white"><Maximize className="w-5 h-5" /></button>
                <button onClick={onClose} className="p-2.5 text-slate-500 hover:text-red-500"><X className="w-6 h-6" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${m.role === 'user' ? 'bg-red-600 text-white rounded-tr-none' : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-white/5'}`}>
                  {m.text}
                </div>
                <span className="text-[9px] font-black text-slate-600 uppercase mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-2">
                <div className="max-w-[85%] p-5 rounded-3xl text-sm bg-slate-800/80 text-slate-200 rounded-tl-none border border-white/5 flex gap-2 w-20 justify-center">
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-[9px] font-black text-slate-600 uppercase mt-1 px-1">Chef está digitando...</span>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 border-t border-white/5 bg-black/20">
            <form onSubmit={handleSendMessage} className="relative">
              <input 
                type="text" value={inputText} onChange={e => setInputText(e.target.value)}
                placeholder="Pergunte algo ao Chef..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-5 pr-14 text-sm text-white focus:outline-none focus:border-red-600"
              />
              <button type="submit" disabled={isTyping} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-300px) rotate(20deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LiveModal;
