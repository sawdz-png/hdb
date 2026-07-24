-- ============================================================
-- ACTUALIZACIÓN: seguimiento de pedidos para clientes
-- (versión 2 — con el detalle del pedido)
-- ============================================================
-- Pegar todo esto en Supabase → SQL Editor → New query → Run

-- Si ya habías corrido la versión anterior, esto la reemplaza.
drop function if exists public.get_order_status(bigint, text);

-- Función que le muestra a un cliente SU pedido completo.
-- Solo funciona con número de pedido + teléfono correcto,
-- así nadie puede espiar pedidos ajenos.
create or replace function public.get_order_status(
  p_order_id bigint,
  p_phone text
)
returns table (
  id bigint,
  created_at timestamptz,
  status text,
  total numeric,
  items jsonb,
  order_type text
)
language sql
security definer
set search_path = public
stable
as $$
  select o.id, o.created_at, o.status, o.total, o.items, o.order_type
  from public.orders o
  where o.id = p_order_id
    and o.phone = p_phone;
$$;

grant execute on function public.get_order_status(bigint, text) to anon;
