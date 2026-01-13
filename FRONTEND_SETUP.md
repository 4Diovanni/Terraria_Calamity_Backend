# 🎨 Frontend Setup - Terraria Calamity RPG

## 📋 Passo a Passo de Instalação

### 0️⃣ **Pré-requisitos**

Você precisa ter instalado:
- **Git** (https://git-scm.com)
- **Node.js + NPM** (https://nodejs.org) - versão 18+ recomendada

**Verificar instalação:**
```bash
node --version
npm --version
```

---

### 1️⃣ **Clone ou Atualize o Repositório**

```bash
# Se já tiver o repositório, atualize:
cd C:\Projetos\Terraria_Calamity_Backend
git pull origin main

# Se não tiver, clone:
git clone https://github.com/4Diovanni/Terraria_Calamity_Backend.git
cd Terraria_Calamity_Backend
```

---

### 2️⃣ **Navegue até o Frontend**

```bash
cd src/frontend
```

**Você deve estar em:** `C:\Projetos\Terraria_Calamity_Backend\src\frontend`

---

### 3️⃣ **Instale as Dependências**

```bash
npm install
```

⏳ **Primeira vez?** Pode levar 2-5 minutos. Aguarde!

**Dependências instaladas:**
- React 18.2
- TypeScript 5.3
- Vite 5.0 (bundler rápido)
- Tailwind CSS 3.3
- Axios 1.6 (HTTP client)
- React Router DOM 6.20

---

### 4️⃣ **Inicie o Servidor de Desenvolvimento**

```bash
npm run dev
```

**O que acontece:**
- Vite inicia o servidor na porta **5173**
- Automaticamente abre `http://localhost:5173` no navegador
- Hot Module Replacement (HMR) ativado (mudanças aparecem em tempo real)

✅ **Pronto! Você deve ver o site rodando com a página inicial!**

---

## 📁 Localização do Frontend

O frontend está localizado em:
```
src/frontend/
```

Esta estrutura permite que Backend e Frontend fiquem no mesmo repositório de forma organizada.

---

## ⚙️ **Variáveis de Ambiente**

Arquivo: `src/frontend/.env.local`

```env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=Terraria Calamity RPG
VITE_DEBUG=false
```

**Uso no código:**
```typescript
const API_URL = import.meta.env.VITE_API_URL;
const APP_NAME = import.meta.env.VITE_APP_NAME;
```

---

## 📂 **Estrutura de Pastas**

```
src/frontend/
├── src/
│   ├── assets/           # Imagens, ícones, estilos
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │
│   ├── components/       # Componentes reutilizáveis
│   │   ├── common/       # Header, Footer, Layout
│   │   ├── pages/        # Componentes de página
│   │   └── ui/           # Botões, cards, inputs
│   │
│   ├── hooks/            # Custom React hooks
│   │   ├── useWeapons.ts
│   │   ├── useFetch.ts
│   │   └── useApi.ts
│   │
│   ├── services/         # API communication
│   │   ├── weaponService.ts
│   │   ├── apiClient.ts
│   │   └── index.ts
│   │
│   ├── types/            # TypeScript types/interfaces
│   │   ├── weapon.ts
│   │   ├── api.ts
│   │   └── index.ts
│   │
│   ├── utils/            # Funções utilitárias
│   │   ├── formatting.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   │
│   ├── App.tsx           # Componente raiz
│   ├── main.tsx          # Ponto de entrada
│   └── index.css         # Estilos globais
│
├── index.html            # HTML principal
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── .env.local
```

---

## 🎨 Design System

### Paleta de Cores (Mystical Minimal)

```
Background:    bg-calamity-bg-dark      (#1a0f0f)
Secondary BG:  bg-calamity-bg-secondary (#2d1a1a)
Tertiary BG:   bg-calamity-bg-tertiary  (#3d2626)

Primary:       bg-calamity-primary      (#8b0000) - Vermelho sangue
Accent Purple: bg-calamity-accent-purple (#6a0dad) - Roxo ametista
Accent Gold:   bg-calamity-accent-gold  (#b8860b) - Dourado antigo
Accent Green:  bg-calamity-accent-green (#556b2f) - Verde musgo

Text Primary:   text-calamity-text-primary    (#e0d5d0)
Text Secondary: text-calamity-text-secondary  (#a89080)
Text Tertiary:  text-calamity-text-tertiary   (#6d5d50)
```

### Tipografia

```typescript
// Display (Títulos)
font-display: "Cinzel" ou "Cormorant Garamond"
font-weight: 600-700

// Body (Texto)
font-body: "Crimson Text" ou "Libre Baskerville"
font-weight: 400

// Accent (Labels)
font-accent: "Marcellus SC"
text-transform: uppercase
```

### Componentes Padrão

```typescript
// Button
<button className="
  px-6 py-3
  bg-calamity-primary hover:bg-calamity-primary-light
  text-calamity-text-primary
  border border-calamity-border
  rounded-none
  transition-all duration-800
  hover:shadow-mystical
">
  Click Me
</button>

// Card
<div className="
  bg-calamity-bg-secondary
  border border-calamity-border
  p-6
  shadow-mystical
  hover:shadow-mystical-lg transition-shadow duration-800
">
  Content
</div>

// Input
<input className="
  bg-transparent
  border-b border-calamity-border
  text-calamity-text-primary
  placeholder-calamity-text-tertiary
  focus:outline-none
  focus:border-calamity-primary
  transition-colors duration-300
" />
```

---

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev        # Inicia servidor dev

# Build
npm run build      # Compila para produção
npm run preview    # Visualiza build

# Lint
npm run lint       # Verifica erros de code style
```

---

## 📦 Build para Produção

```bash
# Na pasta src/frontend
npm run build

# Gera pasta dist/
# Pronto para deploy
```

---

## 🔗 Integração Backend ↔ Frontend

### CORS Configuration

Já está configurado no `SecurityConfig.java`:

```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:3000",
    "http://localhost:5173",  // Vite port
    "http://localhost:8000",
    "*"
));
```

### Proxy Configuration

No `vite.config.ts` já está configurado:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
}
```

