---
tags: [docs, arquitetura]
aliases: [Arquitetura, ARCHITECTURE]
up: "[[INDEX]]"
related:
  - "[[Backend-MOC]]"
  - "[[Frontend-MOC]]"
  - "[[Infra-MOC]]"
status: ativo
---

# 🏗️ Arquitetura do Projeto - Terraria Calamity RPG

> Ver também: [[Backend-MOC]] · [[Frontend-MOC]] · [[Infra-MOC]]

## 📁 Estrutura de Diretórios

```
Terraria_Calamity_Backend/
├── 📂 src/
│   ├── 📂 main/
│   │   ├── 📂 java/com/terraria/calamity/
│   │   │   ├── api/
│   │   │   ├── application/
│   │   │   ├── config/
│   │   │   ├── domain/
│   │   │   └── TerrariaCalamityApplication.java
│   │   └── 📂 resources/
│   │       └── application.yml
│   │
│   └── 📂 frontend/ ← NOVO
│       ├── 📂 src/
│       │   ├── 📂 assets/
│       │   │   ├── 📂 images/
│       │   │   ├── 📂 icons/
│       │   │   └── 📂 styles/
│       │   ├── 📂 components/
│       │   │   ├── 📂 common/
│       │   │   ├── 📂 pages/
│       │   │   └── 📂 ui/
│       │   ├── 📂 hooks/
│       │   ├── 📂 services/
│       │   ├── 📂 types/
│       │   ├── 📂 utils/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── index.css
│       ├── 📄 vite.config.ts
│       ├── 📄 tsconfig.json
│       ├── 📄 tailwind.config.js
│       ├── 📄 postcss.config.js
│       ├── 📄 package.json
│       └── 📄 .env.local
│
├── 📂 postman/
│   └── terraria-api.json
│
├── 📂 docs/
│   ├── POSTMAN_GUIDE.md
│   └── FRONTEND_GUIDE.md
│
├── pom.xml
├── .env
├── .gitignore
└── README.md
```

---

## 🔄 Fluxo de Desenvolvimento

### Backend (Java/Spring Boot)
- **Porta**: 8080
- **API Base**: `http://localhost:8080/api/v1`
- **Endpoints**: Públicos (GET) e Protegidos (POST/PUT/DELETE)

### Frontend (React/TypeScript)
- **Porta**: 5173 (Vite default)
- **Framework**: React 18+ com TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **State**: React Hooks + Context API
- **API Client**: Axios ou Fetch API

---

## 🚀 Stack Tecnológico

### Backend
- Java 17+
- Spring Boot 3.x
- PostgreSQL
- Spring Security
- JWT (a implementar)

### Frontend
- React 18+
- TypeScript 5+
- Vite (bundler)
- Tailwind CSS 3+
- Axios (HTTP client)
- React Router (navigation)
- Context API (state management)

---

## 🎨 Design System

### Paleta de Cores
```
# Dark Mode Mystical
Background:    #1a0f0f (Carmesim muito escuro)
Secondary BG:  #2d1a1a (Carmesim escuro)
Primary:       #8b0000 (Vermelho sangue)
Accent 1:      #6a0dad (Roxo ametista)
Accent 2:      #b8860b (Dourado antigo)
Accent 3:      #556b2f (Verde musgo)
Text Primary:  #e0d5d0 (Creme claro)
Text Secondary:#a89080 (Creme acinzentado)
Border:        #5a3a3a (Carmesim médio)
```

### Tipografia
- **Títulos**: Cinzel, Cormorant Garamond (600-700)
- **Corpo**: Crimson Text, Libre Baskerville (400)
- **Labels**: Marcellus SC (small caps)

### Componentes
- **Card**: Fundo secundário, borda fina, sombra sutil
- **Button**: Hover com transição 800ms, efeito revelador
- **Input**: Transparente, borda inferior, foco com glow
- **Modal**: Overlay com blur, animation fade-in

---

## 📦 Dependências Principal (Frontend)

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "axios": "^1.x",
    "tailwindcss": "^3.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x"
  }
}
```

---

## 🔗 Comunicação Frontend ↔ Backend

### Exemplo: GET /api/v1/weapons

```typescript
// Frontend Service
const fetchWeapons = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/v1/weapons`
  );
  return response.data;
};

// Variável de Ambiente (.env.local)
VITE_API_URL=http://localhost:8080
```

---

## 📋 Próximas Etapas

1. ✅ Definir arquitetura (ESTE DOCUMENTO)
2. ⏳ Criar projeto Vite + React + TypeScript
3. ⏳ Configurar Tailwind CSS
4. ⏳ Implementar Design System
5. ⏳ Criar componentes base
6. ⏳ Integrar com API
7. ⏳ Implementar páginas principais
8. ⏳ Adicionar interações e animações

---

## 🚦 Padrão de Commits

Para manter organização:

```
feat: Add feature
fix: Fix bug
refactor: Refactor code
docs: Update documentation
style: Format code
test: Add tests

Exemplos:
feat(frontend): Create weapon list component
feat(backend): Add JWT authentication
fix(frontend): Fix responsive design
```

---

## 🔐 Variáveis de Ambiente

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calamity_rpg
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=Terraria Calamity RPG
```

---

## 📱 Responsividade

- **Mobile**: < 640px (Tailwind sm)
- **Tablet**: 640px - 1024px (Tailwind md, lg)
- **Desktop**: > 1024px (Tailwind xl, 2xl)

---

**Última atualização**: 2026-01-11
**Versão**: 1.0.0
