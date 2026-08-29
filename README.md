# Colorauta - Grafica e Papelaria

Site catalogo da Colorauta com painel administrativo simples, carrinho e envio de pedido pelo WhatsApp.

## O que o projeto usa

- HTML, CSS e JavaScript puros.
- Alpine.js via CDN para interacoes da loja.
- Supabase para produtos, variacoes, login do admin e upload de imagens.
- Hostinger/Apache, com configuracao em `.htaccess`.

## Estrutura

- `index.html`: site publico.
- `style.css`: estilos gerais do site.
- `main.js`: logica do catalogo, modal, categorias e carrinho.
- `admin/`: painel administrativo.
- `admin/index.html`: tela do painel.
- `admin/admin.css`: estilos do painel.
- `admin/admin.js`: logica de login e cadastro de produtos.
- `backend/`: arquivos de conexao e configuracao do Supabase.
- `backend/supabase-api.js`: comunicacao com o Supabase.
- `backend/supabase-config.js`: URL e chave publica do Supabase.
- `backend/supabase-setup.sql`: estrutura inicial do banco.
- `data/produtos.json`: fallback local de produtos.

## Rodar localmente

Na pasta do projeto:

```bash
python -m http.server 8080
```

Depois acesse:

- `http://localhost:8080/`
- `http://localhost:8080/admin/`

## Admin

O painel usa login do Supabase. Apenas usuarios cadastrados na tabela `admin_users` podem criar, editar ou remover produtos.

## Publicacao

Para publicar em hospedagem comum, envie estes arquivos e pastas para a `public_html`:

- `index.html`
- `style.css`
- `main.js`
- `.htaccess`
- `admin/`
- `backend/`
- `images/`
- `fontes/`
- `data/`

Nao envie as pastas `publicacao-hostinger-*`; elas sao pacotes temporarios e ficam ignoradas pelo Git.
