// ============================================================
// STAFF.HTML — login, lista de pedidos en tiempo real y
// cambio de estado (aceptar / rechazar / listo / entregado).
// ============================================================

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let orders = [];
let currentFilter = "pendiente";

const loginScreen = document.getElementById("loginScreen");
const panelScreen = document.getElementById("panelScreen");

const STATUS_LABEL = {
  pendiente: "Pendiente",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
  listo: "Listo",
  entregado: "Entregado",
};

function money(n) {
  return "$" + Number(n).toLocaleString("es-AR");
}

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

// ---------- LOGIN ----------
async function checkSession() {
  const { data } = await sb.auth.getSession();
  if (data.session) {
    showPanel();
  } else {
    showLogin();
  }
}

function showLogin() {
  loginScreen.style.display = "flex";
  panelScreen.style.display = "none";
}

function showPanel() {
  loginScreen.style.display = "none";
  panelScreen.style.display = "block";
  loadOrders();
  subscribeRealtime();
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errorEl = document.getElementById("loginError");
  errorEl.classList.remove("is-visible");

  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    errorEl.textContent = "Usuario o contraseña incorrectos.";
    errorEl.classList.add("is-visible");
    return;
  }
  showPanel();
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await sb.auth.signOut();
  showLogin();
});

// ---------- CARGA Y TIEMPO REAL ----------
async function loadOrders() {
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    document.getElementById("orderList").innerHTML =
      '<p class="empty-state">No se pudieron cargar los pedidos.</p>';
    return;
  }
  orders = data;
  renderOrders();
}

function subscribeRealtime() {
  sb.channel("orders-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      (payload) => {
        if (payload.eventType === "INSERT") {
          orders.unshift(payload.new);
        } else if (payload.eventType === "UPDATE") {
          const idx = orders.findIndex((o) => o.id === payload.new.id);
          if (idx !== -1) orders[idx] = payload.new;
        }
        renderOrders(payload.eventType === "INSERT" ? payload.new.id : null);
      }
    )
    .subscribe();
}

// ---------- RENDER ----------
function renderOrders(highlightId) {
  // contadores para las pestañas
  ["pendiente", "aceptado", "listo"].forEach((s) => {
    const el = document.getElementById(`count-${s}`);
    if (el) el.textContent = orders.filter((o) => o.status === s).length;
  });

  const filtered =
    currentFilter === "todos" ? orders : orders.filter((o) => o.status === currentFilter);

  const listEl = document.getElementById("orderList");

  if (filtered.length === 0) {
    listEl.innerHTML = '<p class="empty-state">No hay pedidos acá.</p>';
    return;
  }

  listEl.innerHTML = filtered.map((o) => orderCardHTML(o, o.id === highlightId)).join("");
}

function orderCardHTML(o, isNew) {
  const itemsHTML = o.items
    .map(
      (it) =>
        `<li><span>${it.qty}× ${it.name}${it.variant ? " (" + it.variant + ")" : ""}</span><span>${money(it.subtotal)}</span></li>`
    )
    .join("");

  const deliveryLine =
    o.order_type === "delivery"
      ? `Delivery — ${o.address || "sin dirección"}`
      : "Retiro en el local";

  const paymentLine = o.payment_method === "mercado_pago" ? "Mercado Pago" : "Efectivo";

  return `
    <article class="order-card ${isNew ? "is-new" : ""}" data-id="${o.id}">
      <div class="order-card__top">
        <div>
          <span class="order-card__id">Pedido #${o.id}</span>
          <span class="order-card__time"> · ${fmtTime(o.created_at)}</span>
          <div class="order-card__customer">${escapeHtml(o.customer_name)}</div>
          <div class="order-card__meta">${escapeHtml(o.phone)} · ${deliveryLine} · ${paymentLine}</div>
        </div>
        <span class="status-badge status-badge--${o.status}">${STATUS_LABEL[o.status]}</span>
      </div>

      <ul class="order-card__items">${itemsHTML}</ul>

      ${o.notes ? `<div class="order-card__notes">"${escapeHtml(o.notes)}"</div>` : ""}

      ${
        o.payment_method === "efectivo" && o.cash_amount
          ? `<div class="order-card__cash">💵 Paga con ${money(o.cash_amount)} — vuelto: ${money(o.cash_amount - o.total)}</div>`
          : ""
      }

      <div class="order-card__total">${money(o.total)}</div>

      <div class="order-card__actions">${actionsHTML(o)}</div>
    </article>
  `;
}

function actionsHTML(o) {
  if (o.status === "pendiente") {
    return `
      <button class="btn-accept" data-action="aceptado" data-id="${o.id}">Aceptar</button>
      <button class="btn-reject" data-action="rechazado" data-id="${o.id}">Rechazar</button>
    `;
  }
  if (o.status === "aceptado") {
    return `<button class="btn-advance" data-action="listo" data-id="${o.id}">Marcar listo</button>`;
  }
  if (o.status === "listo") {
    return `<button class="btn-advance" data-action="entregado" data-id="${o.id}">Marcar entregado</button>`;
  }
  return "";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById("orderList").addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const status = btn.dataset.action;
  btn.disabled = true;

  const { error } = await sb.from("orders").update({ status }).eq("id", id);
  if (error) {
    console.error(error);
    btn.disabled = false;
    return;
  }
  const idx = orders.findIndex((o) => o.id === id);
  if (idx !== -1) orders[idx].status = status;
  renderOrders();
});

document.getElementById("statusTabs").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-filter]");
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  document
    .querySelectorAll("#statusTabs button")
    .forEach((b) => b.classList.toggle("is-active", b === btn));
  renderOrders();
});

checkSession();
