import React, { useState } from 'react';
import { User, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
    const { signIn } = useAuth();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error: signInError } = await signIn(name, phone);

        if (signInError) {
            setError(signInError.message || 'Erro ao entrar. Tente novamente.');
            setLoading(false);
        }
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

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[40px] p-8 shadow-2xl">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8 text-center">
                        Informar Dados
                    </h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Name Input */}
                    <div className="mb-6">
                        <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3">
                            Seu Nome
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

                    {/* Phone Input */}
                    <div className="mb-8">
                        <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3">
                            Número de Telemóvel
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-red-600 transition-colors"
                                placeholder="991234567"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-red-900/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                    >
                        {loading ? 'A Entrar...' : 'Acessar Loja'}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
