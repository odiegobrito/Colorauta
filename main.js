function store() {
  return {
    cart: [],
    cartOpen: false,
    productModalOpen: false,
    selectedProduct: null,
    activeCategory: "",
    toast: { show: false, msg: "" },
    categories: [],
    products: [],
    featuredProductsCache: [],
    bestSellerProductsCache: [],
    featuredCategoriesCache: [],
    productsLoaded: false,
    productsError: false,

    async init() {
      await this.loadProducts();
    },

    async loadProducts() {
      this.productsLoaded = false;
      this.productsError = false;

      try {
        const database =
          window.ColorautaDB?.isConfigured()
            ? await window.ColorautaDB.fetchCatalog()
            : await this.fetchProductDatabase();
        this.categories = Array.isArray(database.categories) ? database.categories : [];
        this.products = Array.isArray(database.products)
          ? database.products.map((product, index) => this.normalizeProduct(product, index))
          : [];
        this.updateProductIndexes();

        if (this.activeCategory && !this.catalogCategories.includes(this.activeCategory)) {
          this.activeCategory = this.catalogCategories[0] || "";
        }

        if (!this.activeCategory && this.catalogCategories.length) {
          this.activeCategory = this.catalogCategories[0];
        }

        window.dispatchEvent(new CustomEvent("products-loaded"));
      } catch (error) {
        console.error(error);
        this.productsError = true;
        this.products = [];
        this.updateProductIndexes();
      } finally {
        this.productsLoaded = true;
      }
    },

    async fetchProductDatabase() {
      const response = await fetch("data/produtos.json");
      if (!response.ok) {
        throw new Error(`Erro ao carregar produtos: ${response.status}`);
      }
      return response.json();
    },

    updateProductIndexes() {
      this.featuredProductsCache = this.products.filter((p) => p.featured);
      this.bestSellerProductsCache = this.featuredProductsCache.filter((p) => p.bestSeller);
      this.featuredCategoriesCache = this.categories.filter((category) =>
        this.featuredProductsCache.some((p) => p.category === category),
      );
    },

    normalizeProduct(product, index = 0) {
      const variants = Array.isArray(product.variants) ? product.variants : [];
      return {
        id: product.id || this.createProductId(product, index),
        name: product.name || "Produto sem nome",
        category: product.category || "Sem categoria",
        emoji: product.emoji || "📦",
        image: product.image || "",
        description: product.description || "",
        color: product.color || "#c11c84",
        color2: product.color2 || "#058f9c",
        badge: product.badge || null,
        featured: Boolean(product.featured),
        bestSeller: Boolean(product.bestSeller),
        deliveryTime: product.deliveryTime || "Sob consulta",
        availability: product.availability || "Disponível para orçamento",
        details: Array.isArray(product.details) ? product.details : [],
        oldPrice: product.oldPrice || null,
        variants,
        selectedVariant:
          product.selectedVariant || (variants[0] ? variants[0].label : ""),
      };
    },

    createProductId(product, index) {
      const base = `${product.name || "produto"}-${index + 1}`
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      return base || `produto-${index + 1}`;
    },

    variantPrice(p) {
      if (!p || !p.variants || !p.variants.length) return 0;
      const v = p.variants.find((variant) => variant.label === p.selectedVariant);
      return v ? v.price : p.variants[0].price;
    },

    get featuredProducts() {
      return this.featuredProductsCache;
    },

    get bestSellerProducts() {
      return this.bestSellerProductsCache;
    },

    get featuredCategories() {
      return this.featuredCategoriesCache;
    },

    get catalogCategories() {
      return this.bestSellerProductsCache.length
        ? ["Mais vendidos", ...this.featuredCategories]
        : this.featuredCategories;
    },

    get filteredProducts() {
      if (this.activeCategory === "Mais vendidos") return this.bestSellerProductsCache;
      if (!this.activeCategory) return this.bestSellerProductsCache.length
        ? this.bestSellerProductsCache
        : this.featuredProducts;
      return this.featuredProducts.filter((p) => p.category === this.activeCategory);
    },

    openProductModal(p) {
      this.selectedProduct = p;
      this.productModalOpen = true;
      document.body.classList.add("modal-open");
    },

    closeProductModal() {
      this.productModalOpen = false;
      this.selectedProduct = null;
      document.body.classList.remove("modal-open");
    },

    get totalItems() {
      return this.cart.reduce((s, i) => s + i.qty, 0);
    },

    get cartTotal() {
      return this.cart.reduce((s, i) => s + i.price * i.qty, 0);
    },

    formatPrice(v) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(v / 100);
    },

    addToCart(p) {
      const variant = p.selectedVariant || "";
      const price = this.variantPrice(p);
      const existing = this.cart.find(
        (i) => i.id === p.id && i.variant === variant,
      );

      if (existing) {
        existing.qty++;
      } else {
        this.cart.push({
          id: p.id,
          name: p.name,
          emoji: p.emoji,
          image: p.image || "",
          price,
          color: p.color,
          color2: p.color2,
          variant,
          qty: 1,
        });
      }

      this.showToast(`"${p.name}" adicionado ao carrinho!`);
    },

    increaseQty(i) {
      this.cart[i].qty++;
    },

    decreaseQty(i) {
      if (this.cart[i].qty > 1) this.cart[i].qty--;
      else this.cart.splice(i, 1);
    },

    removeItem(i) {
      this.cart.splice(i, 1);
    },

    showToast(msg) {
      this.toast = { show: true, msg };
      setTimeout(() => {
        this.toast.show = false;
      }, 2800);
    },

    finalizarPedido() {
      if (!this.cart.length) return;

      const lines = this.cart
        .map(
          (i) =>
            `• ${i.name}${i.variant ? " (" + i.variant + ")" : ""} x${i.qty} — ${this.formatPrice(i.price * i.qty)}`,
        )
        .join("\n");
      const total = this.formatPrice(this.cartTotal);
      const msg = `🎨 *Olá, Colorauta!*\n\nGostaria de fazer um pedido:\n\n${lines}\n\n*Total: ${total}*\n\nAguardo retorno, obrigado!`;
      const phone = "5521986473364";
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");
    },
  };
}
