import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string) => Promise<{ error: any }>;
    verifyOtp: (email: string, token: string, name?: string) => Promise<{ error: any }>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};


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
                const pendingName = localStorage.getItem('kd_pending_name');
                const finalName = name || pendingName || email?.split('@')[0] || 'Cliente';
                localStorage.removeItem('kd_pending_name');
                
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
        // Timeout de segurança: Se o Supabase não responder em 5 seg, destrancamos a UI
        const safetyTimeout = setTimeout(() => {
            console.warn("Auth sync timeout reached. Unlocking UI.");
            setLoading(false);
        }, 5000);

        // Estado inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                syncProfile(session.user.id, session.user.email);
            } else {
                setLoading(false);
            }
            clearTimeout(safetyTimeout);
        }).catch(() => {
            setLoading(false);
            clearTimeout(safetyTimeout);
        });

        // Listener Global de Auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await syncProfile(session.user.id, session.user.email, session.user.user_metadata?.full_name);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
            clearTimeout(safetyTimeout);
        };
    }, []);

    const signIn = async (email: string) => {
        try {
            if (!email) throw new Error('Email obrigatório');
            setLoading(true);

            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin,
                }
            });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error("Erro no signIn OTP:", error);
            return { error };
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (email: string, token: string, name?: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'signup', // Tenta signup primeiro, se falhar tenta magiclink/login
            });

            let finalError = error;
            if (error && error.message.includes('Token has expired or is invalid')) {
                 // Try login type if signup fails
                 const { data: loginData, error: loginError } = await supabase.auth.verifyOtp({
                    email,
                    token,
                    type: 'magiclink',
                });
                finalError = loginError;
            }

            if (finalError) throw finalError;

            // Se for novo usuário e tivermos o nome, o syncProfile cuidará disso via onAuthStateChange
            // mas podemos forçar o nome no localStorage para o syncProfile pegar.
            if (name) {
                localStorage.setItem('kd_pending_name', name);
            }

            return { error: null };
        } catch (error) {
            console.error("Erro no verifyOtp:", error);
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

    const value = React.useMemo(() => ({
        user,
        loading,
        signIn,
        verifyOtp,
        signInWithGoogle,
        signOut
    }), [user, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
