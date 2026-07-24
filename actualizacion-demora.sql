-- ============================================================
-- ACTUALIZACIÓN: demora estimada
-- ============================================================
-- Pegar todo esto en Supabase → SQL Editor → New query → Run

-- 1) Columna con la hora prometida (la fija el local al aceptar)
alter table public.orders
  add column if not exists ready_at timestamptz;

-- 2) La función de seguimiento ahora también devuelve esa hora
drop function if exists public.get_order_status(bigint, text);

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
  order_type text,
  ready_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select o.id, o.created_at, o.status, o.total, o.items, o.order_type, o.ready_at
  from public.orders o
  where o.id = p_order_id
    and o.phone = p_phone;
$$;

grant execute on function public.get_order_status(bigint, text) to anon;
