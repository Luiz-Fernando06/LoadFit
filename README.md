# LoadFit - Expo + Android + SQL

O projeto agora possui:

- App React Native com Expo;
- `npm start` configurado para abrir diretamente a versão Android;
- API Node.js/Express;
- suporte a PostgreSQL **ou** MySQL;
- cadastro e login de usuários no banco;
- cadastro, listagem e exclusão de materiais no banco.

## 1. Instalar o app

Na pasta principal do projeto:

```bash
npm install
```

## 2. Configurar o banco e a API

Entre na pasta `backend`:

```bash
cd backend
npm install
```

Crie um banco chamado `loadfit`. Depois execute o arquivo correspondente:

- PostgreSQL: conecte-se ao banco `loadfit` e execute `backend/sql/postgres.sql`
- MySQL: execute `backend/sql/mysql.sql` (ele também cria/seleciona o banco)

Depois copie `backend/.env.example` para `backend/.env` e preencha os dados do banco.

Exemplo PostgreSQL:

```env
DB_CLIENT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=loadfit
PORT=3000
```

Exemplo MySQL:

```env
DB_CLIENT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=loadfit
PORT=3000
```

Inicie a API:

```bash
npm start
```

Teste no navegador do PC:

```text
http://localhost:3000/health
```

A resposta deve indicar `status: ok`.

## 3. Configurar o endereço da API no aplicativo

### Android Emulator

O projeto já usa como padrão:

```text
http://10.0.2.2:3000
```

Nesse caso não é necessário criar `.env` no app.

### Celular Android físico com Expo Go

O celular não consegue usar `localhost` do computador. Descubra o IPv4 do PC com:

```bash
ipconfig
```

Crie `.env` na raiz do app, por exemplo:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.15:3000
```

Troque `192.168.0.15` pelo IPv4 real do seu computador. PC e celular precisam estar na mesma rede Wi-Fi.

## 4. Executar direto no Android

Agora basta executar na pasta principal:

```bash
npm start
```

O comando foi configurado como:

```text
expo start --android
```

Também estão disponíveis:

```bash
npm run android
npm run start:expo
npm run web
```

- `npm start` / `npm run android`: tenta abrir direto no Android.
- `npm run start:expo`: abre o Expo normalmente e permite escolher a plataforma.

Para uma compilação Android nativa local, com Android Studio/JDK configurados:

```bash
npm run android:native
```

## Estrutura da conexão

```text
App Android (Expo)
       |
       | HTTP / JSON
       v
API Node.js / Express
       |
       v
PostgreSQL ou MySQL
```

O app **não acessa o banco SQL diretamente**. Isso evita colocar usuário/senha do banco dentro do APK e mantém a arquitetura correta.


## Login durante o desenvolvimento

O projeto vem com `EXPO_PUBLIC_MODO_TESTE=true` no arquivo `.env`. Enquanto a API/banco ainda não estiverem ligados, basta preencher qualquer e-mail e senha para acessar o menu.

Quando o PostgreSQL/MySQL estiver configurado e a API estiver funcionando, altere para:

```env
EXPO_PUBLIC_MODO_TESTE=false
```

A partir daí, o login só será aceito para usuários cadastrados no banco. Erros de credencial (HTTP 400/401) nunca são ignorados pelo modo de teste; o fallback acontece somente quando a API está indisponível.

Para abrir no navegador use `npm run web`. Para abrir direto no Android use `npm start`.

## Enviar para o GitHub

Este pacote já está organizado com apenas um projeto principal e sem marcadores de conflito do Git.
As pastas `node_modules` e `.expo` não precisam ser enviadas e já estão no `.gitignore`.

Depois de extrair o ZIP, execute:

```bash
npm install
npm run web
```

Se estiver tudo certo, você pode versionar normalmente:

```bash
git add .
git commit -m "Atualiza projeto LoadFit"
git push
```

No modo de teste (`EXPO_PUBLIC_MODO_TESTE=true`), login, cadastro e materiais podem ser testados mesmo com a API desligada. Materiais criados sem a API ficam somente em memória e desaparecem ao recarregar a aplicação.
