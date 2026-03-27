# Configuração de Domínio Personalizado - Kantinho Delícia

## Opções de Domínio

### 1. Domínio Próprio (Recomendado)
- Exemplo: `kantinhodelicia.com` ou `kantinho.cv`
- Comprar em: Namecheap, GoDaddy, ou registrador local de Cabo Verde

### 2. Subdomínio Gratuito
- Exemplo: `kantinho.vercel.app` ou `kantinho.netlify.app`
- Incluído no deploy

---

## Passo a Passo - Vercel

### 1. Instalar Vercel CLI
```bash
npm install -g vercel
```

### 2. Login no Vercel
```bash
vercel login
```

### 3. Deploy da Aplicação
```bash
vercel
```

### 4. Adicionar Domínio Personalizado
```bash
vercel domains addseudominio.com
```

### 5. Configurar DNS
Adicione os seguintes registros DNS no seu provedor:

#### Para domínio raiz (ex: kantinhodelicia.com):
```
Tipo: A
Nome: @
Valor: 76.76.21.21
```

#### Para subdomínio (ex: www.kantinhodelicia.com):
```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
```

---

## Passo a Passo - Netlify (Alternativa)

### 1. Instalar Netlify CLI
```bash
npm install -g netlify-cli
```

### 2. Login no Netlify
```bash
netlify login
```

### 3. Deploy da Aplicação
```bash
netlify deploy --prod
```

### 4. Adicionar Domínio
```bash
netlify domains:addseudominio.com
```

### 5. Configurar DNS
```
Tipo: A
Nome: @
Valor: 75.2.60.5

Tipo: CNAME
Nome: www
Valor:seudominio.netlify.app
```

---

## Domínios Populares para Cabo Verde

### Registradores Locais:
- `.cv` - NIC.CV (https://nic.cv)
- Preço: ~5.000 CVE/ano

### Registradores Internacionais:
- Namecheap (https://namecheap.com)
- GoDaddy (https://godaddy.com)
- Google Domains (https://domains.google)

---

## Verificação

Após configurar o DNS, verifique:

```bash
# Verificar se o domínio está apontando corretamente
nsseudominio.com

# Verificar propagação DNS
digseudominio.com

# Testar a aplicação
curl -I httpsseudominio.com
```

---

## Troubleshooting

### DNS não propaga
- Aguarde até 48 horas para propagação completa
- Use https://dnschecker.org para verificar

### Erro SSL
- Vercel/Netlify geram SSL automaticamente
- Aguarde alguns minutos após configurar o domínio

### Redirect não funciona
- Verifique se o arquivo `vercel.json` está correto
- Verifique se o DNS está configurado corretamente

---

## Configurações Adicionais

### Forçar HTTPS (vercel.json)
```json
{
  "redirects": [
    {
      "source": "httpseudominio.com",
      "destination": "httpsseudominio.com",
      "permanent": true
    }
  ]
}
```

### Redirect www para não-www
```json
{
  "redirects": [
    {
      "source": "https://wwwseudominio.com",
      "destination": "httpsseudominio.com",
      "permanent": true
    }
  ]
}
```

---

## Contato de Suporte

- Vercel: https://vercel.com/support
- Netlify: https://netlify.com/support
- NIC.CV: https://nic.cv
