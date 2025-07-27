# Finzi - Controle de Gastos Pessoais

Finzi é um aplicativo mobile completo para controle de gastos pessoais, desenvolvido em React Native com TypeScript. O app oferece uma solução offline robusta para gerenciar suas finanças pessoais de forma simples e intuitiva.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Dashboard Interativo**: Visualização completa dos gastos com gráficos de pizza e barras
- **Cadastro de Gastos**: Registro detalhado com suporte a parcelamento
- **Gerenciamento de Categorias**: Criação e edição de categorias personalizadas com cores e ícones
- **Gerenciamento de Contas**: Cadastro de contas bancárias (PIX, cartão, conta corrente, poupança)
- **Filtros e Busca**: Sistema avançado de filtros por data, categoria, conta e valor
- **Armazenamento Offline**: Todos os dados são salvos localmente usando AsyncStorage
- **Interface Responsiva**: Design otimizado para dispositivos móveis

### 🔄 Em Desenvolvimento
- **Orçamentos**: Definição de limites mensais por categoria com alertas
- **Contas Recorrentes**: Gerenciamento de contas fixas mensais
- **Autenticação**: Proteção por senha ou biometria
- **Notificações**: Lembretes de parcelas e vencimentos
- **Configurações**: Personalização de moeda, notificações e preferências

## 🛠️ Tecnologias Utilizadas

- **React Native** com **Expo**
- **TypeScript** para tipagem estática
- **React Navigation** para navegação entre telas
- **AsyncStorage** para persistência de dados offline
- **React Native Chart Kit** para gráficos
- **Expo Vector Icons** para ícones
- **React Native Paper** para componentes de UI

## 📱 Telas do Aplicativo

1. **Dashboard**: Visão geral dos gastos com gráficos e estatísticas
2. **Gastos**: Lista de todos os gastos com filtros e busca
3. **Adicionar Gasto**: Formulário para cadastro de novos gastos
4. **Categorias**: Gerenciamento de categorias personalizáveis
5. **Contas**: Gerenciamento de contas bancárias
6. **Orçamentos**: Controle de limites mensais (em desenvolvimento)
7. **Contas Recorrentes**: Gestão de contas fixas (em desenvolvimento)

## 🏗️ Arquitetura

### Estrutura de Pastas
```
src/
├── components/          # Componentes reutilizáveis
├── contexts/           # Context API para gerenciamento de estado
├── screens/            # Telas do aplicativo
├── services/           # Serviços (storage, etc.)
├── types/              # Definições de tipos TypeScript
└── utils/              # Utilitários e helpers
```

### Gerenciamento de Estado
- **Context API** com **useReducer** para estado global
- **AsyncStorage** para persistência local
- **TypeScript** para tipagem segura dos dados

### Tipos de Dados
- **Account**: Contas bancárias (PIX, cartão, etc.)
- **Category**: Categorias de gastos personalizáveis
- **Expense**: Gastos com suporte a parcelamento
- **Budget**: Orçamentos mensais por categoria
- **RecurringBill**: Contas recorrentes
- **Notification**: Sistema de notificações

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- Expo CLI
- Dispositivo móvel ou emulador

### Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd Finzi

# Instale as dependências
npm install

# Execute o aplicativo
npm start
```

### Executar no Dispositivo
```bash
# Android
npm run android

# iOS (apenas no macOS)
npm run ios

# Web
npm run web
```

## 📊 Funcionalidades Detalhadas

### Cadastro de Gastos
- Descrição personalizada
- Valor com formatação automática em R$
- Seleção de conta de origem
- Categorização
- Data configurável
- Suporte a parcelamento automático
- Duplicação de gastos anteriores

### Dashboard
- Gráfico de pizza por categorias
- Gráfico de barras por mês
- Resumo por conta bancária
- Alertas de orçamento
- Filtros por período (dia/mês/ano)

### Sistema de Filtros
- Busca por texto na descrição
- Filtro por categoria
- Filtro por conta
- Filtro por período
- Filtro por faixa de valores

### Gerenciamento de Categorias
- Criação com nome personalizado
- Seleção de cores predefinidas
- Escolha de ícones
- Visualização em tempo real
- Verificação de uso antes da exclusão

### Gerenciamento de Contas
- Tipos: Conta Corrente, Poupança, Cartão de Crédito, PIX
- Seleção de banco
- Estatísticas de uso
- Proteção contra exclusão se em uso

## 🔒 Segurança e Privacidade

- **Armazenamento Local**: Todos os dados ficam no dispositivo
- **Sem Conexão Online**: Funciona completamente offline
- **Dados Criptografados**: Preparado para autenticação biométrica
- **Sem Coleta de Dados**: Nenhuma informação é enviada para servidores externos

## 🎨 Design e UX

- **Interface Moderna**: Design clean e intuitivo
- **Cores Personalizáveis**: Sistema de cores para categorias
- **Ícones Intuitivos**: Biblioteca completa de ícones
- **Feedback Visual**: Animações e transições suaves
- **Responsivo**: Adaptado para diferentes tamanhos de tela

## 📈 Roadmap

### Versão 1.1
- [ ] Sistema completo de orçamentos
- [ ] Contas recorrentes com lembretes
- [ ] Autenticação biométrica
- [ ] Notificações push

### Versão 1.2
- [ ] Exportação de dados (CSV/PDF)
- [ ] Backup e restore
- [ ] Temas escuro/claro
- [ ] Múltiplas moedas

### Versão 1.3
- [ ] Sincronização entre dispositivos
- [ ] Relatórios avançados
- [ ] Metas de economia
- [ ] Análise de tendências

## 🤝 Contribuições

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ para ajudar pessoas a controlar melhor suas finanças pessoais.

---

**Finzi** - Sua ferramenta completa para controle financeiro pessoal! 💰📱