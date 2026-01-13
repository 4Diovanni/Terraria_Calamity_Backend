# 🎨 Terraria Calamity RPG - Frontend

Frontend em React + TypeScript + Vite do projeto Terraria Calamity RPG

## 🚀 Início Rápido

### 1️⃣ Atualizar o repositório local

```bash
# Vá até a raiz do projeto
cd C:\Projetos\Terraria_Calamity_Backend

# Puxe as alterações do GitHub
git pull origin main
```

### 2️⃣ Instalar dependências

```bash
# Navegue até o frontend
cd src/frontend

# Instale os pacotes (primeiro tempo pode levar 2-3 minutos)
npm install
```

### 3️⃣ Iniciar o servidor de desenvolvimento

```bash
# Ainda em src/frontend
npm run dev
```

**Resultado esperado:**
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

✅ O navegador deve abrir automaticamente em http://localhost:5173

---

## 📁 Estrutura do Projeto

```
src/frontend/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes de UI (Button, Card, etc)
│   │   ├── common/         # Componentes comuns (Header, Footer, Layout)
│   │   └── pages/          # Componentes de páginas (será criado)
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useFetch.ts    # Hook genérico para fetching
│   │   └── useWeapons.ts  # Hook para gerenciar armas
│   │
│   ├── services/           # Serviços de API
│   │   ├── apiClient.ts   # Cliente axios configurado
│   │   └── weaponService.ts # Métodos para armas
│   │
│   ├── types/              # Types TypeScript
│   │   ├── weapon.ts      # Tipos de armas
│   │   └── api.ts         # Tipos de API
│   │
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Ponto de entrada
│   └── index.css           # Estilos globais
│
├── index.html              # HTML principal
├── package.json            # Dependências
├── vite.config.ts          # Configuração do Vite
├── tsconfig.json           # Configuração TypeScript
├── tailwind.config.js      # Configuração Tailwind
└── .env.local              # Variáveis de ambiente
```

---

## 🎨 Design System

### Cores
- **Primary**: `#8b0000` (Vermelho Sangue)
- **Accent Purple**: `#6a0dad` (Roxo Ametista)
- **Accent Gold**: `#b8860b` (Dourado Antigo)
- **Background**: `#1a0f0f` (Carmesim Muito Escuro)
- **Text**: `#e0d5d0` (Creme Claro)

### Tipografia
- **Display**: Cinzel, Cormorant Garamond
- **Body**: Crimson Text, Libre Baskerville
- **Accent**: Marcellus SC

---

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev       # Inicia servidor com hot reload

# Build
npm run build     # Compila para produção
npm run preview   # Visualiza build de produção

# Lint (future)
npm run lint      # Verifica erros de code style
```

---

## 🔗 Integração com Backend

O frontend conecta com o backend em `http://localhost:8080`

### Endpoints disponíveis:
- `GET /api/v1/weapons` - Listar todas as armas
- `GET /api/v1/weapons/{id}` - Buscar arma por ID
- `GET /api/v1/weapons/element/{element}` - Filtrar por elemento
- `GET /api/v1/weapons/class/{class}` - Filtrar por classe
- `GET /api/v1/weapons/rarity/{rarity}` - Filtrar por raridade
- `GET /api/v1/weapons/search?name={name}` - Buscar por nome

---

## 🛠️ Troubleshooting

### Erro: "package.json not found"
**Solução**: Faça `git pull origin main` para baixar os arquivos mais recentes

### Erro: "Cannot find module 'react'"
**Solução**: Execute `npm install` novamente

### Porta 5173 já está em uso
**Solução**: O Vite usa outra porta automaticamente, ou mate o processo:
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID {PID} /F
```

### Backend não conecta
**Verifique:**
- Backend está rodando em `http://localhost:8080`
- CORS está configurado no backend
- Variáveis de ambiente em `.env.local`

---

## 📚 Tecnologias

- **React 18** - UI Library
- **TypeScript 5** - Type safety
- **Vite 5** - Fast bundler
- **Tailwind CSS 3** - Utility-first CSS
- **Axios** - HTTP client
- **React Router** - Navegação (será usado)

---

## 🎯 Próximos Passos

- [ ] Página de listagem de armas
- [ ] Página de detalhes da arma
- [ ] Filtros e busca
- [ ] Sistema de autenticação
- [ ] Criar/editar/deletar armas (admin)
- [ ] Responsividade mobile

---

**Desenvolvido com ❤️ by Giovanni Moreira**
