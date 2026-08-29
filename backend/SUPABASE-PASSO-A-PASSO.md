# Configurar Supabase para a Colorauta

## 1. Projeto criado

Seu projeto Supabase:

```txt
https://kzzxaxjicoggztmniwwr.supabase.co
```

Não coloque a senha do banco dentro do site. Ela é privada e não é necessária para o painel funcionar no navegador.

## 2. Criar tabelas e segurança

1. Abra `SQL Editor`.
2. Crie uma nova query.
3. Cole todo o conteúdo de `backend/supabase-setup.sql`.
4. Clique em `Run`.

Esse SQL cria:

- Produtos.
- Variações de produtos.
- Storage para fotos de produtos.
- Usuários administradores.
- Regras de segurança.
- Produtos atuais do site.

## 3. Criar seu usuário admin

1. Vá em `Authentication`.
2. Abra `Users`.
3. Crie um usuário com seu e-mail e senha.
4. Copie o `User UID` desse usuário.
5. Volte ao `SQL Editor` e rode:

```sql
insert into public.admin_users (user_id)
values ('COLE-O-USER-UID-AQUI');
```

Somente usuários cadastrados em `admin_users` conseguem adicionar, editar ou apagar produtos.

## 4. Pegar URL e chave pública

1. Vá em `Project Settings`.
2. Abra `Data API` ou `API Keys`.
3. Copie a `anon public key`.
4. Abra `backend/supabase-config.js`.
5. Cole a chave no campo `anonKey`:

```js
window.COLORAUTA_SUPABASE = {
  url: "https://kzzxaxjicoggztmniwwr.supabase.co",
  anonKey: "SUA_ANON_PUBLIC_KEY",
};
```

Nunca coloque `service_role` nem senha do banco no site.

## 5. Testar

1. Abra `admin/`.
2. Faça login.
3. Cadastre um produto.
4. Se quiser, selecione uma foto do computador no campo de foto.
5. Salve o produto.
6. Abra `index.html` e confirme que o produto aparece.

## Importante

- Use a chave `anon public`, nunca a `service_role`.
- O painel admin só salva se o usuário estiver em `admin_users`.
- Visitantes do site só conseguem ler produtos ativos.
- Administradores conseguem criar, editar, apagar produtos e enviar fotos.

Depois disso, pode subir todos os arquivos para a Hostinger.
