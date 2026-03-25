import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';

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
            
            const newUser: User = {
                name,
                phone,
                level: 'PRATA',
                points: 0,
                ordersCount: 0
            };
            setUser(newUser);
            localStorage.setItem('kd_user', JSON.stringify(newUser));
            return { error: null };
        } catch (error) {
            return { error };
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
