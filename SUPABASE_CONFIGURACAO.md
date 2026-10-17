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
3. O script configura `usuarios`, `caminhoes`, `materiais`, `clientes`, `motoristas`, `pedidos`, `pedido_itens`, `cargas` e `carga_pedidos`, além dos triggers e das políticas RLS. Ele não apaga os registros existentes.

Se você já executou a versão anterior do SQL e já possui `usuarios`, `caminhoes`, `materiais`, `clientes` e `motoristas`, execute `supabase/atualizacao_pedidos_cargas.sql` no SQL Editor para criar as tabelas de pedidos e cargas. Se ainda não possui clientes e motoristas, execute primeiro `supabase/atualizacao_clientes_motoristas.sql`.

Depois de executar, abra **Table Editor**, confira se o schema selecionado é `public` e atualize a página. Você deverá ver nove tabelas: `usuarios`, `caminhoes`, `materiais`, `clientes`, `motoristas`, `pedidos`, `pedido_itens`, `cargas` e `carga_pedidos`.

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

- Gerenciar Pedidos carrega clientes e materiais do Supabase e grava pedidos e itens nas tabelas `pedidos` e `pedido_itens`.
- Organizar Carga carrega caminhões, motoristas e pedidos pendentes do Supabase; grava as cargas e seus vínculos nas tabelas `cargas` e `carga_pedidos`.
- A tela de carga valida a capacidade do caminhão e marca os pedidos selecionados como `ALOCADO`.
- A tela de rotas ainda precisa de integração própria com tabelas do Supabase.
