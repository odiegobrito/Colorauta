/* ===========================================================
   script.js — Renderização SOMENTE quando o usuário clica
   =========================================================== */

/* -----------------------------
   Dados dos produtos
   ----------------------------- */
const produtos = [
  {
    nome: "Cartão de Visita",
    categoria: "cartoes",
    imagem: "images/cartao.png",
    precos: {
      frente: {100: 35, 250: 50, 500: 70, 1000: 85},
      frenteVerso: {100: 45, 250: 65, 500: 85, 1000: 100}
    },
    tipo: true
  },
  {
    nome: "Panfleto",
    categoria: "cartoes",
    imagem: "images/panfleto.png",
    precos: {
      frente: {100: 80, 250: 100, 500: 120, 1000: 150},
      frenteVerso: {100: 100, 250: 120, 500: 150, 1000: 180}
    },
    tipo: true
  },
  {
    nome: "Adesivo",
    categoria: "adesivos",
    imagem: "images/adesivo.jpg",
    precos: {100: 20, 250: 50, 500: 100, 1000: 200},
    tipo: false
  },
  {
    nome: "Banner",
    categoria: "banners",
    imagem: "images/banner.jpg",
    precos: {1: 30, 2: 60, 5: 150, 10: 300},
    tipo: false
  },
  {
    nome: "Buquê de Borboleta LED",
    categoria: "buques",
    imagem: "images/buque.jpg",
    precos: {10: 46, 20: 66, 30: 88, 40: 110},
    tipo: false
  }
];

/* -----------------------------
   Estado global
   ----------------------------- */
let carrinho = [];

/* -----------------------------
   Mapeamento dos containers
   ----------------------------- */
const mapCategorias = {
  cartoes: "produtos-cartoes",
  adesivos: "produtos-adesivos",
  banners: "produtos-banners",
  buques: "produtos-buques"
};

/* -----------------------------
   Limpar todas as categorias
   ----------------------------- */
function limparCategorias() {
  Object.values(mapCategorias).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = "";
      el.style.display = "none"; // 🔥 não exibe nada até clicar
    }
  });
}

/* -----------------------------
   Renderizar SOMENTE a categoria clicada
   ----------------------------- */
function renderizarCategoria(cat) {
  limparCategorias();

  const destinoId = mapCategorias[cat];
  const destino = document.getElementById(destinoId);
  if (!destino) return;

  destino.style.display = "grid"; 

  const lista = produtos.filter(p => p.categoria === cat);

  lista.forEach((p, indexAtual) => {
    const quantidades = p.tipo ? Object.keys(p.precos.frente) : Object.keys(p.precos);

    const options = quantidades
      .map(q => `<option value="${q}">${q} un.</option>`)
      .join("");

    const tipoHTML = p.tipo ? `
      <label class="block mt-2 text-sm font-medium">Tipo</label>
      <select id="tipo-${indexAtual}" class="w-full border rounded-lg p-2" data-index="${indexAtual}">
        <option value="frente">Frente</option>
        <option value="frenteVerso">Frente e Verso</option>
      </select>
    ` : "";

    const card = document.createElement("div");
    card.className =
      "bg-white p-5 rounded-2xl shadow hover:shadow-xl transition transform hover:-translate-y-1";

    card.innerHTML = `
      <img src="${p.imagem}" class="rounded-xl mb-3 h-48 w-full object-cover">
      <h3 class="text-xl font-semibold">${p.nome}</h3>
      ${tipoHTML}
      <label class="block mt-3 text-sm font-medium">Quantidade</label>
      <select id="qtd-${indexAtual}" data-index="${indexAtual}" class="w-full border rounded-lg p-2 select-qtd">
        <option value="">Selecione</option>
        ${options}
      </select>
      <p class="mt-3 text-lg font-semibold text-gray-800">
        Preço: R$ <span id="preco-${indexAtual}">0,00</span>
      </p>
    `;

    destino.appendChild(card);
  });
}

/* -----------------------------
   Cálculo de preço
   ----------------------------- */
