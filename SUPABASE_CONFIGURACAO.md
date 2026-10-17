# Configuração do Supabase - LoadFit

## 1. Preencher as credenciais

1. Copie `.env.example` e renomeie a cópia para `.env`.
2. No painel do Supabase, abra **Project Settings > API** (ou **Connect**).
3. Copie a Project URL para `EXPO_PUBLIC_SUPABASE_URL`.
4. Copie a chave publishable (`sb_publishable_...`) para `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
   - Se o projeto ainda utiliza a chave anon antiga, use `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
5. Não coloque a `service_role` ou secret key no aplicativo. Nunca compartilhe essa chave no GitHub.

## 2. Criar/configurar as tabelas

Se estiver configurando o projeto do zero:

1. No Supabase, abra **SQL Editor > New query**.
2. Copie todo o conteúdo de `supabase/setup.sql` e execute.
3. O script configura `usuarios`, `caminhoes`, `materiais`, `clientes` e `motoristas`, o trigger do perfil e as políticas RLS. Ele não apaga os registros existentes.

Se você já executou a versão anterior do SQL e já possui `usuarios`, `caminhoes` e `materiais`, execute apenas `supabase/atualizacao_clientes_motoristas.sql` no SQL Editor para criar as duas tabelas que faltam.

Depois de executar, abra **Table Editor**, confira se o schema selecionado é `public` e atualize a página. Você deverá ver cinco tabelas: `usuarios`, `caminhoes`, `materiais`, `clientes` e `motoristas`.

As políticas RLS associam os registros ao usuário autenticado. Registros antigos sem `user_id` não serão exibidos para usuários autenticados até serem associados a um proprietário.

## 3. Instalar dependências e executar

No terminal do VS Code, na pasta que contém `package.json`, execute:

```bash
npm install
npx expo start --web -c
```

Para executar no celular, use `npx expo start` e abra pelo Expo Go.

## 4. O que está conectado nesta versão

- Cadastro e login de usuário pelo Supabase Auth.
- Criação automática do perfil na tabela `public.usuarios` (via trigger).
- Cadastro, listagem, edição e exclusão dos próprios caminhões.
- Cadastro, listagem, edição e exclusão dos próprios materiais.
- Cadastro, listagem, edição e exclusão dos próprios clientes.
- Cadastro, listagem, edição e exclusão dos próprios motoristas.

As telas de pedidos, organização de carga e rotas ainda precisam de integração própria com tabelas do Supabase.
