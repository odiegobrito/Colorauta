const state = {
  db: { categories: [], products: [] },
  selectedId: null,
  search: "",
  searchTimer: null,
};

const REQUEST_TIMEOUT_MS = 18000;

const els = {
  status: document.querySelector("#statusMessage"),
  loginPanel: document.querySelector("#loginPanel"),
  loginForm: document.querySelector("#loginForm"),
  loginEmail: document.querySelector("#loginEmail"),
  loginPassword: document.querySelector("#loginPassword"),
  logoutButton: document.querySelector("#logoutButton"),
  logoutButtonMobile: document.querySelector("#logoutButtonMobile"),
  adminContent: document.querySelector("#adminContent"),
  productCount: document.querySelector("#productCount"),
  productList: document.querySelector("#productList"),
  form: document.querySelector("#productForm"),
  formTitle: document.querySelector("#formTitle"),
  categoryOptions: document.querySelector("#categoryOptions"),
  variantsList: document.querySelector("#variantsList"),
  searchInput: document.querySelector("#searchInput"),
  imageFile: document.querySelector("#imageFile"),
  newProductButton: document.querySelector("#newProductButton"),
  duplicateButton: document.querySelector("#duplicateButton"),
  deleteButton: document.querySelector("#deleteButton"),
  addVariantButton: document.querySelector("#addVariantButton"),
  summaryProducts: document.querySelector("#summaryProducts"),
  summaryFeatured: document.querySelector("#summaryFeatured"),
  summaryCategories: document.querySelector("#summaryCategories"),
  previewImage: document.querySelector("#previewImage"),
  previewEmoji: document.querySelector("#previewEmoji"),
  previewCategory: document.querySelector("#previewCategory"),
  previewName: document.querySelector("#previewName"),
  previewPrice: document.querySelector("#previewPrice"),
};

const fields = {
  name: document.querySelector("#name"),
  category: document.querySelector("#category"),
  image: document.querySelector("#image"),
  emoji: document.querySelector("#emoji"),
  badge: document.querySelector("#badge"),
  deliveryTime: document.querySelector("#deliveryTime"),
  availability: document.querySelector("#availability"),
  featured: document.querySelector("#featured"),
  bestSeller: document.querySelector("#bestSeller"),
  description: document.querySelector("#description"),
  details: document.querySelector("#details"),
};

init();

async function init() {
  try {
    bindEvents();

    if (!window.ColorautaDB?.isConfigured()) {
      showLogin("Configure o Supabase para ativar o painel online.", "error");
      return;
    }

    const user = await withTimeout(
      window.ColorautaDB.getCurrentUser(),
      "Não consegui verificar a sessão. Entre novamente.",
    );

    if (user) {
      await loadDatabase();
      return;
    }
  } catch (error) {
    console.error(error);
    showLogin("Não consegui iniciar o painel. Atualize a página e tente novamente.", "error");
    return;
  }

  showLogin("Entre para gerenciar os produtos.", "success");
}

function showLogin(message, type = "success") {
  setHidden(els.loginPanel, false);
  setHidden(els.adminContent, true);
  setHidden(els.logoutButton, true);
  setHidden(els.logoutButtonMobile, true);
  setStatus(message, type);
}

async function signOut() {
  await window.ColorautaDB.signOut();
  state.db = { categories: [], products: [] };
  state.selectedId = null;
  setHidden(els.adminContent, true);
  setHidden(els.loginPanel, false);
  setHidden(els.logoutButton, true);
  setHidden(els.logoutButtonMobile, true);
  els.loginPassword.value = "";
  renderSummary();
  setStatus("Você saiu do painel administrativo.", "success");
}

