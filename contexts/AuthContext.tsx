import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    requestOtp: (phone: string) => Promise<{ error: any }>;
    verifyOtp: (name: string, phone: string, token: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

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
        // Fetch current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for realtime auth changes
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

    const requestOtp = async (phone: string) => {
        try {
            if (!phone) throw new Error('Telefone é obrigatório');
            setLoading(true);
            const { error } = await supabase.auth.signInWithOtp({ phone });
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error("Erro request OTP:", error);
            return { error };
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (name: string, phone: string, token: string) => {
        try {
            setLoading(true);
            const { data: { session }, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
            if (error) throw error;
            if (!session) throw new Error("Sessão não foi iniciada.");

            // Ensure profile exists for this secure auth.uid()
            let { data: profile } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single();

            if (!profile) {
                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert([{ name, phone, user_id: session.user.id, level: 'BRONZE' }])
                    .select()
                    .single();
                
                if (insertError) throw insertError;
                profile = newProfile;
            }

            return { error: null };
        } catch (error) {
            console.error("Erro verify OTP:", error);
            return { error };
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const value = { user, loading, requestOtp, verifyOtp, signOut };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
