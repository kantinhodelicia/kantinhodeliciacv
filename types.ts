
export type PizzaSize = 'FAMILIAR' | 'MEDIO' | 'PEQ';
export type DrinkSize = 'UN';

export interface Product {
  id: string;
  name: string;
  description: string;
  prices: Record<string, number>;
  category: string;
  isActive?: boolean;
  image?: string;
}

export interface Extra {
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  uniqueId: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  isHalfAndHalf?: boolean;
  leftHalf?: Product;
  rightHalf?: Product;
  extras: Extra[];
  needsBox: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  price: number;
  time: string;
}

export interface User {
  name: string;
  phone: string;
  points: number;
  ordersCount: number;
  level: 'BRONZE' | 'PRATA' | 'OURO' | 'DIAMANTE';
  isAdmin?: boolean;
}

export type OrderStatus = 'RECEBIDO' | 'PREPARO' | 'PRONTO' | 'ENTREGUE' | 'CONCLUIDO' | 'CANCELADO';

export interface SaleRecord {
  id: string;
  timestamp: number;
  total: number;
  itemsCount: number;
  itemsDetail: string; 
  items?: CartItem[];
  customerName: string;
  customerPhone?: string;
  zoneName?: string;
  status: OrderStatus;
  paymentMethod?: 'DINHEIRO' | 'CARTAO' | 'USDT';
  notes?: string;
}

export interface AppSettings {
  boxPrice: number;
  minOrder: number;
  deliveryZones: DeliveryZone[];
  streamUrl?: string;
}

export interface StoreSettings {
  id?: number;
  header_bg?: string;
  stream_url?: string;
  scheduled_start?: string;
  box_price: number;
  min_order: number;
  iptv_playlist?: any[];
  categories?: string[];
  zones?: any[];
  created_at?: string;
  updated_at?: string;
}