function bindEvents() {
  els.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await signIn();
  });

  [els.logoutButton, els.logoutButtonMobile].forEach((button) => {
    if (!button) return;
    button.addEventListener("click", signOut);
  });

  els.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveCurrentProduct();
  });

  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    window.clearTimeout(state.searchTimer);
    state.searchTimer = window.setTimeout(renderProductList, 120);
  });

  els.newProductButton.addEventListener("click", () => {
    state.selectedId = null;
    fillForm(createEmptyProduct());
    renderProductList();
    setStatus("Novo produto pronto para preenchimento.", "success");
  });

  els.duplicateButton.addEventListener("click", async () => {
    const product = getSelectedProduct();
    if (!product) return;
    const copy = structuredClone(product);
    delete copy.id;
    copy.name = `${product.name} - cópia`;
    const savedId = await window.ColorautaDB.saveProduct(copy);
    await loadDatabase(savedId, "Produto duplicado.");
  });

  els.deleteButton.addEventListener("click", async () => {
    const product = getSelectedProduct();
    if (!product) return;
    const ok = window.confirm(`Remover "${product.name}" do catálogo?`);
    if (!ok) return;
    await window.ColorautaDB.deleteProduct(product.id);
    await loadDatabase(null, "Produto removido.");
  });

  els.addVariantButton.addEventListener("click", () => {
    addVariantRow({ label: "", price: 0 });
  });

  els.imageFile.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadImage(file);
    event.target.value = "";
  });

  els.form.addEventListener("input", updatePreviewFromForm);
}

async function signIn() {
  try {
    setStatus("Entrando...", "success");
    await withTimeout(
      window.ColorautaDB.signIn(
        els.loginEmail.value.trim(),
        els.loginPassword.value,
      ),
      "O login demorou demais. Tente novamente em alguns instantes.",
    );
    await loadDatabase();
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Não foi possível entrar. Confira e-mail e senha.", "error");
  }
}

async function loadDatabase(preferredId = null, message = "Catálogo carregado.") {
  try {
    const data = await withTimeout(
      window.ColorautaDB.fetchCatalog({ admin: true }),
      "O carregamento dos produtos demorou demais. Tente atualizar a página.",
    );
    state.db = normalizeDatabase(data);
    state.selectedId = preferredId || state.db.products[0]?.id || null;
    setHidden(els.loginPanel, true);
    setHidden(els.adminContent, false);
    setHidden(els.logoutButton, false);
    setHidden(els.logoutButtonMobile, false);
    render();
    setStatus(message, "success");
  } catch (error) {
    console.error(error);
    showLogin(error.message || "Não consegui carregar os produtos. Entre novamente.", "error");
  }
}

function normalizeDatabase(data) {
  const products = Array.isArray(data.products)
    ? data.products.map((product, index) => normalizeProduct(product, index))
    : [];
  const categories = Array.isArray(data.categories) ? data.categories : [];

  for (const product of products) {
    if (product.category && !categories.includes(product.category)) {
      categories.push(product.category);
    }
  }

  return { categories, products };
}

function normalizeProduct(product, index) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  return {
    id: product.id || createSlugId(product.name || "produto", index),
    name: product.name || "",
    category: product.category || "",
    emoji: product.emoji || "📦",
    image: product.image || "",
    description: product.description || "",
    color: product.color || "#c11c84",
    color2: product.color2 || "#058f9c",
    badge: product.badge || null,
    featured: Boolean(product.featured),
    bestSeller: Boolean(product.bestSeller),
    active: product.active !== false,
    deliveryTime: product.deliveryTime || "Sob consulta",
    availability: product.availability || "Disponível para orçamento",
    details: Array.isArray(product.details) ? product.details : [],
    oldPrice: product.oldPrice || null,
    variants,
    selectedVariant: product.selectedVariant || variants[0]?.label || "",
  };
}

function render() {
  renderSummary();
  renderCategoryOptions();
  renderProductList();
  fillForm(getSelectedProduct() || createEmptyProduct());
}

function renderSummary() {
  els.summaryProducts.textContent = state.db.products.length;
  els.summaryFeatured.textContent = state.db.products.filter((product) => product.featured).length;
  els.summaryCategories.textContent = state.db.categories.length;
}

function renderCategoryOptions() {
  els.categoryOptions.innerHTML = state.db.categories
    .map((category) => `<option value="${escapeHtml(category)}"></option>`)
    .join("");
}

