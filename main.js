function store() {
      return {
        cart: [],
        cartOpen: false,
        activeCategory: 'Todos',
        toast: { show: false, msg: '' },

        categories: ['Impressão', 'Adesivos', 'Banners', 'Brindes', 'Papelaria'],

        products: [
          {
            id: 1, name: 'Cartão de Visita', category: 'Papelaria',
            emoji: '🪪', description: '1000 unidades, couchê 300g',
            color: '#7B2FFF', color2: '#FF2D78', badge: '🔥 Mais Vendido',
            oldPrice: null,
            variants: [
              { label: 'Fosco 4/0',        price: 4990 },
              { label: 'Fosco 4/4',        price: 6490 },
              { label: 'Verniz 4/0',       price: 6490 },
              { label: 'Verniz 4/4',       price: 7990 },
              { label: 'Laminação 4/0',    price: 7490 },
              { label: 'Laminação 4/4',    price: 8990 },
            ],
            selectedVariant: 'Fosco 4/0',
          },
          {
            id: 2, name: 'Banner Lona 1x2m', category: 'Banners',
            emoji: '🏷️', description: 'Impressão digital, acabamento com ilhoses',
            color: '#FF6B00', color2: '#FFD600', badge: null,
            oldPrice: null,
            variants: [
              { label: 'Com Ilhoses',      price: 7990 },
              { label: 'Com Bainhas',      price: 8490 },
            ],
            selectedVariant: 'Com Ilhoses',
          },
          {
            id: 3, name: 'Adesivo Vinil', category: 'Adesivos',
            emoji: '🏷️', description: 'Corte especial, impressão UV',
            color: '#00B4FF', color2: '#7B2FFF', badge: '🆕 Novo',
            oldPrice: null,
            variants: [
              { label: 'A4',  price: 2500 },
              { label: 'A3',  price: 4200 },
              { label: 'A2',  price: 7500 },
            ],
            selectedVariant: 'A4',
          },
          {
            id: 4, name: 'Flyer 14x20', category: 'Impressão',
            emoji: '📄', description: 'Couchê 90g, impressão colorida',
            color: '#FF2D78', color2: '#FF6B00', badge: '💥 Oferta',
            oldPrice: null,
            variants: [
              { label: '1000 un. 4/0',  price: 3990 },
              { label: '1000 un. 4/4',  price: 4990 },
              { label: '2500 un. 4/0',  price: 2980 },
              { label: '2500 un. 4/4',  price: 7490 },
              { label: '5000 un. 4/0',  price: 9990 },
              { label: '5000 un. 4/4',  price: 12490 },
            ],
            selectedVariant: '1000 un. 4/0',
          },
          {
            id: 5, name: 'Caneca Cerâmica', category: 'Brindes',
            emoji: '☕', description: 'Sublimação full, capacidade 325ml',
            color: '#00F0FF', color2: '#00B4FF', badge: null,
            oldPrice: null,
            variants: [
              { label: 'Branca',  price: 3500 },
              { label: 'Mágica',  price: 4500 },
            ],
            selectedVariant: 'Branca',
          },
          {
            id: 6, name: 'Camiseta Estampada', category: 'Brindes',
            emoji: '👕', description: '100% algodão, estampa DTF full color',
            color: '#7B2FFF', color2: '#FF2D78', badge: null,
            oldPrice: null,
            variants: [
              { label: 'P',   price: 6500 },
              { label: 'M',   price: 6500 },
              { label: 'G',   price: 6500 },
              { label: 'GG',  price: 7500 },
            ],
            selectedVariant: 'M',
          },
          {
            id: 7, name: 'Folder A4 Dobrado', category: 'Papelaria',
            emoji: '📰', description: 'Couchê 150g, dobra dupla ou tripla',
            color: '#FFD600', color2: '#FF6B00', badge: null,
            oldPrice: null,
            variants: [
              { label: 'Dupla 4/0',   price: 2990 },
              { label: 'Dupla 4/4',   price: 3990 },
              { label: 'Tripla 4/0',  price: 3490 },
              { label: 'Tripla 4/4',  price: 4490 },
            ],
            selectedVariant: 'Dupla 4/0',
          },
          {
            id: 8, name: 'Lona Impressa 2x3m', category: 'Banners',
            emoji: '🖼️', description: 'Alta definição, resistente ao sol',
            color: '#FF6B00', color2: '#FF2D78', badge: '⭐ Premium',
            oldPrice: null,
            variants: [
              { label: 'Com Ilhoses',        price: 14990 },
              { label: 'Sem Acabamento',     price: 13490 },
            ],
            selectedVariant: 'Com Ilhoses',
          },
          {
            id: 9, name: 'Etiqueta Adesiva', category: 'Adesivos',
            emoji: '🔖', description: 'Rolo c/ 1000 un., impressão colorida',
            color: '#00B4FF', color2: '#00F0FF', badge: null,
            oldPrice: null,
            variants: [
              { label: 'Redonda',        price: 5990 },
              { label: 'Retangular',     price: 5990 },
              { label: 'Personalizada',  price: 7990 },
            ],
            selectedVariant: 'Redonda',
          },
          {
            id: 10, name: 'Envelope Personalizado', category: 'Papelaria',
            emoji: '✉️', description: 'Papel offset 90g, impressão colorida',
            color: '#7B2FFF', color2: '#00B4FF', badge: null,
            oldPrice: null,
            variants: [
              { label: 'Carta 4/0',  price: 1990 },
              { label: 'Carta 4/4',  price: 2490 },
              { label: 'Ofício 4/0', price: 2290 },
              { label: 'Ofício 4/4', price: 2790 },
            ],
            selectedVariant: 'Carta 4/0',
          },
          {
            id: 11, name: 'Squeeze Plástico', category: 'Brindes',
            emoji: '🧴', description: '600ml, impressão silk ou digital',
            color: '#FF2D78', color2: '#7B2FFF', badge: null,
            oldPrice: null,
            variants: [
              { label: 'Silk',     price: 2800 },
              { label: 'Digital',  price: 3200 },
            ],
            selectedVariant: 'Silk',
          },
          {
            id: 12, name: 'Calendário de Mesa', category: 'Papelaria',
            emoji: '📅', description: '12 folhas + capa, laminação fosca',
            color: '#FFD600', color2: '#00F0FF', badge: '🎄 Natal',
            oldPrice: null,
            variants: [
              { label: 'Horizontal', price: 4500 },
              { label: 'Vertical',   price: 4500 },
            ],
            selectedVariant: 'Horizontal',
          },
        ],

        variantPrice(p) {
          if (!p.variants || !p.variants.length) return 0;
          const v = p.variants.find(v => v.label === p.selectedVariant);
          return v ? v.price : p.variants[0].price;
        },

        get filteredProducts() {
          if (this.activeCategory === 'Todos') return this.products;
          return this.products.filter(p => p.category === this.activeCategory);
        },

        get totalItems() {
          return this.cart.reduce((s, i) => s + i.qty, 0);
        },

        get cartTotal() {
          return this.cart.reduce((s, i) => s + i.price * i.qty, 0);
        },

        formatPrice(v) {
          return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100);
        },

        addToCart(p) {
          const variant = p.selectedVariant || '';
          const price   = this.variantPrice(p);
          const existing = this.cart.find(i => i.id === p.id && i.variant === variant);
          if (existing) {
            existing.qty++;
          } else {
            this.cart.push({ id: p.id, name: p.name, emoji: p.emoji, price, color: p.color, color2: p.color2, variant, qty: 1 });
          }
          this.showToast(`"${p.name}" adicionado ao carrinho!`);
        },

        increaseQty(i) { this.cart[i].qty++; },

        decreaseQty(i) {
          if (this.cart[i].qty > 1) this.cart[i].qty--;
          else this.cart.splice(i, 1);
        },

        removeItem(i) { this.cart.splice(i, 1); },

        showToast(msg) {
          this.toast = { show: true, msg };
          setTimeout(() => { this.toast.show = false; }, 2800);
        },

        finalizarPedido() {
          if (!this.cart.length) return;
          const lines = this.cart.map(i =>
            `• ${i.name}${i.variant ? ' (' + i.variant + ')' : ''} x${i.qty} — ${this.formatPrice(i.price * i.qty)}`
          ).join('\n');
          const total = this.formatPrice(this.cartTotal);
          const msg = `🎨 *Olá, Colorauta!*\n\nGostaria de fazer um pedido:\n\n${lines}\n\n*Total: ${total}*\n\nAguardo retorno, obrigado!`;
          const phone = '55219986473364';
          const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
          window.open(url, '_blank');
        }
      }
    }