function calcularPreco(produto, qtd, tipo) {
  if (!qtd) return 0;
  return produto.tipo
    ? (produto.precos[tipo]?.[qtd] ?? 0)
    : (produto.precos[qtd] || 0);
}

/* -----------------------------
   Atualizar preço
   ----------------------------- */
function atualizarPreco(i) {
  const p = produtos[i];
  const qtd = document.getElementById(`qtd-${i}`)?.value || "";
  const tipo = p.tipo ? document.getElementById(`tipo-${i}`)?.value : "padrão";
  const precoSpan = document.getElementById(`preco-${i}`);

  if (!qtd) {
    precoSpan.textContent = "0,00";
    carrinho[i] = null;
    atualizarResumo();
    return;
  }

  const preco = calcularPreco(p, qtd, tipo);
  precoSpan.textContent = preco.toFixed(2);

  carrinho[i] = { nome: p.nome, qtd, preco, tipo };
  atualizarResumo();
}

/* -----------------------------
   Resumo do carrinho
   ----------------------------- */
function atualizarResumo() {
  const resumo = document.getElementById("resumo");
  const totalEl = document.getElementById("total");
  const boxResumo = document.getElementById("box-resumo");

  resumo.innerHTML = "";
  let total = 0;
  let temItens = false;

  carrinho.forEach(item => {
    if (!item) return;

    temItens = true;

    const tipoTXT =
      item.tipo === "frente" ? " (Frente)" :
      item.tipo === "frenteVerso" ? " (Frente e Verso)" :
      "";

    resumo.innerHTML += `<p>${item.nome}${tipoTXT} - ${item.qtd} un.: R$ ${item.preco.toFixed(2)}</p>`;
    total += item.preco;
  });

  totalEl.textContent = total.toFixed(2);

  // 📌 Se não tiver itens → esconde tudo
  if (!temItens) {
    boxResumo.classList.add("hidden");
  } else {
    boxResumo.classList.remove("hidden");
  }
}



/* -----------------------------
   WhatsApp
   ----------------------------- */
function enviarWhatsApp() {
  let msg = "🖨️ *Pedido Colorauta*%0A";
  let total = 0;

  carrinho.forEach(item => {
    if (!item) return;

    const tipoTXT =
      item.tipo === "frente" ? " (Frente)" :
      item.tipo === "frenteVerso" ? " (Frente e Verso)" :
      "";

    msg += `• ${item.nome}${tipoTXT} - ${item.qtd} un.: R$ ${item.preco.toFixed(2)}%0A`;
    total += item.preco;
  });

  msg += `%0A💰 *Total: R$ ${total.toFixed(2)}*`;
  window.open(`https://wa.me/5521986473364?text=${msg}`, "_blank");
}

/* -----------------------------
   Sidebar mobile
   ----------------------------- */
const sidebar = document.getElementById("sidebar");
const btnMenu = document.getElementById("btnMenu");

if (btnMenu) {
  btnMenu.addEventListener("click", () => {
    sidebar.classList.toggle("-translate-x-full");
  });
}

/* -----------------------------
   Menu lateral → Renderizar categoria
   ----------------------------- */
document.querySelectorAll("a.spy").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();

    const href = link.getAttribute("href"); // ex: #categoria-cartoes
    const categoria = href.replace("#categoria-", "");

    renderizarCategoria(categoria);

    const alvo = document.querySelector(href);
    const top = alvo.offsetTop - 80;

    window.scrollTo({ top, behavior: "smooth" });

    if (window.innerWidth < 768) {
      sidebar.classList.add("-translate-x-full");
    }
  });
});

/* -----------------------------
   Delegação de eventos
   ----------------------------- */
document.addEventListener("change", e => {
  const t = e.target;

  if (t.classList.contains("select-qtd")) {
    atualizarPreco(Number(t.dataset.index));
  }

  if (t.id.startsWith("tipo-")) {
    atualizarPreco(Number(t.dataset.index));
  }
});

/* -----------------------------
   INIT — Tudo oculto
   ----------------------------- */
(function init() {
  carrinho = new Array(produtos.length).fill(null);
  limparCategorias(); 
})();