Isso permite usar `/api` no frontend e ser redirecionado para backend.

---

## ✨ Animações e Transições

### Fade In
```html
<div class="animate-fade-in duration-800">
  Elemento
</div>
```

### Glow Effect
```html
<div class="shadow-mystical animate-glow">
  Elemento brilhante
</div>
```

### Slow Spin
```html
<div class="animate-slow-spin">
  Rotação lenta (60s)
</div>
```

---

## 🎓 Aprendizado

- **Vite**: Bundler super rápido para development
- **React Hooks**: useState, useEffect, useContext
- **TypeScript**: Type safety no JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **API Integration**: Como consumir REST APIs
- **Responsive Design**: Mobile-first approach

---

## 🚀 Próximos Passos

### Passo 1: Verificar se está rodando ✅
- Frontend deve estar em http://localhost:5173
- Backend deve estar em http://localhost:8080

### Passo 2: Página de Listagem de Armas
- [ ] Criar componente `WeaponList`
- [ ] Usar hook `useWeapons` para buscar dados
- [ ] Exibir armas em cards

### Passo 3: Filtros e Busca
- [ ] Adicionar filtros por elemento/classe/raridade
- [ ] Implementar busca por nome

### Passo 4: Página de Detalhes
- [ ] Criar página individual da arma
- [ ] Mostrar estatísticas completas

---

## 🆘 Troubleshooting

### Erro: "package.json not found"
**Solução:**
1. Certifique-se de estar em `src/frontend`
2. Execute `git pull origin main` para baixar os arquivos

### Erro: "Cannot find module 'react'"
**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Porta 5173 já está em uso
**Solução:** O Vite usa outra porta automaticamente, mas se quiser matar o processo:
```bash
# Windows PowerShell
Get-Process node | Stop-Process -Force
```

### Backend não conecta
**Verifique:**
- Backend rodando em http://localhost:8080
- CORS configurado corretamente
- Variáveis de ambiente em `.env.local`

---

**Tudo pronto? 🚀 Vamos começar a construir o frontend!**

Proxima chamada: `npm run dev` e vamos ver o site rodando!
