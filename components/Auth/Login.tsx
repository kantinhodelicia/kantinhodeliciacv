import React, { useState } from 'react';
import { User, Phone, ArrowRight, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
    const { requestOtp, verifyOtp } = useAuth();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'request' | 'verify'>('request');

    const formatPhone = (val: string) => {
        const numbers = val.replace(/\D/g, '');
        return numbers;
    };

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Se o número não tiver DDI de Cabo Verde, assumimos +238 por defeito.
        const e164Phone = phone.startsWith('238') ? `+${phone}` : `+238${phone}`;

        const { error: reqError } = await requestOtp(e164Phone);
        if (reqError) {
            setError(reqError.message || 'Erro ao enviar SMS de verificação.');
            setLoading(false);
        } else {
            setStep('verify');
            setLoading(false);
            setError('');
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const e164Phone = phone.startsWith('238') ? `+${phone}` : `+238${phone}`;

        const { error: verifyErr } = await verifyOtp(name, e164Phone, token);
        if (verifyErr) {
            setError(verifyErr.message || 'Código SMS inválido.');
            setLoading(false);
        }
        // Se sucesso, AuthContext.onAuthStateChange redireciona automaticamente!
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-10">
                    <div className="inline-block bg-gradient-to-br from-red-600 to-orange-600 p-6 rounded-[32px] mb-6 shadow-2xl shadow-red-900/40">
                        <div className="text-5xl font-black text-white">🍕</div>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-2">
                        Kantinho <span className="text-red-600">Delícia</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-black uppercase tracking-widest">
                        Premium Experience
                    </p>
                </div>

                {step === 'request' ? (
                <form onSubmit={handleRequest} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[40px] p-8 shadow-2xl">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8 text-center">
                        Informar Dados
                    </h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3">
                            Seu Nome Exato
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-red-600 transition-colors"
                                placeholder="João Silva"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3">
                            Número de Telemóvel
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(formatPhone(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-red-600 transition-colors"
                                placeholder="9912345"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-red-900/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                    >
                        {loading ? 'A Enviar Cód...' : 'Receber Código SMS'}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>
                ) : (
                <form onSubmit={handleVerify} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[40px] p-8 shadow-2xl animate-in fade-in slide-in-from-right-8">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2 text-center">
                        Código de Segurança
                    </h2>
                    <p className="text-center text-slate-400 text-sm mb-8">
                        Enviado por SMS para +238 {phone}
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div className="mb-8">
                        <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 text-center">
                            Código SMS (6 Dígitos)
                        </label>
                        <div className="relative">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                maxLength={6}
                                value={token}
                                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white text-center text-xl tracking-[0.5em] font-black outline-none focus:border-red-600 transition-colors"
                                placeholder="123456"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || token.length < 6}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-green-900/40 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                    >
                        {loading ? 'A Verificar...' : 'Confirmar e Entrar'}
                        {!loading && <CheckCircle2 className="w-5 h-5" />}
                    </button>

                    <button
                        type="button"
                        onClick={() => setStep('request')}
                        className="w-full mt-4 text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest py-3 transition-colors"
                    >
                        Alterar Número
                    </button>
                </form>
                )}
            </div>
        </div>
    );
};

export default Login;
