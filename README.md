# EventSync

Para Docker no VS Code, veja `LEIA-ME-CORRECOES.txt`. Use `.\iniciar.cmd` para iniciar em segundo plano e `.\ver-logs.cmd` para consultar as últimas mensagens.

Plataforma web para gestão de eventos: cadastro e acompanhamento de eventos, página pública de inscrição,
controle financeiro, dashboard com indicadores e notificações.

## Tecnologias

- **Back-end:** Java 25, Spring Boot 4 (Web MVC, Data JPA, Security com JWT, Validation), Flyway
- **Front-end:** Angular 22 (componentes standalone, signals, lazy loading) com TypeScript, SCSS e ícones [Lucide](https://lucide.dev)
- **Design system:** EventSync Design System (tokens e componentes CSS `es-*`, temas claro e escuro)
- **Banco de dados:** MySQL 8

## Funcionalidades

- Cadastro, login (com opção "lembrar de mim") e recuperação de senha
- Eventos: criação, edição, publicação, encerramento e cancelamento
- Página pública de inscrição (`/e/{slug}`) com controle de vagas e e-mails duplicados
- Financeiro: gastos e recebimentos por mês, lucro previsto x real
- Dashboard: indicadores, gráfico de inscrições por período com comparação entre eventos e exportação do relatório em CSV
- Detalhe do evento com abas (visão geral e inscritos) e confirmação em modal para ações destrutivas
- Inscrição manual pelo organizador (aba Inscritos do evento): nome, e-mail e data de nascimento são opcionais, então a pessoa pode entrar só como dado de controle
- Conta de demonstração com eventos, inscrições e lançamentos simulados, criada na primeira execução (veja abaixo)
- Notificações de eventos próximos e pagamentos pendentes
- Configurações: perfil, senha, fuso horário, tema claro/escuro, plano (simulado) e exclusão de conta
- Exportação dos lançamentos financeiros do mês em CSV

## Dados de demonstração

Na primeira execução o back-end cria a conta **demo@eventsync.com.br** (senha **demo12345**) com 9 eventos
(encerrados, publicados, rascunho e cancelado), centenas de inscrições espalhadas nos últimos meses e
lançamentos financeiros. As datas são relativas a hoje, então o dashboard sempre abre preenchido. A tela de login
tem um atalho que preenche essas credenciais. Para desligar, use `DEMO_DATA=false` no `.env` do back-end.

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

A aplicação abre em http://localhost:4200 (as chamadas para `/api` são encaminhadas ao back-end em `localhost:8080`, veja `frontend/proxy.conf.json`).

| Comando | O que faz |
|---|---|
| `npm start` | Servidor de desenvolvimento com recarga automática |
| `npm run build` | Build de produção em `dist/frontend/browser` |
| `npx ng test --watch=false` | Testes unitários (Vitest) |

> Se alterar o `angular.json` (por exemplo, a lista de `styles`), reinicie o `npm start`: o servidor só lê essa configuração ao iniciar. Sem isso a tela aparece sem estilo.

#### Design system

A interface segue o **EventSync Design System**. Os arquivos oficiais ficam em `frontend/src/design/` e são carregados pelo `angular.json`:

- `tokens.css`: variáveis (`--primary`, `--space-4`, `--radius-md`…), classes de texto e os temas claro e escuro (`data-theme` no `<html>`).
- `eventsync-components.css`: componentes em CSS puro com prefixo `es-` (botão, campo, select, badge, alerta, card, StatCard, tabela, abas, sidebar, topbar, gráfico e modal).

Regras de uso: não escrever cores, espaçamentos, raios ou fontes literais (use `var(--token)`), reutilizar os componentes `es-*` e mostrar status sempre com ícone e palavra. O tema é definido pela preferência do usuário (Configurações > Preferências). O logo está em `frontend/public/eventsync-logo.jpg`.

Estrutura do front-end:

```
frontend/src/
├── design/            tokens.css e eventsync-components.css (design system)
├── styles.scss        base e utilitários do app (sem valores literais)
└── app/
    ├── core/          serviços de API, autenticação, guards e interceptor
    ├── layout/        shell (sidebar + topbar)
    ├── shared/        Icone, Alerta, Status (badge), Confirmacao (modal), Avatar, gráficos
    └── features/      auth, dashboard, eventos, financeiro, configuracoes, perfil, publico, notificacoes
```

## Executar com Docker

Sobe MySQL, back-end e front-end (Nginx) com um único comando. Pré-requisito: Docker com Compose v2.

```bash
copy .env.example .env        # (Linux/macOS: cp .env.example .env)
# edite o .env: DB_PASSWORD, DB_ROOT_PASSWORD e JWT_SECRET
docker compose up -d --build
```

A aplicação fica em http://localhost:4200 (altere com `WEB_PORT` no `.env`). O Nginx serve o Angular e encaminha
`/api` para o back-end, então não há necessidade de configurar CORS. As migrações do Flyway rodam na primeira
inicialização e os dados ficam no volume `db-data`.

### Serviços

| Serviço | Imagem / build | Porta | Observações |
|---|---|---|---|
| `db` | `mysql:8.4` | não exposta | Healthcheck com `mysqladmin ping`. O script `docker/mysql/init.sql` cria o banco `eventsync_test` na primeira inicialização |
| `backend` | `./backend` (Temurin 25, build multi-stage) | interna `8080` | Só inicia depois que o `db` estiver saudável. Healthcheck em `/actuator/health`. Roda com usuário sem privilégios |
| `frontend` | `./frontend` (Node 24 para o build, `nginx:alpine` para servir) | `WEB_PORT` (padrão `4200`) | Serve o build do Angular, faz o fallback das rotas para `index.html` e faz proxy de `/api` para o `backend` |

### Variáveis do `.env`

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DB_PASSWORD` | sim | Senha do usuário `eventsync` do MySQL |
| `DB_ROOT_PASSWORD` | sim | Senha do usuário `root` do MySQL |
| `JWT_SECRET` | sim | Chave HS256 em Base64 com 32+ bytes. Gere com `openssl rand -base64 48` |
| `DB_USER` | não | Usuário do banco (padrão `eventsync`) |
| `WEB_PORT` | não | Porta do front-end no host (padrão `4200`) |
| `JWT_EXPIRATION_MINUTES` | não | Validade do token (padrão `480`) |
| `CORS_ORIGINS` | não | Só é necessário se o back-end for acessado de outra origem |

### Comandos úteis

```bash
docker compose up -d --build     # em segundo plano
docker compose logs --tail=100 backend   # logs do back-end
docker compose logs --tail=100 frontend  # logs do Nginx
docker compose build frontend    # reconstrói só o front-end (após mudar telas ou estilos)
docker compose down              # para os containers (mantém os dados)
```

O envio de e-mail de recuperação de senha é simulado: o link aparece no log do back-end (`docker compose logs --tail=100 backend`).

## Testes

- **Back-end:** `.\mvnw.cmd test` (usa o banco `eventsync_test`, que precisa existir com permissão para o usuário `eventsync`). Com Docker, o banco é criado pelo `docker/mysql/init.sql`; para rodar os testes fora do container, descomente `ports` do serviço `db` no `docker-compose.yml`
- **Front-end:** `npx ng test --watch=false`
s