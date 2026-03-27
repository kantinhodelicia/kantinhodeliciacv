
import { Product, DeliveryZone, Extra } from './types';

export interface ExtendedProduct extends Product {
  isPopular?: boolean;
  isChefChoice?: boolean;
  image?: string;
}

export const PIZZAS: ExtendedProduct[] = [
  { 
    id: '1', 
    name: "MARGUERITA", 
    description: "Queijo mussarela, gouda, orégano e molho tomate", 
    prices: { FAMILIAR: 800, MEDIO: 750, PEQ: 500 }, 
    category: 'PIZZAS', 
    isPopular: true,
    image: "https://media.istockphoto.com/id/500291118/photo/delicious-mozzarella-pizza-slice-on-white-background.jpg?s=612x612&w=0&k=20&c=WlQo8-Tv3b7ll98Q5IhN0y-FMquldRvggyC0qHFsrDE="
  },
  { 
    id: '2', 
    name: "4 QUEIJOS", 
    description: "Queijo mussarela, queijo azul, edem e fogo e molho tomate", 
    prices: { FAMILIAR: 950, MEDIO: 850, PEQ: 650 }, 
    category: 'PIZZAS', 
    isChefChoice: true,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600"
  },
  { 
    id: '8', 
    name: "LINGUIÇA E QUEIJO DE TERRA", 
    description: "Linguiça, queijo da terra e molho tomate", 
    prices: { FAMILIAR: 900, MEDIO: 850, PEQ: 600 }, 
    category: 'PIZZAS', 
    isChefChoice: true,
    image: "https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&q=80&w=600"
  },
  { 
    id: '12', 
    name: "ESPECIAL DA CASA", 
    description: "Bacon, cogumelo, nata, queijo, molho tomate", 
    prices: { FAMILIAR: 900, MEDIO: 850, PEQ: 650 }, 
    category: 'PIZZAS', 
    isPopular: true,
    image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=600"
  },
  { 
    id: '15', 
    name: "MARISCO", 
    description: "Marisco, queijo, molho tomate", 
    prices: { FAMILIAR: 1200, MEDIO: 1000 }, 
    category: 'PIZZAS', 
    isChefChoice: true,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600"
  },
  { id: '16', name: "CAMARÃO", description: "Camarão, queijo, molho tomate", prices: { FAMILIAR: 1200, MEDIO: 1000 }, category: 'PIZZAS', isChefChoice: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600" },
  { id: '17', name: "MADÁ", description: "Queijo, molho tomate, chouriço, bacon, camarão e ananás", prices: { FAMILIAR: 1500 }, category: 'PIZZAS', isPopular: true, image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=600" },
  { id: '18', name: "CALZONE", description: "Frango ou Chouriço/Presunto, Cogumelo, Atum e Cebola", prices: { FAMILIAR: 850 }, category: 'PIZZAS', image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600" },
  { id: '3', name: "FIAMBRE", description: "Fiambre, Queijo e molho tomate", prices: { FAMILIAR: 850, MEDIO: 800, PEQ: 600 }, category: 'PIZZAS', image: "https://images.unsplash.com/photo-1511688855354-934c9c4033c5?auto=format&fit=crop&q=80&w=600" },
  { id: '4', name: "FRANGO", description: "Frango, queijo, molho tomate", prices: { FAMILIAR: 850, MEDIO: 850, PEQ: 600 }, category: 'PIZZAS', isPopular: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600" },
  { id: '5', name: "CHOURIÇO", description: "Chouriço Queijo e molho tomate", prices: { FAMILIAR: 850, MEDIO: 800, PEQ: 550 }, category: 'PIZZAS', image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxfWrWzOZhAIMz9Gb4x18ESYS-dzxmFf_U2w&s" },
  { id: '6', name: "BACON", description: "Bacon, queijo, molho tomate", prices: { FAMILIAR: 850, MEDIO: 800, PEQ: 550 }, category: 'PIZZAS', isPopular: true, image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=600" },
  { id: '7', name: "PRESUNTO", description: "Presunto, queijo, molho tomate", prices: { FAMILIAR: 850, MEDIO: 800, PEQ: 550 }, category: 'PIZZAS', image: "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&q=80&w=600" },
  { id: '9', name: "CARNE MOÍDA", description: "Carne moída, queijo e molho tomate", prices: { FAMILIAR: 900, MEDIO: 850, PEQ: 600 }, category: 'PIZZAS', image: "https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&q=80&w=600" },
  { id: '10', name: "ATUM", description: "Atum, cebola, queijo, molho tomate", prices: { FAMILIAR: 900, MEDIO: 850, PEQ: 650 }, category: 'PIZZAS', image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&q=80&w=600" },
  { id: '11', name: "VEGETARIANO", description: "Cebola, tomate, pimentão, cogumelo, queijo, molho tomate", prices: { FAMILIAR: 900, MEDIO: 850, PEQ: 600 }, category: 'PIZZAS', image: "https://images.unsplash.com/photo-1571091718767-18b5c1457add?auto=format&fit=crop&q=80&w=600" },
  { id: '13', name: "QUATRO ESTAÇÕES", description: "Queijo, molho tomate, cogumelo, fiambre, chouriço e atum", prices: { FAMILIAR: 1000, MEDIO: 850 }, category: 'PIZZAS', image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600" },
  { id: '14', name: "TROPICAL", description: "Frutas da época, queijo, molho tomate", prices: { FAMILIAR: 900, MEDIO: 850, PEQ: 600 }, category: 'PIZZAS', image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600" }
];

export const DRINKS: ExtendedProduct[] = [
  { id: 'd1', name: "ÁGUA", description: "Água mineral 500ml", prices: { UN: 100 }, category: 'BEBIDAS', isPopular: true, image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=600" },
  { id: 'd2', name: "COCA-COLA", description: "Lata 330ml original", prices: { UN: 300 }, category: 'BEBIDAS', isPopular: true, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600" },
  { id: 'd5', name: "SUMO NATURAL", description: "Feito na hora com frutas da época", prices: { UN: 200 }, category: 'BEBIDAS', isChefChoice: true, image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=600" }
];

export const ZONES: DeliveryZone[] = [
  { id: 'z1', name: "Terra Branca", price: 50, time: "15-25 min" },
  { id: 'z2', name: "Tira Chapéu", price: 100, time: "15-25 min" },
  { id: 'z3', name: "Bela Vista", price: 150, time: "20-30 min" },
  { id: 'z17', name: "Plateau", price: 200, time: "25-35 min" },
  { id: 'z28', name: "Palmarejo", price: 250, time: "30-40 min" }
];

export const EXTRAS: Extra[] = [
  { name: "Queijo Extra", price: 100 },
  { name: "Bacon Extra", price: 150 },
  { name: "Ananás", price: 100 },
  { name: "Cogumelo", price: 100 },
  { name: "Camarão", price: 300 }
];
