# LoadFit + Supabase

## 1. Instalar as dependências

Na pasta principal do projeto:

```bash
npm install
```

## 2. Configurar o `.env`

No painel do Supabase, copie a Project URL e a Publishable Key.

Preencha o arquivo `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA_CHAVE
```

Depois de alterar o `.env`, reinicie o Expo limpando o cache:

```bash
npx expo start --web -c
```

## 3. Criar as tabelas

Abra **Supabase > SQL Editor**, copie todo o conteúdo de:

```text
supabase/setup.sql
```

e execute.

O script cria:

- `public.usuarios`
- `public.materiais`
- `public.caminhoes`
- políticas RLS
- trigger que cria automaticamente o perfil em `public.usuarios` quando um usuário se cadastra no Supabase Auth

A senha não é gravada em `public.usuarios`. Ela é gerenciada pelo Supabase Auth.

## 4. Cadastro e login

No LoadFit clique em **Criar usuário** e cadastre um e-mail real e uma senha com pelo menos 6 caracteres.

Em projetos hospedados do Supabase, a confirmação de e-mail pode estar habilitada. Nesse caso, confirme o e-mail recebido antes de tentar entrar.

Para uma apresentação acadêmica/testes locais, você também pode acessar **Authentication > Providers > Email** no Supabase e desabilitar **Confirm email**. Assim o usuário poderá entrar logo após o cadastro.

Não use `1` / `1` no login: agora o LoadFit usa autenticação real do Supabase e só permite entrar com um usuário cadastrado.

## 5. Rodar

Web:

```bash
npm run web
```

Android:

```bash
npm start
```

## 6. Onde conferir os usuários

- **Authentication > Users**: conta de autenticação do Supabase.
- **Table Editor > usuarios**: nome, e-mail e ID do perfil criado pelo trigger.
