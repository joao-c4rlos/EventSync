# EventSync

Plataforma web para gestão de eventos: cadastro e acompanhamento de eventos, página pública de inscrição,
controle financeiro, dashboard com indicadores e notificações.

## Tecnologias

- **Back-end:** Java 25, Spring Boot 4 (Web MVC, Data JPA, Security com JWT, Validation), Flyway
- **Front-end:** Angular 22 com TypeScript
- **Banco de dados:** MySQL 8

## Funcionalidades

- Cadastro, login (com opção "lembrar de mim") e recuperação de senha
- Eventos: criação, edição, publicação, encerramento e cancelamento
- Página pública de inscrição (`/e/{slug}`) com controle de vagas e e-mails duplicados
- Financeiro: gastos e recebimentos por mês, lucro previsto x real
- Dashboard: indicadores e gráfico de inscrições por período com comparação entre eventos
- Notificações de eventos próximos e pagamentos pendentes
- Configurações: perfil, senha, fuso horário, tema escuro, plano (simulado) e exclusão de conta

## Como executar

### Pré-requisitos

- JDK 25, Node.js 22.22+ (ou 24 LTS) e MySQL 8

### Banco de dados

```sql
CREATE DATABASE eventsync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'eventsync'@'localhost' IDENTIFIED BY 'sua-senha';
GRANT ALL ON eventsync.* TO 'eventsync'@'localhost';
```

As tabelas são criadas automaticamente pelo Flyway na primeira execução.

### Back-end

```powershell
cd backend
copy .env.example .env   # preencha DB_PASSWORD e JWT_SECRET
.\mvnw.cmd spring-boot:run
```

A API sobe em http://localhost:8080.

### Front-end

```powershell
cd frontend
npm install
npm start
```

A aplicação abre em http://localhost:4200 (as chamadas para `/api` são encaminhadas ao back-end).

## Testes

- **Back-end:** `.\mvnw.cmd test` (usa o banco `eventsync_test`, que precisa existir com permissão para o usuário `eventsync`)
- **Front-end:** `npx ng test --watch=false`
