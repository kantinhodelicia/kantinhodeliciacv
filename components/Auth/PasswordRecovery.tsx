import React, { useState } from 'react';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PasswordRecoveryProps {
    onBack: () => void;
}

const PasswordRecovery: React.FC<PasswordRecoveryProps> = ({ onBack }) => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await resetPassword(email);

        if (error) {
            setError(error.message || 'Erro ao enviar email de recuperação');
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
                        Email Enviado!
                    </h2>
                    <p className="text-slate-400 mb-8">
                        Verifique sua caixa de entrada para redefinir sua senha.
                    </p>
                    <button
                        onClick={onBack}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-red-900/40 transition-all active:scale-[0.98] uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Voltar ao Login
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
                        <div className="text-5xl font-black text-white">🔑</div>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-2">
                        Recuperar <span className="text-red-600">Senha</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-black uppercase tracking-widest">
                        Enviaremos um link para seu email
                    </p>
                </div>

                {/* Recovery Form */}
                <form onSubmit={handleSubmit} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[40px] p-8 shadow-2xl">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="mb-8">
                        <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3">
                            Email da Conta
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

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-red-900/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm mb-4"
                    >
                        {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                    </button>

                    {/* Back Button */}
                    <button
                        type="button"
                        onClick={onBack}
                        className="w-full text-slate-400 hover:text-white font-bold py-4 transition-colors flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasswordRecovery;
