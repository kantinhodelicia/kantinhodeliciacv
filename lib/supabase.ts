import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Authentication features will be disabled.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'kd_supabase_auth',
    },
});

// Database types
export interface Profile {
    id: string;
    name: string;
    phone: string;
    points: number;
    orders_count: number;
    level: 'BRONZE' | 'PRATA' | 'OURO' | 'DIAMANTE';
    is_admin: boolean;
    created_at: string;
    updated_at: string;
}

export interface Order {
    id: string;
    user_id: string;
    items: any[];
    total: number;
    status: 'RECEBIDO' | 'PREPARO' | 'PRONTO' | 'ENTREGUE' | 'CONCLUIDO' | 'CANCELADO';
    zone_name?: string;
    payment_method?: 'DINHEIRO' | 'CARTAO' | 'USDT';
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface ProductDB {
    id: string;
    name: string;
    description: string;
    prices: Record<string, number>;
    category: string;
    is_active: boolean;
    image?: string;
    created_at: string;
    updated_at: string;
}
