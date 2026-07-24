// ============================================================
// CONFIGURACIÓN DE SUPABASE
// ============================================================
// Completá estos dos valores con los datos de TU proyecto de Supabase:
// Project Settings → API → "Project URL" y "anon public" key.
//
// Es seguro que estos valores queden visibles en el código (así
// funciona Supabase): el que protege los datos es el RLS que
// configuramos en supabase-schema.sql, no el secreto de esta clave.

// ============================================================
// CONFIGURACIÓN DE SUPABASE
// ============================================================
const SUPABASE_URL = "https://zgrymjtliudlhepchiga.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncnltanRsaXVkbGhlcGNoaWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NjMwOTgsImV4cCI6MjEwMDQzOTA5OH0.xnmarb4Y1QX8Z62lRZchC7Ny4xRRQ430UQLxWWr_tlA";

// ============================================================
// MERCADO PAGO
// ============================================================
// Alias (o CVU) de la cuenta que recibe las transferencias.
// ⚠️ CAMBIAR por el alias real del local:
const MP_ALIAS = "hamburguesa.de.barrio";
// Nombre del titular que va a ver el cliente al transferir:
const MP_TITULAR = "Hamburguesa de Barrio";
