import React, { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterProps {
    onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
    const { signUp } = useAuth();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);

        const { error } = await signUp(email, password, name, phone);

        if (error) {
            setError(error.message || 'Erro ao criar conta');
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[40px] p-8 shadow-2xl text-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">
                        Conta Criada!
                    </h2>
                    <p className="text-slate-400 mb-8">
                        Verifique seu email para confirmar sua conta e fazer login.
                    </p>
                    <button
                        onClick={onSwitchToLogin}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-red-900/40 transition-all active:scale-[0.98] uppercase tracking-widest text-sm"
                    >
                        Ir para Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-10">
                    <div className="inline-block bg-gradient-to-br from-red-600 to-orange-600 p-6 rounded-[32px] mb-6 shadow-2xl shadow-red-900/40">
                        <div className="text-5xl font-black text-white">🍕</div>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-2">
                        Criar <span className="text-red-600">Conta</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-black uppercase tracking-widest">
                        Junte-se ao Kantinho Delícia
                    </p>
                </div>

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[40px] p-8 shadow-2xl">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Name Input */}
                    <div className="mb-6">
                        <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3">
                            Nome Completo
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-red-600 transition-colors"
                                placeholder="Seu nome"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Phone Input */}
                    <div className="mb-6">
                        <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3">
                            Telefone
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-red-600 transition-colors"
                                placeholder="+238 XXX XX XX"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="mb-6">
                        <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-red-600 transition-colors"
                                placeholder="seu@email.com"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="mb-6">
                        <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3">
                            Senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-red-600 transition-colors"
                                placeholder="••••••••"
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="mb-8">
                        <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3">
                            Confirmar Senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-red-600 transition-colors"
                                placeholder="••••••••"
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-red-900/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                    >
                        {loading ? 'Criando Conta...' : 'Criar Conta'}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>

                    {/* Login Link */}
                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            Já tem uma conta?{' '}
                            <button
                                type="button"
                                onClick={onSwitchToLogin}
                                className="text-red-500 font-black hover:text-red-400 transition-colors"
                                disabled={loading}
                            >
                                Entrar
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
