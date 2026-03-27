import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (name: string, email: string) => Promise<{ error: any }>;
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

    const signIn = async (name: string, email: string) => {
        try {
            if (!name || !email) throw new Error('Nome e email obrigatórios');
            setLoading(true);

            // 1. Tentar Login com email real
            let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password: DEFAULT_PASSWORD,
            });

            // 2. Se a conta não existir, cria e loga o cliente
            if (authError && (authError.message.includes('Invalid') || authError.status === 400)) {
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password: DEFAULT_PASSWORD,
                });
                if (signUpError) throw signUpError;
                authData = signUpData;
            } else if (authError) {
                throw authError;
            }

            if (!authData.session) throw new Error("Desative o 'Confirm Email' no Painel Supabase → Authentication → Providers → Email.");

            const userId = authData.session.user.id;

            // 3. Garantir Perfil na tabela de negócio
            let { data: profile } = await supabase.from('profiles').select('*').eq('user_id', userId).single();

            if (!profile) {
                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert([{ name, email, user_id: userId, level: 'BRONZE' }])
                    .select()
                    .single();
                if (insertError) throw insertError;
                profile = newProfile;
            } else if (profile.name !== name) {
                await supabase.from('profiles').update({ name }).eq('user_id', userId);
            }

            return { error: null };
        } catch (error) {
            console.error("Erro no signIn:", error);
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
