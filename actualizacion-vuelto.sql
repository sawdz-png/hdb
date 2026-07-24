-- ============================================================
-- ACTUALIZACIÓN: monto en efectivo / vuelto
-- ============================================================
-- Ejecutar en Supabase: SQL Editor → New query → pegar todo → Run

-- 1) Nueva columna en la tabla de pedidos
alter table public.orders
  add column if not exists cash_amount numeric;

-- 2) Borrar la versión anterior de la función (tenía un parámetro menos)
drop function if exists public.create_order(
  text, text, text, text, text, jsonb, text, numeric
);

-- 3) Nueva función con el monto en efectivo
create or replace function public.create_order(
  p_customer_name text,
  p_phone text,
  p_order_type text,
  p_address text,
  p_payment_method text,
  p_items jsonb,
  p_notes text,
  p_total numeric,
  p_cash_amount numeric default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id bigint;
begin
  -- el monto en efectivo nunca puede ser menor al total
  if p_cash_amount is not null and p_cash_amount < p_total then
    raise exception 'cash_amount menor al total';
  end if;

  insert into public.orders
    (customer_name, phone, order_type, address, payment_method,
     items, notes, total, cash_amount, status)
  values
    (p_customer_name, p_phone, p_order_type, p_address, p_payment_method,
     p_items, p_notes, p_total, p_cash_amount, 'pendiente')
  returning id into new_id;

  return new_id;
end;
$$;

-- Permitir que los clientes (anon) llamen a la función
grant execute on function public.create_order(
  text, text, text, text, text, jsonb, text, numeric, numeric
) to anon;
