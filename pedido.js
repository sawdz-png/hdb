// ============================================================
// PEDIDO.HTML — arma el formulario a partir de MENU y envía
// el pedido a Supabase.
// ============================================================

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// cart: { productId: qty }
const cart = {};

function money(n) {
  return "$" + n.toLocaleString("es-AR");
}

function renderGroup(title, products) {
  const group = document.createElement("div");
  group.className = "product-group";

  const heading = document.createElement("h2");
  heading.className = "product-group__title";
  heading.textContent = title;
  group.appendChild(heading);

  products.forEach((p) => {
    const row = document.createElement("div");
    row.className = "product-row";
    row.innerHTML = `
      <div class="product-row__info">
        <div class="product-row__name">${p.name}</div>
        ${p.variant ? `<div class="product-row__variant">${p.variant}</div>` : ""}
      </div>
      <div class="product-row__price">${money(p.price)}</div>
      <div class="qty-stepper">
        <button type="button" data-action="minus" data-id="${p.id}" aria-label="Restar">−</button>
        <span id="qty-${p.id}">0</span>
        <button type="button" data-action="plus" data-id="${p.id}" aria-label="Sumar">+</button>
      </div>
    `;
    group.appendChild(row);
  });

  return group;
}

function buildMenu() {
  const container = document.getElementById("menuContainer");
  container.appendChild(renderGroup("Hamburguesas", MENU.hamburguesas));
  container.appendChild(renderGroup("Papas fritas", MENU.papas));
  container.appendChild(renderGroup("Extras", MENU.extras));
}

function allProducts() {
  return [...MENU.hamburguesas, ...MENU.papas, ...MENU.extras];
}

function findProduct(id) {
  return allProducts().find((p) => p.id === id);
}

function updateCartBar() {
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = findProduct(id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
  document.getElementById("cartCount").textContent =
    count === 1 ? "1 producto" : `${count} productos`;
  document.getElementById("cartTotal").textContent = money(total);
}

document.getElementById("menuContainer").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const current = cart[id] || 0;
  const next = btn.dataset.action === "plus" ? current + 1 : Math.max(0, current - 1);
  if (next === 0) delete cart[id];
  else cart[id] = next;
  document.getElementById(`qty-${id}`).textContent = next;
  updateCartBar();
});

// mostrar/ocultar campo de dirección
document.querySelectorAll('input[name="orderType"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const addressField = document.getElementById("addressField");
    const addressInput = document.getElementById("address");
    const isDelivery = document.querySelector('input[name="orderType"]:checked').value === "delivery";
    addressField.style.display = isDelivery ? "block" : "none";
    addressInput.required = isDelivery;
  });
});

document.getElementById("orderForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const errorEl = document.getElementById("formError");
  errorEl.classList.remove("is-visible");

  const itemIds = Object.keys(cart);
  if (itemIds.length === 0) {
    errorEl.textContent = "Elegí al menos un producto antes de enviar el pedido.";
    errorEl.classList.add("is-visible");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const items = itemIds.map((id) => {
    const p = findProduct(id);
    return {
      name: p.name,
      variant: p.variant,
      qty: cart[id],
      price: p.price,
      subtotal: p.price * cart[id],
    };
  });
  const total = items.reduce((sum, it) => sum + it.subtotal, 0);

  const orderType = document.querySelector('input[name="orderType"]:checked').value;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

  const payload = {
    customer_name: document.getElementById("customerName").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    order_type: orderType,
    address: orderType === "delivery" ? document.getElementById("address").value.trim() : null,
    payment_method: paymentMethod,
    items: items,
    notes: document.getElementById("notes").value.trim() || null,
    total: total,
    status: "pendiente",
  };

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  const { data, error } = await sb.rpc("create_order", {
    p_customer_name: payload.customer_name,
    p_phone: payload.phone,
    p_order_type: payload.order_type,
    p_address: payload.address,
    p_payment_method: payload.payment_method,
    p_items: items,
    p_notes: payload.notes,
    p_total: total,
  });

  if (error) {
    console.error(error);
    errorEl.textContent = "No pudimos enviar el pedido. Probá de nuevo en unos segundos.";
    errorEl.classList.add("is-visible");
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar pedido";
    return;
  }

  document.getElementById("orderStep").style.display = "none";
  document.getElementById("confirmStep").style.display = "block";
  document.getElementById("orderNumber").textContent = `Pedido N.º ${data}`;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

buildMenu();
updateCartBar();