function renderProductList() {
  const products = getVisibleProducts();
  els.productCount.textContent = `${state.db.products.length} produtos cadastrados`;
  renderSummary();

  if (!products.length) {
    els.productList.innerHTML = `
      <div class="admin-product-item">
        <div class="admin-product-name">Nenhum produto encontrado</div>
        <div class="admin-product-meta">Tente outro termo de busca.</div>
      </div>
    `;
    return;
  }

  els.productList.innerHTML = products
    .map(
      (product) => `
        <button
          class="admin-product-item ${product.id === state.selectedId ? "active" : ""}"
          type="button"
          data-product-id="${escapeHtml(String(product.id))}"
        >
          <span class="admin-product-thumb">
            ${product.image ? `<img src="${escapeHtml(getAdminImageSrc(product.image))}" alt="" loading="lazy" />` : `<span>${escapeHtml(product.emoji || "📦")}</span>`}
          </span>
          <span class="admin-product-top">
            <span class="admin-product-name">${escapeHtml(product.name || "Produto sem título")}</span>
            ${product.featured ? '<span class="admin-featured-pill">Destaque</span>' : ""}
            ${product.bestSeller ? '<span class="admin-featured-pill">Mais vendido</span>' : ""}
          </span>
          <span class="admin-product-meta">${escapeHtml(product.category || "Sem categoria")} · ${product.variants.length} variações</span>
        </button>
      `,
    )
    .join("");

  els.productList.querySelectorAll("[data-product-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedId = parseId(button.dataset.productId);
      renderProductList();
      fillForm(getSelectedProduct());
    });
  });
}

function fillForm(product) {
  els.formTitle.textContent = product.id ? "Editar produto" : "Novo produto";
  fields.name.value = product.name || "";
  fields.category.value = product.category || "";
  fields.image.value = product.image || "";
  fields.emoji.value = product.emoji || "📦";
  fields.badge.value = product.badge || "";
  fields.deliveryTime.value = product.deliveryTime || "";
  fields.availability.value = product.availability || "";
  fields.featured.checked = Boolean(product.featured);
  fields.bestSeller.checked = Boolean(product.bestSeller);
  fields.description.value = product.description || "";
  fields.details.value = (product.details || []).join("\n");
  renderVariantRows(product.variants && product.variants.length ? product.variants : [{ label: "", price: 0 }]);
  updatePreviewFromForm();
}

function renderVariantRows(variants) {
  els.variantsList.innerHTML = "";
  variants.forEach((variant) => addVariantRow(variant));
}

function addVariantRow(variant) {
  const row = document.createElement("div");
  row.className = "variant-row";
  row.innerHTML = `
    <input class="admin-input variant-label" placeholder="Ex: 100 un. Só frente" value="${escapeHtml(variant.label || "")}" />
    <input class="admin-input variant-price" inputmode="decimal" placeholder="R$ 0,00" value="${formatCurrencyInput(variant.price || 0)}" />
    <button class="variant-remove" type="button">Remover</button>
  `;
  row.querySelector(".variant-remove").addEventListener("click", () => {
    row.remove();
    if (!els.variantsList.children.length) addVariantRow({ label: "", price: 0 });
    updatePreviewFromForm();
  });
  row.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", updatePreviewFromForm);
  });
  els.variantsList.appendChild(row);
}

async function saveCurrentProduct() {
  try {
    setStatus("Salvando produto...", "success");
    const product = readFormProduct();
    const current = getSelectedProduct();
    if (current) product.id = current.id;
    const savedId = await window.ColorautaDB.saveProduct(product);
    const savedProduct = { ...product, id: savedId };
    const index = state.db.products.findIndex((item) => item.id === savedId);

    if (index >= 0) {
      state.db.products.splice(index, 1, savedProduct);
    } else {
      state.db.products.unshift(savedProduct);
    }

    if (savedProduct.category && !state.db.categories.includes(savedProduct.category)) {
      state.db.categories.push(savedProduct.category);
    }

    state.selectedId = savedId;
    render();
    setStatus("Produto salvo e publicado no catálogo.", "success");
  } catch (error) {
    console.error(error);
    setStatus("Não foi possível salvar. Confira os campos e permissões.", "error");
  }
}

