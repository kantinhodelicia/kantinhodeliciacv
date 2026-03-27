import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (name: string, email: string) => Promise<{ error: any }>;
    signInWithGoogle: () => Promise<void>;
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

    const syncProfile = async (userId: string, email?: string, name?: string) => {
        try {
            // 1. Tentar carregar perfil existente
            let { data: profile, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();
            
            // 2. Se não existir, criar (Garante que Google e Email novos funcionem)
            if (!profile || fetchError) {
                const finalName = name || email?.split('@')[0] || 'Cliente';
                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert([{ 
                        name: finalName, 
                        email: email, 
                        user_id: userId, 
                        level: 'BRONZE' 
                    }])
                    .select()
                    .single();
                
                if (insertError) {
                    console.error("Erro ao criar perfil no sync:", insertError);
                    return;
                }
                profile = newProfile;
            }

            if (profile) {
                setUser({
                    name: profile.name,
                    phone: profile.phone,
                    level: profile.level as any,
                    points: profile.points || 0,
                    ordersCount: profile.orders_count || 0,
                    isAdmin: profile.is_admin || false
                });
            }
        } catch (e) {
            console.error("Critical Profile Sync Error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Estado inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                syncProfile(session.user.id, session.user.email);
            } else {
                setLoading(false);
            }
        });

        // Listener Global de Auth (Resolve Race Conditions)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await syncProfile(session.user.id, session.user.email, session.user.user_metadata?.full_name);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (name: string, email: string) => {
        try {
            if (!name || !email) throw new Error('Nome e email obrigatórios');
            setLoading(true);

            // 1. Tentar Login
            let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password: DEFAULT_PASSWORD,
            });

            // 2. Se a conta não existir, cria
            if (authError && (authError.message.includes('Invalid') || authError.status === 400)) {
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password: DEFAULT_PASSWORD,
                    options: { data: { full_name: name } }
                });
                if (signUpError) throw signUpError;
                authData = signUpData;
            } else if (authError) {
                throw authError;
            }

            // O Listener onAuthStateChange detetará o session e chamará syncProfile automaticamente.
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

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        });
    };

    return <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signOut }}>{children}</AuthContext.Provider>;
};
