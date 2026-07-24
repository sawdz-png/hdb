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

document.querySelectorAll('input[name="orderType"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const addressField = document.getElementById("addressField");
    const addressInput = document.getElementById("address");
    const isDelivery = document.querySelector('input[name="orderType"]:checked').value === "delivery";
    addressField.style.display = isDelivery ? "block" : "none";
    addressInput.required = isDelivery;
  });
});

// mostrar el campo "¿con cuánto pagás?" solo si paga en efectivo
function updateCashField() {
  const isCash = document.querySelector('input[name="paymentMethod"]:checked').value === "efectivo";
  document.getElementById("cashField").style.display = isCash ? "block" : "none";
  if (!isCash) document.getElementById("cashAmount").value = "";
}
document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
  radio.addEventListener("change", updateCashField);
});

// hint en vivo del vuelto mientras escribe
document.getElementById("cashAmount").addEventListener("input", () => {
  const hint = document.getElementById("cashHint");
  const val = Number(document.getElementById("cashAmount").value);
  const total = currentTotal();
  if (!val || total === 0) { hint.textContent = ""; return; }
  if (val < total) {
    hint.textContent = `Ojo: el total es ${money(total)}, falta plata.`;
  } else if (val === total) {
    hint.textContent = "Pagás justo, sin vuelto. 👌";
  } else {
    hint.textContent = `Vuelto: ${money(val - total)}`;
  }
});

function currentTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = findProduct(id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

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

  // monto en efectivo (opcional, solo si paga en efectivo)
  let cashAmount = null;
  if (paymentMethod === "efectivo") {
    const raw = document.getElementById("cashAmount").value;
    if (raw !== "") {
      cashAmount = Number(raw);
      if (isNaN(cashAmount) || cashAmount < total) {
        errorEl.textContent = `El monto en efectivo no alcanza: el total del pedido es ${money(total)}.`;
        errorEl.classList.add("is-visible");
        return;
      }
    }
  }

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
    p_cash_amount: cashAmount,
  });

  if (error) {
    console.error(error);
    errorEl.textContent = "No pudimos enviar el pedido. Probá de nuevo en unos segundos.";
    errorEl.classList.add("is-visible");
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar pedido";
    return;
  }

  // guardar el pedido en este dispositivo para poder seguirlo después
  try {
    const saved = JSON.parse(localStorage.getItem("hdb_mis_pedidos")) || [];
    saved.push({ id: data, phone: payload.phone });
    localStorage.setItem("hdb_mis_pedidos", JSON.stringify(saved));
  } catch {
    // si el navegador no deja guardar, no pasa nada
  }

  // ir directo a la pantalla de seguimiento del pedido
  const params = new URLSearchParams({ pedido: data, tel: payload.phone });
  if (paymentMethod === "mercado_pago") params.set("mp", "1");
  if (paymentMethod === "efectivo" && cashAmount !== null) params.set("efectivo", cashAmount);
  window.location.href = `seguimiento.html?${params.toString()}`;
});


buildMenu();
updateCartBar();
