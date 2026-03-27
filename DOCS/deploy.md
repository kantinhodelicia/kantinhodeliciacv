# Deploy - Kantinho Delícia

## Opções de Deploy

### 1. Vercel (Recomendado)
- Gratuito para projetos pessoais
- SSL automático
- Deploy automático via Git
- Domínio personalizado disponível

### 2. Netlify
- Alternativa ao Vercel
- Mesmas funcionalidades
- Interface diferente

### 3. GitHub Pages
- Gratuito
- Limitado a sites estáticos
- Sem suporte a serverless

---

## Deploy no Vercel

### Pré-requisitos
1. Conta no Vercel (https://vercel.com)
2. Node.js instalado
3. Git instalado

### Passo 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Passo 2: Login no Vercel
```bash
vercel login
```
- Escolha "Continue with GitHub" ou "Continue with Email"
- Siga as instruções no navegador

### Passo 3: Deploy da Aplicação
```bash
vercel
```

### Passo 4: Configurar Projeto
- **Set up and deploy?** → `Y`
- **Which scope?** → Selecione sua conta
- **Link to existing project?** → `N`
- **What's your project's name?** → `kantinho-delicia`
- **In which directory is your code located?** → `./`
- **Want to modify settings?** → `N`

### Passo 5: Aguardar Deploy
- O Vercel fará o build automaticamente
- Receberá uma URL como: `https://kantinho-delicia.vercel.app`

### Passo 6: Configurar Variáveis de Ambiente
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Passo 7: Redeploy com Variáveis
```bash
vercel --prod
```

---

## Deploy via GitHub (Automático)

### Passo 1: Criar Repositório no GitHub
1. Acesse https://github.com
2. Clique em "New repository"
3. Nome: `kantinho-delicia`
4. Público ou Privado
5. Clique em "Create repository"

### Passo 2: Push do Código
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seuusuario/kantinho-delicia.git
git push -u origin main
```

### Passo 3: Conectar ao Vercel
1. Acesse https://vercel.com/dashboard
2. Clique em "Add New..."
3. Selecione "Project"
4. Importe o repositório `kantinho-delicia`
5. Clique em "Deploy"

### Passo 4: Configurar Variáveis de Ambiente
1. Vá em "Settings" → "Environment Variables"
2. Adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Passo 5: Deploy Automático
- A cada `git push`, o Vercel fará deploy automático

---

## Deploy no Netlify

### Passo 1: Instalar Netlify CLI
```bash
npm install -g netlify-cli
```

### Passo 2: Login no Netlify
```bash
netlify login
```

### Passo 3: Deploy da Aplicação
```bash
netlify deploy --prod
```

### Passo 4: Configurar Projeto
- **Create & configure a new site** → `Y`
- **Team** → Selecione sua conta
- **Site name** → `kantinho-delicia`
- **Publish directory** → `dist`
- **Build command** → `npm run build`

### Passo 5: Configurar Variáveis de Ambiente
```bash
netlify env:set VITE_SUPABASE_URL "https://ltzwfrysfcoewykhmabk.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0endmcnlzZmNvZXd5a2htYWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMjQ3ODYsImV4cCI6MjA4OTYwMDc4Nn0.klArTVavnHca1BgayY87Q4fRSL_7lrfcHOAMp_la06U"
```

---

## Variáveis de Ambiente Necessárias

| Variável | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://ltzwfrysfcoewykhmabk.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0endmcnlzZmNvZXd5a2htYWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMjQ3ODYsImV4cCI6MjA4OTYwMDc4Nn0.klArTVavnHca1BgayY87Q4fRSL_7lrfcHOAMp_la06U` |

---

## Verificação Pós-Deploy

### 1. Acessar a Aplicação
- Vercel: `https://kantinho-delicia.vercel.app`
- Netlify: `https://kantinho-delicia.netlify.app`

### 2. Testar Funcionalidades
- Login com admin@kantinho.com
- Visualizar produtos
- Adicionar itens ao carrinho
- Selecionar pagamento
- Enviar pedido via WhatsApp

### 3. Verificar PWA
- Instalar como app
- Testar offline
- Verificar ícones

---

## Troubleshooting

### Erro de Build
```bash
# Verificar logs
vercel logs

# Redeploy
vercel --prod
```

### Variáveis de Ambiente não funcionam
```bash
# Verificar variáveis
vercel env ls

# Adicionar novamente
vercel env add VITE_SUPABASE_URL
```

### Erro 404
- Verificar `vercel.json`
- Verificar configuração de rewrites

### SSL não funciona
- Aguardar alguns minutos
- Verificar configuração de domínio

---

## Comandos Úteis

### Vercel
```bash
# Listar projetos
vercel projects ls

# Verificar status
vercel status

# Ver logs
vercel logs

# Remover projeto
vercel remove
```

### Netlify
```bash
# Listar sites
netlify sites:list

# Verificar status
netlify status

# Ver logs
netlify logs

# Remover site
netlify sites:delete
```

---

## Próximos Passos

1. **Escolher plataforma** (Vercel ou Netlify)
2. **Criar conta** na plataforma escolhida
3. **Instalar CLI** da plataforma
4. **Fazer login** na conta
5. **Deploy da aplicação**
6. **Configurar variáveis de ambiente**
7. **Testar acesso**
8. **Configurar domínio personalizado** (opcional)

---

## Links Úteis

### Vercel
- Dashboard: https://vercel.com/dashboard
- Documentação: https://vercel.com/docs
- Suporte: https://vercel.com/support

### Netlify
- Dashboard: https://app.netlify.com
- Documentação: https://docs.netlify.com
- Suporte: https://netlify.com/support

### GitHub
- Repositório: https://github.com
- Documentação: https://docs.github.com
