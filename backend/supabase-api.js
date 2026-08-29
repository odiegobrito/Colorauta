(function () {
  const config = window.COLORAUTA_SUPABASE || {};

  function isConfigured() {
    return (
      config.url &&
      config.anonKey &&
      !config.url.includes("COLE_AQUI") &&
      !config.anonKey.includes("COLE_AQUI") &&
      window.supabase
    );
  }

  const client = isConfigured()
    ? window.supabase.createClient(config.url, config.anonKey)
    : null;

  function normalizeProduct(row) {
    const variants = Array.isArray(row.product_variants)
      ? row.product_variants.map((variant) => ({
          id: variant.id,
          label: variant.label,
          price: variant.price,
          sortOrder: variant.sort_order || 0,
        }))
      : [];

    return {
      id: row.id,
      name: row.name || "",
      category: row.category || "",
      emoji: row.emoji || "📦",
      image: row.image || "",
      description: row.description || "",
      color: row.color || "#c11c84",
      color2: row.color2 || "#058f9c",
      badge: row.badge || null,
      featured: Boolean(row.featured),
      bestSeller: Boolean(row.best_seller),
      active: row.active !== false,
      deliveryTime: row.delivery_time || "Sob consulta",
      availability: row.availability || "Disponível para orçamento",
      details: Array.isArray(row.details) ? row.details : [],
      oldPrice: row.old_price || null,
      variants,
      selectedVariant: row.selected_variant || variants[0]?.label || "",
    };
  }

  function toProductRow(product) {
    return {
      name: product.name,
      category: product.category,
      emoji: product.emoji || "📦",
      image: product.image || "",
      description: product.description || "",
      color: product.color || "#c11c84",
      color2: product.color2 || "#058f9c",
      badge: product.badge || null,
      featured: Boolean(product.featured),
      best_seller: Boolean(product.bestSeller),
      active: product.active !== false,
      delivery_time: product.deliveryTime || "Sob consulta",
      availability: product.availability || "Disponível para orçamento",
      details: Array.isArray(product.details) ? product.details : [],
      old_price: product.oldPrice || null,
      selected_variant: product.selectedVariant || product.variants?.[0]?.label || "",
    };
  }

  function toVariantRow(productId, variant, index) {
    return {
      product_id: productId,
      label: variant.label,
      price: Number(variant.price || 0),
      sort_order: index,
    };
  }

  async function getCurrentUser() {
    if (!client) return null;
    const { data, error } = await client.auth.getUser();
    if (error) return null;
    return data.user;
  }

  async function signIn(email, password) {
    if (!client) throw new Error("Supabase não configurado.");
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  }

  async function signOut() {
    if (!client) return;
    await client.auth.signOut();
  }

  async function fetchProducts({ admin = false } = {}) {
    if (!client) throw new Error("Supabase não configurado.");

    let query = client
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (!admin) query = query.eq("active", true);

    const { data, error } = await query;
    if (error) throw error;

    const productIds = data.map((product) => product.id);
    if (!productIds.length) return [];

    const { data: variants, error: variantsError } = await client
      .from("product_variants")
      .select("id, product_id, label, price, sort_order")
      .in("product_id", productIds)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });
    if (variantsError) throw variantsError;

    const variantsByProduct = new Map();
    for (const variant of variants || []) {
      const list = variantsByProduct.get(variant.product_id) || [];
      list.push(variant);
      variantsByProduct.set(variant.product_id, list);
    }

    return data.map((product) =>
      normalizeProduct({
        ...product,
        product_variants: variantsByProduct.get(product.id) || [],
      }),
    );
  }

  async function fetchCatalog({ admin = false } = {}) {
    const products = await fetchProducts({ admin });
    const categories = [...new Set(products.map((product) => product.category).filter(Boolean))];
    return { categories, products };
  }

  async function saveProduct(product) {
    if (!client) throw new Error("Supabase não configurado.");

    const row = toProductRow(product);
    const query = product.id
      ? client.from("products").update(row).eq("id", product.id).select().single()
      : client.from("products").insert(row).select().single();

    const { data, error } = await query;
    if (error) throw error;

    const productId = data.id;
    const variants = Array.isArray(product.variants) ? product.variants : [];
    const { error: deleteError } = await client
      .from("product_variants")
      .delete()
      .eq("product_id", productId);
    if (deleteError) throw deleteError;

    if (variants.length) {
      const { error: insertError } = await client
        .from("product_variants")
        .insert(variants.map((variant, index) => toVariantRow(productId, variant, index)));
      if (insertError) throw insertError;
    }

    return productId;
  }

  async function deleteProduct(id) {
    if (!client) throw new Error("Supabase não configurado.");
    const { error } = await client.from("products").delete().eq("id", id);
    if (error) throw error;
  }

  async function uploadProductImage(file) {
    if (!client) throw new Error("Supabase não configurado.");
    const extension = file.name.split(".").pop() || "jpg";
    const safeName = file.name
      .replace(/\.[^/.]+$/, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const path = `${Date.now()}-${safeName || "produto"}.${extension}`;

    const { error } = await client.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "31536000", upsert: false });
    if (error) throw error;

    const { data } = client.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }

  window.ColorautaDB = {
    client,
    isConfigured,
    getCurrentUser,
    signIn,
    signOut,
    fetchCatalog,
    saveProduct,
    deleteProduct,
    uploadProductImage,
  };
})();
