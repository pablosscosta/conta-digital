# Conta Digital
 Esta é uma aplicação de conta digital (carteira virtual) que permite aos usuários realizar a gestão de suas finanças de forma simples e segura. Através de uma interface web, é possível criar uma conta, realizar depósitos, transferir valores para outros usuários em tempo real e acompanhar o histórico completo de transações através de um extrato detalhado. O sistema foi desenvolvido com foco rigoroso na integridade financeira, garantindo que todas as operações sejam processadas de forma atômica e segura.

# Tecnologias
## Backend (API):
- **Linguagem:** Python 3.12.3
- **Framework:** Django 6.0.2
- **Toolkit API:** Django REST Framework (DRF) 3.16.1
- **Banco de Dados:** SQLite3 (Nativo do Python)
- **Autenticação:** JWT 5.5.1
## Frontend: 
- **Ambiente de Execução:** Node.js 25.2.1
- **Biblioteca Principal:** React 19.2.0
- **Ferramenta de Build:** Vite 7.3.1
- **Comunicação com API:** Axios 1.13.5

# Pré-requisitos
Para executar o projeto você precisará ter instalado em sua máquina:
- Python (Versão 3.12.3 ou superior) 
- Node.js (Versão 25.2.1 ou superior)
- Git (Versão 2.43 ou superior)
- Gerenciador de pacotes Node: npm (Versão 11.6.2 ou superior)
- Gerenciador de pacotes Python: pip (Versão 24.0 ou superior)

# Instalação e Execução
Primeiro, clone o projeto e acesse a pasta raiz:
```
git clone https://github.com/pablosscosta/conta-digital.git
cd conta-digital
```

### 1. Configurando o Backend

#### 1.1 Navegue até a pasta do backend:
```
cd backend
```

#### 1.2 Crie e ative um ambiente virtual
- Linux:
```
python3 -m venv venv

source venv/bin/activate
```
- Windows:
```
python -m venv venv

.\venv\Scripts\activate
```

#### 1.3 Instale as dependências:
```
pip install -r requirements.txt
```

#### 1.4 Execute o servidor:
```
python manage.py runserver
```

### 2. Configurando o Frontend

#### 2.1 Navegue até a pasta do frontend
```
cd frontend
```

#### 2.2 Instale as dependências:
```
npm install
```

#### 2.3 Execute o servidor:
```
npm run dev
```

# Migrations e Seed de Dados
Para preparar o banco de dados e as contas de teste, execute os comandos abaixo dentro da pasta `backend` (certifique-se de que o ambiente virtual `venv` esteja ativo):

### 1. Aplicar Migrations
Crie a estrutura das tabelas no banco de dados local
```
python manage.py migrate
```

### 2. Popular o Banco (Seed)
Execute o comando customizado para criar as contas de teste com saldos iniciais via `DepositService`
```
python manage.py seed
```

# Credenciais para teste
Se você executou com sucesso os comandos da sessão anterior então pode testar no frontend (http://localhost:5173/) com as seguintes credenciais:

| Perfil | E-mail | Senha |
| :--- | :--- | :--- |
| **Administrador** | `admin@sulivam.com` | `admin123` |
| **Usuário Comum** | `joao@email.com` | `user123` |
| **Usuário Comum** | `maria@email.com` | `user123` |

# Decisões técnicas
Esta seção detalha as escolhas feitas durante o desenvolvimento e como a integridade do sistema foi garantida.

### 1. Escolha da Stack
A escolha do **Django** no backend e **React** no frontend foi motivada pela **familiaridade com essas tecnologias**. Utilizar ferramentas onde já possuo domínio me permitiu focar na entrega de uma aplicação funcional, segura e organizada dentro do prazo, garantindo maior produtividade e qualidade no código final.

### 2. Integridade do Saldo
O maior desafio técnico foi garantir que o saldo dos usuários fosse manipulado sem erros. Para isso, as decisões foram:

- **Atomicidade (`transaction.atomic`):** Esta foi a base de todas as operações financeiras. Utilizei transações atômicas para garantir que, em uma transferência, o débito em uma conta e o crédito na outra ocorram juntos. Se qualquer parte falhar, o Django desfaz tudo (rollback), impedindo a perda ou criação indevida de valores.
- **Gestão de Concorrência:** Implementei lógicas para evitar problemas de concorrência e *deadlocks*, garantindo que o sistema processe transações simultâneas de forma segura, mantendo o saldo sempre consistente.

### 3. Estratégia de Banco de Dados
- **SQLite3:** Optei pelo SQLite por já vir integrado ao Django. Para o estágio atual de desenvolvimento e para facilitar a avaliação do projeto (sem exigir configurações complexas de ambiente), ele é perfeitamente funcional e suficiente.