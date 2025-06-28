# 🚗 CoopWeb - Sistema de Gestão para Cooperativas de Transporte

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime%20Database-orange?style=flat&logo=firebase)](https://firebase.google.com/)
[![HeroUI](https://img.shields.io/badge/HeroUI-v2-purple?style=flat)](https://heroui.com/)

CoopWeb é um sistema completo de gestão e monitoramento para cooperativas de transporte, desenvolvido com Next.js 15 e tecnologias modernas. Oferece funcionalidades avançadas de programação de viagens, monitoramento em tempo real via GPS e gestão de funcionários.

## 🚀 Principais Funcionalidades

### 📊 **Dashboard Administrativo**

- Painel de controle centralizado para gerenciamento da empresa
- Estatísticas rápidas e métricas de performance
- Interface moderna e responsiva com gradientes dinâmicos

### 🗓️ **Gestão de Viagens**

- **Viagens Programadas**: Criação e edição de viagens futuras
- **Viagens em Tempo Real**: Acompanhamento de viagens em andamento
- **Histórico Completo**: Consulta de viagens finalizadas com filtros avançados
- **Validação Inteligente**: Sistema de validação de passageiros e cidades

### 🌍 **Monitoramento GPS em Tempo Real**

- Rastreamento de motoristas via Firebase Realtime Database
- Mapas interativos com Leaflet e OpenStreetMap
- Controles de zoom, centralização e tela cheia
- Indicadores visuais de status de conexão
- Métricas de precisão GPS e última atualização

### 👥 **Gestão de Funcionários**

- Cadastro e edição de motoristas
- Sistema de atribuição de viagens
- Controle de disponibilidade por cidade/região

### 🏢 **Gestão Multi-Cooperativa**

- Suporte a múltiplas cooperativas
- Sistema de seleção dinâmica de cooperativas
- Dados isolados por organização

### 🔐 **Sistema de Autenticação**

- Login seguro com JWT tokens
- Middleware de proteção de rotas
- Redirecionamento automático baseado no status de autenticação

## 🛠️ Tecnologias Utilizadas

### **Frontend**

- **[Next.js 15](https://nextjs.org/)** - Framework React com App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[HeroUI](https://heroui.com/)** - Biblioteca de componentes moderna
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitário
- **[Next Themes](https://github.com/pacocoursey/next-themes)** - Suporte a temas claro/escuro

### **Mapas e Geolocalização**

- **[Leaflet](https://leafletjs.com/)** - Biblioteca de mapas interativos
- **[React Leaflet](https://react-leaflet.js.org/)** - Componentes React para Leaflet
- **[OpenStreetMap](https://www.openstreetmap.org/)** - Tiles de mapas open source

### **Backend e Dados**

- **[Firebase Realtime Database](https://firebase.google.com/docs/database)** - Banco de dados em tempo real
- **API RESTful** - Comunicação com servidor backend
- **Server Actions** - Ações do lado servidor do Next.js

### **Outras Ferramentas**

- **[Iconify](https://iconify.design/)** - Biblioteca de ícones
- **[ESLint](https://eslint.org/)** - Linting e qualidade de código
- **[PostCSS](https://postcss.org/)** - Processamento de CSS

## 📁 Estrutura do Projeto

```
coopweb/
├── app/                          # App Router do Next.js
│   ├── (private)/               # Rotas protegidas
│   │   ├── [id]/               # Dashboard da empresa
│   │   │   ├── ride/           # Gestão de viagens
│   │   │   │   └── realtime/   # Monitoramento GPS
│   │   │   ├── modal/          # Modais de formulários
│   │   │   └── passegers/      # Gestão de passageiros
│   │   ├── cooperativa/        # Gestão de cooperativas
│   │   └── home/              # Página inicial
│   ├── (public)/              # Rotas públicas
│   │   └── signin/            # Página de login
│   ├── layout.tsx             # Layout raiz
│   └── providers.tsx          # Providers globais
├── src/
│   ├── components/            # Componentes reutilizáveis
│   ├── model/                 # Interfaces TypeScript
│   ├── services/              # Serviços de API
│   └── utils/                 # Utilitários
├── scripts/
│   └── firebase-config.ts     # Configuração Firebase
└── public/                    # Arquivos estáticos
```

## 🏃‍♂️ Como Executar

### **Pré-requisitos**

- Node.js 18+
- npm, yarn, pnpm ou bun

### **Instalação**

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/coopweb.git
cd coopweb
```

2. **Instale as dependências**

```bash
npm install
# ou
yarn install
# ou
pnpm install
# ou
bun install
```

3. **Configure as variáveis de ambiente**

```bash
# Crie um arquivo .env.local
cp .env.example .env.local
```

Adicione as seguintes variáveis:

```env
NEXT_PUBLIC_SERVER=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=sua_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
```

4. **Execute o servidor de desenvolvimento**

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

5. **Acesse a aplicação**
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🌟 Funcionalidades Detalhadas

### **Monitoramento em Tempo Real**

- Conexão via Firebase Realtime Database
- Atualização automática de localização GPS
- Indicadores visuais de status (conectado/desconectado)
- Mapas interativos com controles personalizados
- Métricas de precisão e timestamp das atualizações

### **Sistema de Viagens**

- Criação de viagens programadas e sob demanda
- Validação inteligente de passageiros da mesma cidade
- Sistema de status com cores dinâmicas
- Filtros avançados por data, status e motorista
- Histórico completo com dados de duração e valor

### **Interface Moderna**

- Design responsivo com gradientes dinâmicos
- Tema claro/escuro automático
- Componentes acessíveis do HeroUI
- Animações suaves e feedback visual
- Toast notifications para ações do usuário

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm run start

# Linting
npm run lint

# Linting com correção automática
npm run lint:fix
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Desenvolvido por

**Yuri Cavalcante**

- GitHub: [@yuricavalcante](https://github.com/yuricavalcante)

---

<div align="center">
  <p>Feito com ❤️ para cooperativas de transporte</p>
</div>
