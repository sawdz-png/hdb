// ============================================================
// SEGUIMIENTO.HTML — pantalla de estado del pedido en vivo
// (estilo RestoSimple: el pedido recién hecho es protagonista)
// ============================================================

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STORAGE_KEY = "hdb_mis_pedidos";

const STATUS_INFO = {
  pendiente: {
    icon: "🕐",
    title: "Recibimos tu pedido",
    desc: "El local lo está por confirmar. Aguantá un toque.",
    step: 1,
  },
  aceptado: {
    icon: "🔥",
    title: "¡Pedido confirmado!",
    desc: "Ya está en la parrilla. Te avisamos cuando esté listo.",
    step: 2,
  },
  listo: {
    icon: "🍔",
    title: "¡Tu pedido está listo!",
    desc: "Si es retiro, ya podés venir a buscarlo. Si es delivery, está saliendo.",
    step: 3,
  },
  entregado: {
    icon: "✅",
    title: "Pedido entregado",
    desc: "¡Que lo disfrutes! Gracias por bancar al barrio.",
    step: 4,
  },
  rechazado: {
    icon: "😞",
    title: "No pudimos tomar tu pedido",
    desc: "Puede ser por demanda o falta de stock. Llamanos y lo resolvemos.",
    step: 0,
  },
};

const STEP_LABELS = ["Recibido", "En preparación", "Listo", "Entregado"];

function money(n) {
  return "$" + Number(n).toLocaleString("es-AR");
}

function getSavedOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveOrders(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

async function fetchOrder(id, phone) {
  const { data, error } = await sb.rpc("get_order_status", {
    p_order_id: Number(id),
    p_phone: phone,
  });
  if (error || !data || data.length === 0) return null;
  return data[0];
}

// ---------- PANTALLA PROTAGONISTA (un pedido) ----------
const urlParams = new URLSearchParams(window.location.search);
const focusId = urlParams.get("pedido");
const focusPhone = urlParams.get("tel");
const showMp = urlParams.get("mp") === "1";
const cashParam = urlParams.get("efectivo");

function etaHTML(o) {
  if (!o.ready_at || (o.status !== "aceptado" && o.status !== "listo")) return "";
  const ready = new Date(o.ready_at);
  const hhmm = ready.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  const minsLeft = Math.round((ready - Date.now()) / 60000);
  if (o.status === "listo") {
    return `<p class="focus-card__eta">⏱ Listo desde las ${hhmm}</p>`;
  }
  if (minsLeft <= 0) {
    return `<p class="focus-card__eta">⏱ Está por salir en cualquier momento</p>`;
  }
  return `<p class="focus-card__eta">⏱ Estará listo aprox. a las <strong>${hhmm}</strong> (~${minsLeft} min)</p>`;
}

function focusHTML(o) {
  const info = STATUS_INFO[o.status] || STATUS_INFO.pendiente;
  const isRejected = o.status === "rechazado";

  const steps = STEP_LABELS.map((label, i) => {
    const done = !isRejected && info.step >= i + 1;
    const current = !isRejected && info.step === i + 1;
    return `<div class="track-step ${done ? "is-done" : ""} ${current ? "is-current" : ""}">
      <span class="track-step__dot"></span>
      <span class="track-step__label">${label}</span>
    </div>`;
  }).join('<div class="track-step__line"></div>');

  const items = (o.items || [])
    .map(
      (it) =>
        `<li><span>${it.qty}× ${it.name}${it.variant ? " (" + it.variant + ")" : ""}</span><span>${money(it.subtotal)}</span></li>`
    )
    .join("");

  const mpBlock =
    showMp && !isRejected
      ? `<div class="mp-box">
          <h3>Pagá por Mercado Pago</h3>
          <p>Transferí el total al alias:</p>
          <p class="mp-box__alias">${MP_ALIAS}</p>
          <p class="mp-box__holder">Titular: ${MP_TITULAR}</p>
          <p class="mp-box__amount">Total a transferir: ${money(o.total)}</p>
          <button type="button" class="btn btn--ghost" id="copyAliasBtn">Copiar alias</button>
          <p class="mp-box__note">Cuando retires o recibas el pedido, mostrá el comprobante.</p>
        </div>`
      : "";

  const cashBlock =
    cashParam && !isRejected
      ? `<p class="cash-note">${
          Number(cashParam) === Number(o.total)
            ? "Anotado: pagás justo, sin vuelto."
            : `Anotado: pagás con ${money(Number(cashParam))} — te llevamos ${money(Number(cashParam) - o.total)} de vuelto.`
        }</p>`
      : "";

  return `
    <div class="focus-card ${isRejected ? "is-rejected" : ""}">
      <div class="focus-card__icon">${info.icon}</div>
      <h1 class="focus-card__title">${info.title}</h1>
      <p class="focus-card__desc">${info.desc}</p>
      <p class="focus-card__id">Pedido #${o.id}</p>
      ${etaHTML(o)}

      ${isRejected ? "" : `<div class="track-steps track-steps--big">${steps}</div>`}

      <ul class="focus-card__items">${items}</ul>
      <div class="focus-card__total"><span>Total</span><span>${money(o.total)}</span></div>

      ${mpBlock}
      ${cashBlock}

      <p class="focus-card__live">● Actualizando en vivo</p>
    </div>
  `;
}

async function renderFocus() {
  const container = document.getElementById("focusContainer");
  const o = await fetchOrder(focusId, focusPhone);
  if (!o) {
    container.innerHTML = '<p class="empty-state">No pudimos cargar el pedido. Probá recargar la página.</p>';
    return;
  }
  container.innerHTML = focusHTML(o);

  const copyBtn = document.getElementById("copyAliasBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(MP_ALIAS);
        copyBtn.textContent = "¡Alias copiado!";
      } catch {}
    });
  }

  // cuando ya se entregó (o rechazó), dejamos de refrescar
  if (o.status === "entregado" || o.status === "rechazado") {
    clearInterval(focusTimer);
  }
}

