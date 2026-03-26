import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (name: string, phone: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

// Segredo interno da app para login automático (Free Auth Mapping)
const DEFAULT_PASSWORD = 'KantinhoSecure2026!';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = async (userId: string) => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();
            
            if (profile) {
                setUser({
                    name: profile.name,
                    phone: profile.phone,
                    level: profile.level as any,
                    points: profile.points,
                    ordersCount: profile.orders_count,
                    isAdmin: profile.is_admin
                });
            }
        } catch (e) {
            console.error("Failed to load profile", e);
        }
    };

    useEffect(() => {
        // Fetch current session silenciosa
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Ouvir realtime auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (name: string, phone: string) => {
        try {
            if (!name || !phone) throw new Error('Nome e telefone obrigatórios');
            setLoading(true);

            // Mapeamento Oculto para Supabase Auth Native (sem custos SMS)
            const fakeEmail = `${phone.replace(/\D/g, '')}@kantinhodelicia.cv`;

            // 1. Tentar fazer Login
            let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: fakeEmail,
                password: DEFAULT_PASSWORD,
            });

            // 2. Se a conta não existir (Invalid credentials), cria e loga o utilizador
            if (authError && (authError.message.includes('Invalid') || authError.status === 400 || authError.name === 'AuthApiError')) {
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email: fakeEmail,
                    password: DEFAULT_PASSWORD,
                });
                
                if (signUpError) throw signUpError;
                authData = signUpData;
            } else if (authError) {
                throw authError; // Outros erros sérios
            }

            if (!authData.session) throw new Error("Por favor, desative o 'Confirm Email' no Painel Supabase nas opções Autenticação -> Providers -> Email.");

            const userId = authData.session.user.id;

            // 3. Garantir Perfil na tabela de negócio (agora com permissões graças ao RLS auth.uid())
            let { data: profile } = await supabase.from('profiles').select('*').eq('user_id', userId).single();

            if (!profile) {
                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert([{ name, phone, user_id: userId, level: 'BRONZE' }])
                    .select()
                    .single();
                
                if (insertError) throw insertError;
                profile = newProfile;
            } else if (profile.name !== name) {
                // Atualizar o nome se o cliente mudou
                await supabase.from('profiles').update({ name }).eq('user_id', userId);
            }

            // O onAuthStateChange preenche o Context
            return { error: null };
        } catch (error) {
            console.error("Erro no Free Auth signIn:", error);
            return { error };
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
};
