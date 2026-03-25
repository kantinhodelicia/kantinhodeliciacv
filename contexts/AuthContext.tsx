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
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('kd_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }
        setLoading(false);
    }, []);

    const signIn = async (name: string, phone: string) => {
        try {
            if (!name || !phone) throw new Error('Nome e telefone são obrigatórios');
            setLoading(true);
            
            // Consultar se o telefone já existe
            let { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('phone', phone)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (!profile) {
                // Cadastrar novo perfil
                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert([{ name, phone, level: 'BRONZE', points: 0, orders_count: 0 }])
                    .select()
                    .single();
                
                if (insertError) throw insertError;
                profile = newProfile;
            }

            const activeUser: User = {
                name: profile.name,
                phone: profile.phone,
                level: profile.level as any,
                points: profile.points,
                ordersCount: profile.orders_count,
                isAdmin: profile.is_admin
            };

            setUser(activeUser);
            localStorage.setItem('kd_user', JSON.stringify(activeUser));
            return { error: null };
        } catch (error) {
            console.error("Erro no signIn Supabase:", error);
            return { error };
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setUser(null);
        localStorage.removeItem('kd_user');
    };

    const value = {
        user,
        loading,
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