async function uploadImage(file) {
  try {
    setStatus("Enviando foto...", "success");
    const url = await window.ColorautaDB.uploadProductImage(file);
    fields.image.value = url;
    updatePreviewFromForm();
    setStatus("Foto enviada. Agora salve o produto.", "success");
  } catch (error) {
    console.error(error);
    setStatus("Não foi possível enviar a foto. Confira o Storage do Supabase.", "error");
  }
}

function readFormProduct() {
  const variants = [...els.variantsList.querySelectorAll(".variant-row")]
    .map((row) => ({
      label: row.querySelector(".variant-label").value.trim(),
      price: parseCurrencyToCents(row.querySelector(".variant-price").value),
    }))
    .filter((variant) => variant.label);

  return {
    name: fields.name.value.trim(),
    category: fields.category.value.trim(),
    emoji: fields.emoji.value.trim() || "📦",
    image: fields.image.value.trim(),
    description: fields.description.value.trim(),
    color: "#c11c84",
    color2: "#058f9c",
    badge: fields.badge.value.trim() || null,
    featured: fields.featured.checked,
    bestSeller: fields.bestSeller.checked,
    active: true,
    deliveryTime: fields.deliveryTime.value.trim() || "Sob consulta",
    availability: fields.availability.value.trim() || "Disponível para orçamento",
    details: fields.details.value
      .split("\n")
      .map((detail) => detail.trim())
      .filter(Boolean),
    oldPrice: null,
    variants,
    selectedVariant: variants[0]?.label || "",
  };
}

function updatePreviewFromForm() {
  const name = fields.name.value.trim() || "Nome do produto";
  const category = fields.category.value.trim() || "Categoria";
  const image = fields.image.value.trim();
  const emoji = fields.emoji.value.trim() || "📦";
  const firstVariantPrice = parseCurrencyToCents(
    els.variantsList.querySelector(".variant-price")?.value || "0",
  );

  els.previewName.textContent = name;
  els.previewCategory.textContent = category;
  els.previewPrice.textContent = formatPrice(firstVariantPrice);
  els.previewEmoji.textContent = emoji;

  if (image) {
    els.previewImage.src = getAdminImageSrc(image);
    els.previewImage.hidden = false;
    els.previewEmoji.hidden = true;
  } else {
    els.previewImage.removeAttribute("src");
    els.previewImage.hidden = true;
    els.previewEmoji.hidden = false;
  }
}

function getSelectedProduct() {
  return state.db.products.find((product) => product.id === state.selectedId);
}

function getVisibleProducts() {
  if (!state.search) return state.db.products;
  return state.db.products.filter((product) =>
    [product.name, product.category, product.description]
      .join(" ")
      .toLowerCase()
      .includes(state.search),
  );
}

function createEmptyProduct() {
  return {
    id: null,
    name: "",
    category: "",
    emoji: "📦",
    image: "",
    description: "",
    color: "#c11c84",
    color2: "#058f9c",
    badge: null,
    featured: true,
    bestSeller: false,
    active: true,
    deliveryTime: "3 a 5 dias úteis",
    availability: "Disponível para orçamento",
    details: [],
    oldPrice: null,
    variants: [{ label: "100 un. Só frente", price: 0 }],
    selectedVariant: "100 un. Só frente",
  };
}

function createSlugId(name, index) {
  return `${name}-${index + 1}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseCurrencyToCents(value) {
  const normalized = String(value)
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return Math.round((Number.parseFloat(normalized) || 0) * 100);
}

function formatCurrencyInput(cents) {
  return (Number(cents || 0) / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPrice(cents) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(cents || 0) / 100);
}

function parseId(value) {
  const numberId = Number(value);
  return Number.isFinite(numberId) && String(numberId) === value ? numberId : value;
}

function setStatus(message, type = "") {
  els.status.textContent = message;
  els.status.className = `admin-status mb-6 ${type}`.trim();
}

function setHidden(element, hidden) {
  if (element) element.hidden = hidden;
}

function getAdminImageSrc(src) {
  if (!src || /^(https?:|data:|blob:)/i.test(src)) return src;
  if (src.startsWith("../")) return src;
  return `../${src.replace(/^\.\//, "")}`;
}

function withTimeout(promise, message) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), REQUEST_TIMEOUT_MS);
  });

  return Promise.race([promise, timeout]).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