// ---------- LISTA "MIS PEDIDOS" ----------
function listCardHTML(o) {
  const info = STATUS_INFO[o.status] || STATUS_INFO.pendiente;
  const when = new Date(o.created_at).toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });
  return `
    <a class="track-card ${o.status === "rechazado" ? "is-rejected" : ""}"
       href="seguimiento.html?pedido=${o.id}&tel=${encodeURIComponent(o._phone)}">
      <div class="track-card__top">
        <span class="track-card__id">${info.icon} Pedido #${o.id}</span>
        <span class="track-card__time">${when}</span>
      </div>
      <p class="track-card__desc">${info.title}</p>
      <div class="track-card__total">${money(o.total)}</div>
    </a>
  `;
}

async function renderList() {
  const container = document.getElementById("myOrders");
  if (!container) return;
  const saved = getSavedOrders();

  if (saved.length === 0) {
    container.innerHTML =
      '<p class="empty-state">Todavía no hiciste pedidos desde este dispositivo.<br><a href="pedido.html" class="btn btn--gold" style="margin-top:16px; display:inline-block;">Hacer mi primer pedido</a></p>';
    return;
  }

  const orders = [];
  for (const s of saved) {
    const o = await fetchOrder(s.id, s.phone);
    if (o) {
      o._phone = s.phone;
      orders.push(o);
    }
  }

  if (orders.length === 0) {
    container.innerHTML = '<p class="empty-state">No pudimos cargar tus pedidos. Probá recargar la página.</p>';
    return;
  }

  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  container.innerHTML = orders.map(listCardHTML).join("");
}

// ---------- BÚSQUEDA MANUAL ----------
const searchForm = document.getElementById("searchForm");
if (searchForm) {
  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("searchError");
    errorEl.classList.remove("is-visible");

    const id = Number(document.getElementById("searchId").value);
    const phone = document.getElementById("searchPhone").value.trim();

    const o = await fetchOrder(id, phone);
    if (!o) {
      errorEl.textContent = "No encontramos ese pedido. Revisá el número y el teléfono.";
      errorEl.classList.add("is-visible");
      return;
    }

    const saved = getSavedOrders();
    if (!saved.some((s) => s.id === id)) {
      saved.push({ id, phone });
      saveOrders(saved);
    }
    window.location.href = `seguimiento.html?pedido=${id}&tel=${encodeURIComponent(phone)}`;
  });
}

// ---------- ARRANQUE ----------
let focusTimer = null;

if (focusId && focusPhone) {
  // modo protagonista: mostrar solo ese pedido, en vivo
  document.getElementById("listMode").style.display = "none";
  document.getElementById("focusContainer").style.display = "block";
  renderFocus();
  focusTimer = setInterval(renderFocus, 10000);
} else {
  // modo lista: todos los pedidos del dispositivo
  renderList();
  setInterval(renderList, 15000);
}
