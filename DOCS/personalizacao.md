# Personalização - Kantinho Delícia

## Opções de Personalização

### 1. Cores do Tema
- Cor principal (vermelho): `#dc2626`
- Cor de fundo (escuro): `#020617`
- Cor de destaque (amarelo): `#eab308`

### 2. Logo e Ícones
- Ícone atual: Pizza (Flaticon)
- Tamanhos: 192x192 e 512x512

### 3. Textos
- Título: "KANTINHO DELÍCIA"
- Subtítulo: "Artesanal & Premium"
- Descrição: "A melhor pizza artesanal de Praia, Cabo Verde"

### 4. Imagens
- Background: Unsplash (pizza)
- Produtos: Unsplash (pizzas e bebidas)

---

## Arquivos para Personalizar

### index.html
- Título da página
- Meta tags
- Fontes

### manifest.json
- Nome do app
- Ícones
- Cores do tema

### components/Header.tsx
- Título principal
- Subtítulo
- Layout do cabeçalho

### constants.tsx
- Imagens dos produtos
- Descrições
- Preços

---

## Como Alterar

### 1. Cores
```css
/* No index.html, altere: */
<meta name="theme-color" content="#dc2626">

/* No manifest.json, altere: */
"theme_color": "#dc2626",
"background_color": "#020617"
```

### 2. Logo
```json
// No manifest.json, altere:
"icons": [
  {
    "src": "https://seudominio.com/logo-192.png",
    "sizes": "192x192",
    "type": "image/png"
  }
]
```

### 3. Título
```html
<!-- No index.html, altere: -->
<title>Kantinho Delícia - Pizzaria Premium</title>
```

### 4. Header
```tsx
// No Header.tsx, altere:
<h1 className="...">
  KANTINHO <span className="text-red-600">DELÍCIA</span>
</h1>
```

---

## Sugestões de Personalização

### Cores Alternativas
- Azul: `#2563eb`
- Verde: `#16a34a`
- Laranja: `#ea580c`
- Roxo: `#9333ea`

### Fontes Alternativas
- Playfair Display (elegante)
- Montserrat (moderna)
- Roboto (neutra)

### Estilos de Header
- Minimalista (sem imagem de fundo)
- Gradiente (cores em vez de imagem)
- Vídeo (loop de vídeo)

---

## Ferramentas Úteis

### Cores
- Coolors: https://coolors.co
- Adobe Color: https://color.adobe.com

### Fontes
- Google Fonts: https://fonts.google.com
- Font Squirrel: https://fontsquirrel.com

### Ícones
- Flaticon: https://flaticon.com
- Lucide: https://lucide.dev
- Heroicons: https://heroicons.com

### Imagens
- Unsplash: https://unsplash.com
- Pexels: https://pexels.com
- Pixabay: https://pixabay.com

---

## Exemplo de Personalização Completa

### Tema Azul
```css
/* Cores */
primary: #2563eb
background: #0f172a
accent: #3b82f6
```

### Tema Verde
```css
/* Cores */
primary: #16a34a
background: #052e16
accent: #22c55e
```

### Tema Laranja
```css
/* Cores */
primary: #ea580c
background: #431407
accent: #f97316
```

---

## Próximos Passos

1. Escolher estilo desejado
2. Alterar cores no CSS
3. Atualizar logo/ícones
4. Modificar textos
5. Testar visualização
6. Deploy das alterações
